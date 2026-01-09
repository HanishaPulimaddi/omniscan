from typing import Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.auth.jwt_handler import get_current_user
from app.services.history_service import (
    get_user_history,
    get_user_history_paginated,
    get_single_history
)

router = APIRouter(
    prefix="/history",
    tags=["History"]
)

# --------------------------------------------------
# GET PAGINATED HISTORY (Production-grade pagination with search and single-date filtering)
# --------------------------------------------------
@router.get("/")
def fetch_user_history(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(5, ge=1, le=50, description="Number of items per page (max 50)"),
    search: Optional[str] = Query(None, description="Search term (searches in file name, report text, and date)"),
    date_str: Optional[str] = Query(None, alias="date", description="Date filter - shows records created on this specific date (format: YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Fetch paginated user analysis history with optional search and single-date filtering.
    
    SECURITY: All filters (search, date) are ALWAYS scoped to the logged-in user's records only.
    The user_id from JWT token is applied as a mandatory filter BEFORE any other filters.
    
    Returns a structured response with:
    - items: List of analysis records
    - page: Current page number
    - page_size: Items per page
    - total_items: Total number of analyses (matching filters if provided)
    - total_pages: Total number of pages
    
    Search fields:
    - File name
    - Report text
    - Created date (as text)
    
    Date filtering:
    - date_str: Filter records created on a specific date (MUST be in ISO format: YYYY-MM-DD)
    - When provided, filters: created_at >= date 00:00:00 AND created_at <= date 23:59:59
    - Returns all records for that full day
    - Dates are explicitly parsed and normalized to ensure UTC consistency
    - Invalid date formats return 400 Bad Request
    """
    try:
        user_id = current_user["user_id"]
        
        # Explicitly parse and validate date string to ensure ISO format (YYYY-MM-DD)
        # This prevents locale-based parsing ambiguity and ensures consistent date handling
        # CRITICAL: We accept as string first, then parse explicitly to avoid any format ambiguity
        # The Query alias="date" maps the query parameter ?date=... to this date_str parameter
        parsed_date = None
        if date_str:
            try:
                # Parse ISO format date string (YYYY-MM-DD)
                # This format is unambiguous and locale-independent
                # strptime ensures we only accept the exact ISO format
                parsed_date = datetime.strptime(date_str.strip(), "%Y-%m-%d").date()
            except ValueError:
                # Invalid date format - return clear error message
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid date format: '{date_str}'. Expected format: YYYY-MM-DD (e.g., 2025-12-12)"
                )
        
        # Pass all filters to service (user_id filter is enforced in service layer)
        result = get_user_history_paginated(
            db, 
            user_id, 
            page=page, 
            page_size=page_size,
            search=search,
            date=parsed_date
        )
        return result
    except HTTPException:
        # Re-raise HTTP exceptions (like 400 for invalid date format)
        raise
    except Exception as e:
        # Log the error for debugging
        import logging
        logging.error(f"Error fetching history for user {current_user.get('user_id')}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")


# --------------------------------------------------
# ✅ GET SINGLE REPORT (THIS FIXES THE ISSUE)
# --------------------------------------------------
@router.get("/{scan_id}")
def fetch_single_history(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]

    record = get_single_history(db, user_id, scan_id)

    if not record:
        raise HTTPException(status_code=404, detail="Report not found")

    return record
