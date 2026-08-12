import { useState } from "react";
import "./DocumentFilters.css";

export default function DocumentFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortOrder,
  onSortChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClear,
  onExportCSV,
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "" ||
    dateFrom !== "" ||
    dateTo !== "";

  const hasDocumentsToExport = true;

  const formatDateForDisplay = (date) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");

    if (!year || !month || !day) return date;

    return `${day}/${month}/${year}`;
  };

  return (
    <div className="document-filters">

      {/* FILTER HEADER */}
      <div className="document-filters-header">

        <div>
          <div className="document-filters-title">
            <span className="document-filters-title-icon">
              <i className="bi bi-sliders"></i>
            </span>

            Filter Documents
          </div>

          <div className="document-filters-subtitle">
            Search, filter and manage your documents
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="filters-clear-all"
            onClick={onClear}
          >
            <i className="bi bi-x-circle me-1"></i>
            Clear filters
          </button>
        )}

      </div>

      {/* FILTER CONTROLS */}
      <div className="document-filters-body">

        <div className="row g-3 align-items-end">

          {/* SEARCH */}
          <div className="col-xl-5 col-lg-5">
            <label className="filter-label">
              <i className="bi bi-search me-2"></i>
              Search
            </label>

            <div className="filter-search">

              <i className="bi bi-search filter-search-icon"></i>

              <input
                type="text"
                className="filter-search-input"
                placeholder="Search by document name, ID or IRN"
                value={search}
                onChange={(e) =>
                  onSearchChange(e.target.value)
                }
                aria-label="Search documents"
              />

              {search && (
                <button
                  type="button"
                  className="filter-search-clear"
                  onClick={() => onSearchChange("")}
                  title="Clear search"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}

            </div>
          </div>

          {/* STATUS */}
          <div className="col-xl-2 col-lg-2">
            <label className="filter-label">
              <i className="bi bi-circle-half me-2"></i>
              Status
            </label>

            <select
              className="filter-control"
              value={status}
              onChange={(e) =>
                onStatusChange(e.target.value)
              }
              aria-label="Filter by status"
            >
              <option value="">All Documents</option>
              <option value="DRAFT">📝 Draft</option>
              <option value="SENT">📤 Sent</option>
              <option value="COMPLETED">✅ Completed</option>
              <option value="ACTION_REQUIRED">
                ⚠️ Action Required
              </option>
              <option value="EXPIRED">⏰ Expired</option>
            </select>
          </div>

          {/* DATE RANGE */}
          <div className="col-xl-2 col-lg-2 position-relative">
            <label className="filter-label">
              <i className="bi bi-calendar-range me-2"></i>
              Date Range
            </label>

            <button
              type="button"
              className={`filter-control filter-date-button ${
                dateFrom || dateTo
                  ? "filter-date-active"
                  : ""
              }`}
              onClick={() =>
                setShowDatePicker((current) => !current)
              }
            >
              <i className="bi bi-calendar3"></i>

              <span>
                {dateFrom || dateTo
                  ? `${formatDateForDisplay(dateFrom) || "..."} - ${
                      formatDateForDisplay(dateTo) || "..."
                    }`
                  : "Select dates"}
              </span>

              <i
                className={`bi ${
                  showDatePicker
                    ? "bi-chevron-up"
                    : "bi-chevron-down"
                } ms-auto`}
              ></i>
            </button>

            {showDatePicker && (
              <div className="date-filter-popup">

                <div className="date-filter-header">
                  <div>
                    <div className="fw-semibold">
                      Date Range
                    </div>

                    <small className="text-muted">
                      Select document creation dates
                    </small>
                  </div>

                  <button
                    type="button"
                    className="date-popup-close"
                    onClick={() =>
                      setShowDatePicker(false)
                    }
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>

                <div className="date-filter-fields">

                  <div>
                    <label className="date-filter-label">
                      From Date
                    </label>

                    <input
                      type="date"
                      className="filter-control"
                      value={dateFrom}
                      onChange={(e) =>
                        onDateFromChange(e.target.value)
                      }
                      max={dateTo || undefined}
                    />
                  </div>

                  <div>
                    <label className="date-filter-label">
                      To Date
                    </label>

                    <input
                      type="date"
                      className="filter-control"
                      value={dateTo}
                      onChange={(e) =>
                        onDateToChange(e.target.value)
                      }
                      min={dateFrom || undefined}
                    />
                  </div>

                </div>

                <div className="date-filter-actions">

                  <button
                    type="button"
                    className="filter-btn filter-btn-primary"
                    onClick={() =>
                      setShowDatePicker(false)
                    }
                  >
                    <i className="bi bi-check-lg me-1"></i>
                    Apply
                  </button>

                  <button
                    type="button"
                    className="filter-btn filter-btn-light"
                    onClick={() => {
                      onDateFromChange("");
                      onDateToChange("");
                      setShowDatePicker(false);
                    }}
                  >
                    Clear
                  </button>

                </div>

              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="col-xl-3 col-lg-3">

            <label className="filter-label">
              <i className="bi bi-tools me-2 "></i>
              Actions
            </label>

            <div className="filter-actions">

              {/* SORT */}
              <button
                type="button"
                className="filter-action-btn"
                onClick={() =>
                  onSortChange(
                    sortOrder === "asc"
                      ? "desc"
                      : "asc"
                  )
                }
                title={
                  sortOrder === "asc"
                    ? "Ascending"
                    : "Descending"
                }
              >
                <i
                  className={`bi ${
                    sortOrder === "asc"
                      ? "bi-sort-up"
                      : "bi-sort-down"
                  }`}
                ></i>

                <span>
                  {sortOrder === "asc"
                    ? "Oldest"
                    : "Newest"}
                </span>
              </button>

              {/* RESET */}
              <button
                type="button"
                className="filter-action-btn"
                onClick={onClear}
                disabled={!hasActiveFilters}
                title={
                  hasActiveFilters
                    ? "Clear all filters"
                    : "No filters applied"
                }
              >
                <i className="bi bi-arrow-clockwise"></i>

                <span>Reset</span>
              </button>

              {/* EXPORT */}
              <button
                type="button"
                className="filter-action-btn filter-export-btn"
                onClick={onExportCSV}
                disabled={!hasDocumentsToExport}
                title="Export filtered documents to CSV"
              >
                <i className="bi bi-filetype-csv"></i>

                <span>Export</span>
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* ACTIVE FILTERS */}
      {hasActiveFilters && (
        <div className="active-filters">

          <div className="active-filters-label">
            <i className="bi bi-funnel-fill"></i>
            Active filters
          </div>

          <div className="active-filter-list">

            {search && (
              <span className="filter-chip">
                <i className="bi bi-search"></i>
                Search: "{search}"

                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                >
                  <i className="bi bi-x"></i>
                </button>
              </span>
            )}

            {status && (
              <span className="filter-chip">
                <i className="bi bi-circle-half"></i>
                Status: {status}

                <button
                  type="button"
                  onClick={() => onStatusChange("")}
                >
                  <i className="bi bi-x"></i>
                </button>
              </span>
            )}

            {(dateFrom || dateTo) && (
              <span className="filter-chip">
                <i className="bi bi-calendar3"></i>

                {formatDateForDisplay(dateFrom) || "..."}
                {" - "}
                {formatDateForDisplay(dateTo) || "..."}

                <button
                  type="button"
                  onClick={() => {
                    onDateFromChange("");
                    onDateToChange("");
                  }}
                >
                  <i className="bi bi-x"></i>
                </button>
              </span>
            )}

          </div>

        </div>
      )}

    </div>
  );
}