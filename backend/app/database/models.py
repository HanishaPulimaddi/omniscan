from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


# ===========================
# USER TABLE
# ===========================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)
    phone = Column(String(20))

    username = Column(String, unique=True, nullable=False, index=True)

    password = Column(String(255), nullable=False)

    created_at = Column(TIMESTAMP, server_default=func.now())

    scans = relationship(
        "Scan",
        back_populates="user",
        cascade="all, delete-orphan"
    )


# ===========================
# SCAN FILES TABLE
# ===========================
class Scan(Base):
    __tablename__ = "scan_files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    file_name = Column(String(255), nullable=False)

    # ✅ FIXED: MUST be file_path (NOT image_path)
    file_path = Column(Text, nullable=False)

    file_hash = Column(String(64), index=True, nullable=False)

    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="scans")
    report = relationship(
        "Report",
        back_populates="scan",
        uselist=False,
        cascade="all, delete-orphan"
    )


# ===========================
# REPORT TABLE
# ===========================
class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scan_files.id", ondelete="CASCADE"), index=True)

    scores = Column(JSON)
    report_text = Column(Text)

    created_at = Column(TIMESTAMP, server_default=func.now())

    scan = relationship("Scan", back_populates="report")
