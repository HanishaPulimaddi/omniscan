from fastapi import APIRouter, UploadFile, File, Depends
from app.services.file_service import FileService
from app.auth.jwt_handler import get_current_user

router = APIRouter(prefix="/files", tags=["File Upload"])

@router.post("/upload")
async def upload_scan(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    result = await FileService.save_scan(file, user_id)
    return result
