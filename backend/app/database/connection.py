from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set — check your .env file")

# ----------------------------
# Create engine
# ----------------------------
engine = create_engine(DATABASE_URL)

# ----------------------------
# Session factory (ORM usage)
# ----------------------------
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False
)

# ----------------------------
# Declarative base
# ----------------------------
Base = declarative_base()

# ----------------------------
# ✅ ADD THIS (FASTAPI DEPENDENCY)
# ----------------------------
def get_db():
    """
    FastAPI dependency that provides a SQLAlchemy session
    """
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()
