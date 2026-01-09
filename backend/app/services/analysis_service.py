from sqlalchemy import text
from app.database.connection import SessionLocal
import json


class AnalysisService:

    @staticmethod
    def save_report(scan_id: int, scores: dict, report_text: str):
        db = SessionLocal()
        try:
            # Fallback for missing report text
            if not report_text:
                report_text = "No meaningful report generated."

            # 1. Check if a report already exists for this scan
            check_q = text("SELECT id FROM reports WHERE scan_id = :sid")
            existing = db.execute(check_q, {"sid": scan_id}).fetchone()

            if existing:
                # existing is a Row → retrieve index 0
                return existing[0]

            # Convert scores to JSON string safely
            try:
                scores_json = json.dumps(scores)
            except Exception:
                scores_json = "{}"

            # 2. Insert new report
            insert_q = text("""
                INSERT INTO reports (scan_id, scores, report_text)
                VALUES (:sid, :scores, :rtext)
                RETURNING id
            """)

            result = db.execute(insert_q, {
                "sid": scan_id,
                "scores": scores_json,
                "rtext": report_text
            })

            new_id = result.fetchone()[0]

            db.commit()
            return new_id

        finally:
            db.close()   # Always close session
