from fastapi import APIRouter, UploadFile, File, Depends
from app.auth.jwt_handler import get_current_user
from app.services.analysis_service import AnalysisService
from app.services.file_service import FileService
from app.services.image_analyzer import analyze_image

router = APIRouter(prefix="/api/analyze", tags=["Analysis"])


@router.post("/image")
async def analyze_scan(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]

    # 1️⃣ Save file or detect duplicate
    save_result = await FileService.save_scan(file, user_id)
    scan_id = save_result["file_id"]

    # 2️⃣ Run AI analysis
    file_bytes = await file.read()
    file.file.seek(0)
    analysis = await analyze_image(file_bytes)

    # 3️⃣ Save report
    report_id = AnalysisService.save_report(
        scan_id,
        analysis["scores"],
        analysis["report"]
    )

    # 4️⃣ Respond to frontend
    return {
        "scan_id": scan_id,
        "report_id": report_id,
        "scores": analysis["scores"],
        "report": analysis["report"],
        "duplicate": (save_result["status"] == "duplicate")
    }
