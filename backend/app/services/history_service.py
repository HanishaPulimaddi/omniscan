from datetime import date, datetime, time
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, cast, String
from math import ceil
from app.database.models import Scan, Report


# --------------------------------------------------
# GET ALL HISTORY (Legacy - kept for backward compatibility)
# --------------------------------------------------
def get_user_history(db: Session, user_id: int):
    records = (
        db.query(Scan, Report)
        .join(Report, Report.scan_id == Scan.id)
        .filter(Scan.user_id == user_id)
        .order_by(Scan.created_at.desc())
        .all()
    )

    history = []

    for scan, report in records:
        history.append({
            "scan_id": scan.id,
            "file_name": scan.file_name,      # optional
            "image_path": scan.file_path,     # used for View Scan
            "uploaded_at": scan.created_at.isoformat() if scan.created_at else None,
            "report": report.report_text,
            "scores": report.scores
        })

    return history


# --------------------------------------------------
# GET PAGINATED HISTORY (Production-grade pagination with search and date filtering)
# --------------------------------------------------
def get_user_history_paginated(
    db: Session, 
    user_id: int, 
    page: int = 1, 
    page_size: int = 10, 
    search: str = None,
    date: date = None
):
    """
    Fetch paginated user history with total count, optional search, and optional single-date filtering.
    
    SECURITY: user_id filter is ALWAYS applied FIRST to ensure user isolation.
    Search and date filters are applied ONLY within the current user's records.
    
    Args:
        db: Database session
        user_id: User ID to filter by (MANDATORY - ensures user isolation)
        page: Page number (1-indexed)
        page_size: Number of items per page (max 50)
        search: Optional search term (searches in file_name, report_text, created_at)
        date: Optional date filter (filters records created on this specific day)
             When provided, filters: created_at >= date 00:00:00 AND created_at <= date 23:59:59
    
    Returns:
        dict with items, page, page_size, total_items, total_pages
    """
    # Enforce max page size
    page_size = min(page_size, 50)
    page = max(1, page)  # Ensure page is at least 1
    
    # Calculate offset
    offset = (page - 1) * page_size
    
    # Base query with MANDATORY user_id filter (security: always applied first)
    base_query = (
        db.query(Scan, Report)
        .join(Report, Report.scan_id == Scan.id)
        .filter(Scan.user_id == user_id)  # CRITICAL: User isolation enforced here
    )
    
    # Apply single date filter if provided (only within this user's records)
    # Date filtering is applied BEFORE search to maintain proper query structure
    # Filters records created on the specified date (full day: 00:00:00 to 23:59:59.999999)
    if date:
        # Convert date to datetime at start of day (00:00:00) for inclusive start
        start_datetime = datetime.combine(date, datetime.min.time())
        # Convert date to datetime at end of day (23:59:59.999999) for inclusive end
        end_datetime = datetime.combine(date, time(23, 59, 59, 999999))
        # Filter records created on this specific day
        base_query = base_query.filter(
            Scan.created_at >= start_datetime,
            Scan.created_at <= end_datetime
        )
    
    # Apply search filter if provided (only within this user's records)
    if search and search.strip():
        search_term = f"%{search.strip()}%"
        # Case-insensitive search across multiple fields
        search_filter = or_(
            Scan.file_name.ilike(search_term),
            Report.report_text.ilike(search_term),
            cast(Scan.created_at, String).ilike(search_term)
        )
        base_query = base_query.filter(search_filter)
    
    # Get total count (with date and search filters applied if provided)
    total_count = (
        db.query(func.count(Scan.id))
        .join(Report, Report.scan_id == Scan.id)
        .filter(Scan.user_id == user_id)  # CRITICAL: User isolation enforced here
    )
    
    # Apply single date filter to count query if provided
    if date:
        start_datetime = datetime.combine(date, datetime.min.time())
        end_datetime = datetime.combine(date, time(23, 59, 59, 999999))
        total_count = total_count.filter(
            Scan.created_at >= start_datetime,
            Scan.created_at <= end_datetime
        )
    
    # Apply search to count query if provided
    if search and search.strip():
        search_term = f"%{search.strip()}%"
        search_filter = or_(
            Scan.file_name.ilike(search_term),
            Report.report_text.ilike(search_term),
            cast(Scan.created_at, String).ilike(search_term)
        )
        total_count = total_count.filter(search_filter)
    
    total_count = total_count.scalar()
    
    # Get paginated records (with search applied if provided)
    records = (
        base_query
        .order_by(Scan.created_at.desc())
        .limit(page_size)
        .offset(offset)
        .all()
    )
    
    # Build history items
    history = []
    for scan, report in records:
        history.append({
            "scan_id": scan.id,
            "file_name": scan.file_name,
            "image_path": scan.file_path,
            "uploaded_at": scan.created_at.isoformat() if scan.created_at else None,
            "report": report.report_text,
            "scores": report.scores
        })
    
    # Calculate total pages
    total_pages = ceil(total_count / page_size) if total_count > 0 else 0
    
    return {
        "items": history,
        "page": page,
        "page_size": page_size,
        "total_items": total_count,
        "total_pages": total_pages
    }


# --------------------------------------------------
# ✅ GET SINGLE REPORT (THIS FIXES /history/{id})
# --------------------------------------------------
def get_single_history(db: Session, user_id: int, scan_id: int):
    record = (
        db.query(Scan, Report)
        .join(Report, Report.scan_id == Scan.id)
        .filter(
            Scan.user_id == user_id,
            Scan.id == scan_id
        )
        .first()
    )

    if not record:
        return None

    scan, report = record

    return {
        "scan_id": scan.id,
        "file_name": scan.file_name,
        "uploaded_at": scan.created_at.isoformat() if scan.created_at else None,
        "report": report.report_text,
        "scores": report.scores
    }
