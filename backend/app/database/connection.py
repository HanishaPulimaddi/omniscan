from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print("Loaded DB URL:", DATABASE_URL)

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
# Global DB connection (RAW SQL)
# Used by file_service, analysis_service, etc.
# ----------------------------
db = engine.connect()

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
