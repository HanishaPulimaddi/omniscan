from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session
import jwt

from app.database.connection import SessionLocal
from app.database.models import User
from app.auth.jwt_handler import create_access_token

# ⚠ MUST match jwt_handler.py
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# -----------------------------
# DB Dependency
# -----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------
# Pydantic Schemas
# -----------------------------
class UserRegister(BaseModel):
    name: str
    phone: str | None = None
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


# -----------------------------
# Register User (Plain Password)
# -----------------------------
@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):

    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        name=user.name,
        phone=user.phone,
        username=user.username,
        email=user.email,
        password=user.password  # ⚠ Plain text as requested
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully!"}


# -----------------------------
# Login (Plain Password)
# -----------------------------
@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.username == data.username).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid username")

    if user.password != data.password:
        raise HTTPException(status_code=400, detail="Incorrect password")

    token = create_access_token({
        "user_id": user.id,
        "username": user.username
    })

    return {
        "message": "Login successful",
        "access_token": token
    }


# -----------------------------
# 🔐 GET CURRENT USER (NEW)
# -----------------------------
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user
