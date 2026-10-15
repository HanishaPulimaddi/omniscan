import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CalendarDays, ChevronLeft, ChevronRight, FileText, ImageIcon, Search, X } from "lucide-react";
import type { AxiosError } from "axios";
import apiClient, { API_BASE } from "../services/apiClient";
import { parseScores, prettyLabel, riskOf, topFindings } from "../lib/scores";

// Pagination configuration
const PAGE_SIZE = 5;
const SEARCH_DEBOUNCE_MS = 400; // Debounce delay for search input

type HistoryItem = {
  scan_id: number;
  file_name?: string;
  uploaded_at: string | null;
  report: string;
  scores: unknown;
};

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  // Search state
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState(""); // For immediate UI updates
  
  // Date filter state
  // NOTE: Native <input type="date"> cannot be forced to MM/DD/YYYY format
  // due to browser locale limitations. We use a controlled text input instead.
  const [displayDate, setDisplayDate] = useState<string>(""); // MM/DD/YYYY format for UI
  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null); // YYYY-MM-DD format for API

  // Parse MM/DD/YYYY format and convert to ISO format (YYYY-MM-DD)
  // Validates: month (01-12), day (01-31), year (valid number)
  const parseMMDDYYYYToISO = (dateString: string): string | null => {
    if (!dateString || !dateString.trim()) return null;
    
    // Remove any whitespace
    const cleaned = dateString.trim();
    
    // Match MM/DD/YYYY format (allows single or double digits with slashes)
    const mmddyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = cleaned.match(mmddyyyyPattern);
    
    if (!match) {
      return null; // Invalid format
    }
    
    const [, monthStr, dayStr, yearStr] = match;
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    const year = parseInt(yearStr, 10);
    
    // Validate month (01-12)
    if (month < 1 || month > 12) {
      return null;
    }
    
    // Validate day (01-31) - basic check, doesn't validate month-specific days
    if (day < 1 || day > 31) {
      return null;
    }
    
    // Validate year (reasonable range)
    if (year < 1900 || year > 2100) {
      return null;
    }
    
    // Convert to ISO format (YYYY-MM-DD)
    const monthPadded = String(month).padStart(2, '0');
    const dayPadded = String(day).padStart(2, '0');
    
    // Additional validation: check if the date is actually valid
    // (e.g., Feb 30 is invalid)
    const dateObj = new Date(year, month - 1, day);
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getDate() !== day
    ) {
      return null; // Invalid date (e.g., Feb 30)
    }
    
    return `${year}-${monthPadded}-${dayPadded}`;
  };

  const fetchHistory = async (
    page: number = 1, 
    searchTerm: string = "",
    dateFilter: string | null = null
  ) => {
    try {
      setLoading(true);
      setError("");

      // Build query params, including optional search and single-date filter
      // (dateFilter is guaranteed ISO format YYYY-MM-DD by the caller)
      const params: Record<string, string | number> = {
        page,
        page_size: PAGE_SIZE,
      };
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (dateFilter) {
        params.date = dateFilter;
      }

      const response = await apiClient.get("/history/", { params });
      const data = response.data;

      // Handle paginated response structure
      if (data && data.items && Array.isArray(data.items)) {
        setHistory(data.items);
        setCurrentPage(data.page || page);
        setTotalPages(data.total_pages || 0);
        setTotalItems(data.total_items || 0);
      } else if (Array.isArray(data)) {
        // Fallback for legacy array response
        setHistory(data);
        setTotalPages(1);
        setTotalItems(data.length);
      } else {
        console.warn("Unexpected response format:", data);
        setHistory([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("History fetch error:", err);
      setError((err as Error).message || "Failed to load history");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect - resets page to 1 when search changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1); // Always reset to page 1 when search term changes
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  // Fetch history when page, search, or date filter changes
  useEffect(() => {
    fetchHistory(currentPage, search, selectedDateISO);
  }, [currentPage, search, selectedDateISO]);

  // Extract first 2 sentences for summary
  const getSummary = (text: string) => {
    if (!text) return "No summary available.";
    return text.split(".").slice(0, 2).join(".") + ".";
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setCurrentPage(1);
  };

  // Handle date input change (MM/DD/YYYY format)
  // NOTE: We use a text input instead of native date input because
  // native date inputs cannot be forced to MM/DD/YYYY format due to browser locale
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayDate(inputValue); // Update display immediately for responsive UI
    
    // Parse MM/DD/YYYY to ISO format (YYYY-MM-DD)
    const isoDate = parseMMDDYYYYToISO(inputValue);
    
    if (isoDate) {
      // Valid date - update ISO date for API call
      setSelectedDateISO(isoDate);
      setCurrentPage(1); // Reset to page 1 when date filter changes
    } else if (inputValue === "") {
      // Empty input - clear the filter
      setSelectedDateISO(null);
      setCurrentPage(1);
    }
    // If invalid format but not empty, keep displayDate but don't update selectedDateISO
    // This allows user to continue typing without losing their input
  };

  const handleClearDate = () => {
    setDisplayDate("");
    setSelectedDateISO(null);
    setCurrentPage(1);
  };

  // The endpoint call itself needs the Bearer-token auth header (via
  // apiClient), but the URL it returns doesn't — a presigned S3 URL is
  // itself the credential, and the local path is served by our own API.
  // So we just resolve it and hand it to the browser as a plain navigation.
  const handleViewScan = async (scanId: number) => {
    try {
      const res = await apiClient.get(`/history/${scanId}/image-url`);
      const url = res.data.url as string;
      const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
      window.open(fullUrl, "_blank", "noreferrer");
    } catch (err) {
      if ((err as AxiosError).response?.status === 401) return; // apiClient already redirects to /login
      console.error("Failed to load scan image:", err);
      setError("Failed to load scan image.");
    }
  };

  const dateInvalid = Boolean(displayDate && !selectedDateISO && displayDate.trim() !== "");
  const lastPage = totalPages || 1;

  // Up to five page numbers, centred on the current page where possible.
  const pageNumbers = Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
    if (lastPage <= 5 || currentPage <= 3) return i + 1;
    if (currentPage >= lastPage - 2) return lastPage - 4 + i;
    return currentPage - 2 + i;
  });

  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">History</p>
          <h1>Your analyses</h1>
          <p className="lead">Search past reports by finding, file name or date, and reopen any scan.</p>
        </div>
      </div>

      {/* Search + date filter */}
      {/* NOTE: Using text input instead of native date input because native
          date inputs cannot be forced to MM/DD/YYYY format due to browser locale.
          We manually parse MM/DD/YYYY and convert to ISO format for the API. */}
      <div className="toolbar">
        <div className="input-icon search">
          <Search size={17} />
          <input
            className="input"
            type="text"
            placeholder="Search within your reports…"
            value={searchInput}
            onChange={handleSearchChange}
            aria-label="Search reports"
          />
          {searchInput && (
            <button className="icon-btn clear-btn" onClick={handleClearSearch} title="Clear search">
              <X size={15} />
            </button>
          )}
        </div>

        <div className="date">
          <div className="input-icon">
            <CalendarDays size={17} />
            <input
              id="selected-date"
              className={`input${dateInvalid ? " invalid" : ""}`}
              type="text"
              placeholder="MM/DD/YYYY"
              value={displayDate}
              onChange={handleDateChange}
              maxLength={10}
              aria-label="Filter by date"
            />
            {displayDate && (
              <button className="icon-btn clear-btn" onClick={handleClearDate} title="Clear date filter">
                <X size={15} />
              </button>
            )}
          </div>
          {dateInvalid && <p className="hint-error">Use MM/DD/YYYY, e.g. 12/25/2025</p>}
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {!(error && !loading && history.length === 0) && (
        <div className="list">
          {loading ? (
            <div className="loading-block">
              <span className="spinner" /> Loading history…
            </div>
          ) : history.length === 0 ? (
            <div className="empty">
              <h3>
                {search || selectedDateISO
                  ? selectedDateISO
                    ? "No records found for selected date"
                    : "No records match your filters"
                  : "No analysis history yet"}
              </h3>
              <p style={{ marginBottom: 20 }}>
                {search || selectedDateISO
                  ? "Try a different search term or clear the date filter."
                  : "Analyze your first chest X-ray to start building your history."}
              </p>
              {!search && !selectedDateISO && (
                <Link to="/analyze" className="btn btn-primary">
                  Analyze a scan
                </Link>
              )}
            </div>
          ) : (
            history.map((item) => {
              const findings = topFindings(parseScores(item.scores), 2);
              return (
                <div className="list-row" key={item.scan_id}>
                  <div className="row-icon">
                    <FileText size={22} />
                  </div>

                  <div className="row-main">
                    <div className="row-title">
                      {item.uploaded_at ? new Date(item.uploaded_at).toLocaleString() : `Scan #${item.scan_id}`}
                      {findings.length > 0 ? (
                        findings.map(([label, v]) => (
                          <span key={label} className={`tag tag-${riskOf(v)}`}>
                            {prettyLabel(label)}
                          </span>
                        ))
                      ) : (
                        <span className="tag tag-low">No elevated findings</span>
                      )}
                    </div>
                    <div className="row-summary">{getSummary(item.report)}</div>
                  </div>

                  <div className="row-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => handleViewScan(item.scan_id)}>
                      <ImageIcon size={15} /> Scan
                    </button>
                    <Link to={`/report/${item.scan_id}`} className="btn btn-dark btn-sm">
                      Full report
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && history.length > 0 && (
        <div className="pagination">
          <span className="muted">
            Page {currentPage} of {lastPage} · {totalItems} total
          </span>
          <div className="pages">
            <button className="page-btn" onClick={handlePreviousPage} disabled={currentPage === 1}>
              <ChevronLeft size={16} /> Prev
            </button>
            {pageNumbers.map((pageNum) => (
              <button
                key={pageNum}
                className={`page-btn${currentPage === pageNum ? " active" : ""}`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <button
              className="page-btn"
              onClick={handleNextPage}
              disabled={currentPage === lastPage || totalPages === 0}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
