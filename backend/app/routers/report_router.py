from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import Report

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

@router.get("/{report_id}")
def get_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    """
    Fetch analysis report by report_id
    """

    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "scores": report.scores,
        "report_text": report.report_text,
        "created_at": report.created_at
    }
