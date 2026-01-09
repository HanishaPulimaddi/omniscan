import { useEffect, useState } from "react";

// Pagination configuration
const PAGE_SIZE = 5;
const SEARCH_DEBOUNCE_MS = 400; // Debounce delay for search input

export default function History() {
  const [history, setHistory] = useState<any[]>([]);
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
      
      const token = localStorage.getItem("token");

      if (!token) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      // Build URL with pagination, optional search, and optional date filter
      // CRITICAL: Ensure date is in ISO format (YYYY-MM-DD) before sending to backend
      let url = `http://127.0.0.1:8000/history/?page=${page}&page_size=${PAGE_SIZE}`;
      if (searchTerm && searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }
      if (dateFilter) {
        // Date filter is already in ISO format (YYYY-MM-DD) from selectedDateISO
        // No normalization needed - it's guaranteed to be ISO format
        url += `&date=${dateFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("History API error - Status:", response.status, "Response:", text);
        throw new Error(`Failed to load history: ${response.status} ${text}`);
      }

      const data = await response.json();
      console.log("History API response:", data);
      
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
    } catch (err: any) {
      console.error("History fetch error:", err);
      setError(err.message || "Failed to load history");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div style={{ padding: "24px" }}>
      <h2 style={{ marginBottom: "20px" }}>User History</h2>

      {/* Search Input */}
      <div style={searchContainerStyle}>
        <input
          type="text"
          placeholder="Search within your reports..."
          value={searchInput}
          onChange={handleSearchChange}
          style={searchInputStyle}
        />
        {searchInput && (
          <button
            onClick={handleClearSearch}
            style={clearButtonStyle}
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Date Filter */}
      {/* NOTE: Using text input instead of native date input because native
          date inputs cannot be forced to MM/DD/YYYY format due to browser locale.
          We manually parse MM/DD/YYYY and convert to ISO format for the API. */}
      <div style={dateFilterContainerStyle}>
        <div style={dateFilterGroupStyle}>
          <label style={dateLabelStyle} htmlFor="selected-date">
            Select Date:
          </label>
          <input
            id="selected-date"
            type="text"
            placeholder="MM/DD/YYYY"
            value={displayDate}
            onChange={handleDateChange}
            style={{
              ...dateInputStyle,
              ...(displayDate && !selectedDateISO && displayDate.trim() !== "" 
                ? { borderColor: "#dc3545" } 
                : {})
            }}
            maxLength={10}
          />
        </div>
        {selectedDateISO && (
          <button
            onClick={handleClearDate}
            style={clearDateButtonStyle}
            title="Clear date filter"
          >
            Clear Date
          </button>
        )}
      </div>

      {loading && <p>Loading history...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && history.length === 0 && !error && (
        <p>
          {search || selectedDateISO
            ? selectedDateISO
              ? "No records found for selected date."
              : "No records found matching your filters."
            : "No analysis history found."}
        </p>
      )}
      
      {/* Date input validation error */}
      {displayDate && !selectedDateISO && displayDate.trim() !== "" && (
        <p style={{ color: "#dc3545", fontSize: "14px", marginTop: "8px", marginBottom: "0" }}>
          Invalid date format. Please use MM/DD/YYYY (e.g., 12/25/2025)
        </p>
      )}

      {!loading && history.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <thead style={{ background: "#f1f3f5" }}>
              <tr>
                <th style={thStyle}>Uploaded At</th>
                <th style={thStyle}>Scan Image</th>
                <th style={thStyle}>Summary</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #e9ecef" }}>
                  {/* Uploaded At */}
                  <td style={tdStyle}>
                    {new Date(item.uploaded_at).toLocaleString()}
                  </td>

                  {/* View Scan BUTTON */}
                  <td style={tdStyle}>
                    <a
                      href={`http://127.0.0.1:8000${item.image_path}`}
                      target="_blank"
                      rel="noreferrer"
                      style={buttonStyle}
                    >
                      View Scan
                    </a>
                  </td>

                  {/* Summary */}
                  <td style={{ ...tdStyle, maxWidth: "420px" }}>
                    {getSummary(item.report)}
                  </td>

                  {/* View Full Report BUTTON */}
                  <td style={tdStyle}>
                    <a
                      href={`http://localhost:5173/report/${item.scan_id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={buttonStyle}
                    >
                      View Full Report
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls - Always visible when data is loaded */}
      {!loading && history.length > 0 && (
        <div style={paginationContainerStyle}>
          <div style={paginationInfoStyle}>
            Page {currentPage} of {totalPages || 1}
          </div>
          <div style={paginationControlsStyle}>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              style={{
                ...paginationButtonStyle,
                opacity: currentPage === 1 ? 0.5 : 1,
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {(() => {
              const displayPages = totalPages || 1;
              return (
                <div style={pageNumbersStyle}>
                  {Array.from({ length: Math.min(5, displayPages) }, (_, i) => {
                    let pageNum;
                    if (displayPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= displayPages - 2) {
                      pageNum = displayPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          ...paginationButtonStyle,
                          ...(currentPage === pageNum ? activePageButtonStyle : {}),
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              );
            })()}
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === (totalPages || 1) || totalPages === 0}
              style={{
                ...paginationButtonStyle,
                opacity: (currentPage === (totalPages || 1) || totalPages === 0) ? 0.5 : 1,
                cursor: (currentPage === (totalPages || 1) || totalPages === 0) ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const thStyle = {
  padding: "12px",
  textAlign: "left" as const,
  fontWeight: 600,
  fontSize: "14px",
};

const tdStyle = {
  padding: "12px",
  fontSize: "14px",
  verticalAlign: "top" as const,
};

const buttonStyle = {
  padding: "6px 12px",
  borderRadius: "6px",
  background: "#0D1B2A",
  color: "#ffffff",
  textDecoration: "none",
  fontSize: "13px",
  fontWeight: 500,
  display: "inline-block",
};

/* ================= PAGINATION STYLES ================= */

const paginationContainerStyle = {
  marginTop: "24px",
  display: "flex",
  flexDirection: "column" as const,
  gap: "12px",
  alignItems: "center",
};

const paginationInfoStyle = {
  fontSize: "14px",
  color: "#6c757d",
};

const paginationControlsStyle = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
};

const paginationButtonStyle = {
  padding: "8px 16px",
  borderRadius: "6px",
  border: "1px solid #dee2e6",
  background: "#ffffff",
  color: "#0D1B2A",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
};

const activePageButtonStyle = {
  background: "#0D1B2A",
  color: "#ffffff",
  borderColor: "#0D1B2A",
};

const pageNumbersStyle = {
  display: "flex",
  gap: "4px",
};

/* ================= SEARCH STYLES ================= */

const searchContainerStyle = {
  marginBottom: "20px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  maxWidth: "500px",
};

const searchInputStyle = {
  flex: 1,
  padding: "10px 16px",
  fontSize: "14px",
  border: "1px solid #dee2e6",
  borderRadius: "6px",
  outline: "none",
  transition: "border-color 0.2s",
};

const clearButtonStyle = {
  padding: "8px 12px",
  fontSize: "20px",
  lineHeight: "1",
  background: "#f8f9fa",
  border: "1px solid #dee2e6",
  borderRadius: "6px",
  cursor: "pointer",
  color: "#6c757d",
  fontWeight: "bold",
  transition: "all 0.2s",
};

/* ================= DATE FILTER STYLES ================= */

const dateFilterContainerStyle = {
  marginBottom: "20px",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap" as const,
};

const dateFilterGroupStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const dateLabelStyle = {
  fontSize: "14px",
  fontWeight: 500,
  color: "#495057",
  whiteSpace: "nowrap" as const,
};

const dateInputStyle = {
  padding: "8px 12px",
  fontSize: "14px",
  border: "1px solid #dee2e6",
  borderRadius: "6px",
  outline: "none",
  transition: "border-color 0.2s",
  cursor: "pointer",
};

const clearDateButtonStyle = {
  padding: "8px 16px",
  fontSize: "14px",
  background: "#f8f9fa",
  border: "1px solid #dee2e6",
  borderRadius: "6px",
  cursor: "pointer",
  color: "#6c757d",
  fontWeight: 500,
  transition: "all 0.2s",
};
