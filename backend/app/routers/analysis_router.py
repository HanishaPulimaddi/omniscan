import io
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request
from PIL import Image
from app.auth.jwt_handler import get_current_user
from app.rate_limit import limiter
from app.services.analysis_service import AnalysisService
from app.services.file_service import FileService
from app.services.image_analyzer import analyze_image

router = APIRouter(prefix="/analyze", tags=["Analysis"])

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10MB


@router.post("/image")
@limiter.limit("20/minute")
async def analyze_scan(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]

    # 0️⃣ Validate before anything gets written to storage
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")

    try:
        Image.open(io.BytesIO(file_bytes)).verify()
    except Exception:
        raise HTTPException(status_code=400, detail="File is not a valid image")

    file.file.seek(0)

    # 1️⃣ Save file or detect duplicate
    save_result = await FileService.save_scan(file, user_id)
    scan_id = save_result["file_id"]
    is_duplicate = save_result["status"] == "duplicate"

    # 2️⃣ Duplicate: return the already-generated report, skip re-analysis entirely
    if is_duplicate:
        existing = AnalysisService.get_report_by_scan(scan_id)
        if existing:
            return {
                "scan_id": scan_id,
                "report_id": existing["report_id"],
                "scores": existing["scores"],
                "report": existing["report_text"],
                "duplicate": True
            }

    # 3️⃣ Run AI analysis
    file_bytes = await file.read()
    file.file.seek(0)
    analysis = await analyze_image(file_bytes)

    # 4️⃣ Save report — only when generation actually succeeded. Persisting
    # a failure here would permanently cache it: the duplicate check above
    # would replay this exact failure on every future upload of the same
    # image, even after the underlying issue is fixed.
    report_id = None
    if analysis["report"]:
        report_id = AnalysisService.save_report(
            scan_id,
            analysis["scores"],
            analysis["report"]
        )

    # 5️⃣ Respond to frontend
    return {
        "scan_id": scan_id,
        "report_id": report_id,
        "scores": analysis["scores"],
        "report": analysis["report"] or "Report generation failed. Please try again.",
        "duplicate": is_duplicate
    }
