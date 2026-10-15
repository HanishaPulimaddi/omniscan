import os
import re
import uuid
from sqlalchemy import text
from app.database.connection import SessionLocal
from app.database.file_hash import compute_file_hash
from app.services.storage import save_scan_file

_ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff", ".webp"}


def _sanitize_filename(filename: str) -> str:
    # Strip any directory components (handles both "/" and "\" separators,
    # so a payload like "..\\..\\evil.py" can't escape UPLOAD_DIR on any OS)
    filename = os.path.basename(filename.replace("\\", "/"))
    # Whitelist safe characters only
    filename = re.sub(r"[^A-Za-z0-9._-]", "_", filename)
    return filename or "upload"


def _safe_extension(filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    return ext if ext in _ALLOWED_EXTENSIONS else ""


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

            # 🛡️ Server-generated storage name: the client-supplied filename
            # is untrusted input, so only its (whitelisted) extension is
            # reused — the name itself is a UUID, guaranteeing uniqueness
            # and giving no attacker-controlled content to the storage key.
            original_name = _sanitize_filename(file.filename)
            ext = _safe_extension(original_name)
            storage_filename = f"{uuid.uuid4().hex}{ext}"

            url_path = save_scan_file(file_bytes, storage_filename)

            # Save DB record
            insert_q = text("""
                INSERT INTO scan_files (user_id, file_name, file_path, file_hash)
                VALUES (:uid, :name, :path, :hash)
                RETURNING id
            """)

            new_id = db.execute(insert_q, {
                "uid": user_id,
                "name": original_name,  # original filename, kept for display only
                "path": url_path,       # ✅ URL PATH (NOT filesystem)
                "hash": file_hash
            }).fetchone()[0]

            db.commit()

            return {
                "status": "uploaded",
                "file_id": new_id,
                "file_name": original_name,
                "file_path": url_path
            }

        finally:
            db.close()
