from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.database.models import User
from app.auth.jwt_handler import create_access_token, get_current_user
from app.auth.hashing import hash_password, verify_password, is_hashed
from app.rate_limit import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])


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
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


# -----------------------------
# Register User
# -----------------------------
@router.post("/register")
@limiter.limit("5/minute")
def register(request: Request, user: UserRegister, db: Session = Depends(get_db)):

    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = User(
        name=user.name,
        phone=user.phone,
        username=user.username,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully!"}


# -----------------------------
# Login
# -----------------------------
@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, data: UserLogin, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.username == data.username).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid username")

    if is_hashed(user.password):
        if not verify_password(data.password, user.password):
            raise HTTPException(status_code=400, detail="Incorrect password")
    else:
        # Legacy plaintext account from before hashing was added.
        # Verify directly once, then migrate it to a bcrypt hash.
        if user.password != data.password:
            raise HTTPException(status_code=400, detail="Incorrect password")
        user.password = hash_password(data.password)
        db.commit()

    token = create_access_token({
        "user_id": user.id,
        "username": user.username
    })

    return {
        "message": "Login successful",
        "access_token": token
    }


# -----------------------------
# Current User Profile
# -----------------------------
@router.get("/me")
def get_me(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user["user_id"]).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "name": user.name,
        "username": user.username,
        "phone": user.phone,
        "created_at": user.created_at
    }
