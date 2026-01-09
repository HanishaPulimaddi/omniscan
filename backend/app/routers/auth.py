from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def login_test():
    return {"message": "Auth endpoint working"}
