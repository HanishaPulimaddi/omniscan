import os
from sqlalchemy import text
from app.database.connection import SessionLocal
from app.utils.file_hash import compute_file_hash

UPLOAD_DIR = "app/uploads/scans"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class FileService:

    @staticmethod
    async def save_scan(file, user_id: int):
        db = SessionLocal()
        try:
            # Read file once
            file_bytes = await file.read()
            if not file_bytes:
                return {"status": "error", "message": "Empty file"}

            file.file.seek(0)

            # 🔐 Hash for duplicate detection (KEEP THIS)
            file_hash = compute_file_hash(file_bytes)

            # 🔎 Check duplicate for same user
            check_q = text("""
                SELECT id, file_path
                FROM scan_files
                WHERE file_hash = :h AND user_id = :uid
            """)
            existing = db.execute(
                check_q, {"h": file_hash, "uid": user_id}
            ).fetchone()

            if existing:
                return {
                    "status": "duplicate",
                    "file_id": existing[0],
                    "file_path": existing[1]
                }

            # ==============================
            # ✅ USE ORIGINAL FILENAME
            # ==============================
            original_name = file.filename
            name, ext = os.path.splitext(original_name)

            filename = original_name
            counter = 1

            # 🛡️ Prevent overwrite
            while os.path.exists(os.path.join(UPLOAD_DIR, filename)):
                filename = f"{name}_{counter}{ext}"
                counter += 1

            # 📁 Filesystem path
            fs_path = os.path.join(UPLOAD_DIR, filename)

            # 🌐 URL path (what frontend uses)
            url_path = f"/uploads/scans/{filename}"

            # Save file
            with open(fs_path, "wb") as f:
                f.write(file_bytes)

            # Save DB record
            insert_q = text("""
                INSERT INTO scan_files (user_id, file_name, file_path, file_hash)
                VALUES (:uid, :name, :path, :hash)
                RETURNING id
            """)

            new_id = db.execute(insert_q, {
                "uid": user_id,
                "name": filename,      # stored final filename
                "path": url_path,      # ✅ URL PATH (NOT filesystem)
                "hash": file_hash
            }).fetchone()[0]

            db.commit()

            return {
                "status": "uploaded",
                "file_id": new_id,
                "file_name": filename,
                "file_path": url_path
            }

        finally:
            db.close()
