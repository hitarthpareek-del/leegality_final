import { useState } from "react";
import "./ReportFilters.css";

export default function ReportFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  documentType,
  onDocumentTypeChange,
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
    documentType !== "" ||
    dateFrom !== "" ||
    dateTo !== "";

  const formatDateForDisplay = (date) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");

    if (!year || !month || !day) {
      return date;
    }

    return `${day}/${month}/${year}`;
  };

  return (
    <div className="card report-filter-card border-0 shadow-sm mt-0">
      <div className="card-body p-3 p-lg-4">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <div className="filter-header-icon">
                <i className="bi bi-sliders"></i>
              </div>

              <h6 className="mb-0 fw-semibold">
                Report Filters
              </h6>
            </div>

            <small className="text-muted ms-1">
              Search, filter and export reports
            </small>
          </div>

          {hasActiveFilters && (
            <span className="filter-active-label">
              <i className="bi bi-funnel-fill me-1"></i>
              Filters applied
            </span>
          )}
        </div>

        {/* FILTER ROW */}
        <div className="row g-3 align-items-end">

          {/* SEARCH */}
          <div className="col-xl-4 col-lg-4">
            <label className="filter-label">
              <i className="bi bi-search me-1"></i>
              Search Documents
            </label>

            <div className="input-group input-group-sm filter-input-group">

              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>

              <input
                type="text"
                className="form-control"
                placeholder="Document name, ID or IRN"
                value={search}
                onChange={(e) =>
                  onSearchChange(e.target.value)
                }
                aria-label="Search documents"
              />

              {search && (
                <button
                  className="btn btn-light border"
                  type="button"
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
              <i className="bi bi-circle-half me-1"></i>
              Status
            </label>

            <select
              className="form-select form-select-sm"
              value={status}
              onChange={(e) =>
                onStatusChange(e.target.value)
              }
              aria-label="Filter by status"
            >
              <option value="">All Reports</option>
              <option value="SENT">Sent</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* DOCUMENT TYPE */}
          <div className="col-xl-2 col-lg-2">
            <label className="filter-label">
              <i className="bi bi-file-earmark-text me-1"></i>
              Document Type
            </label>

            <select
              className="form-select form-select-sm"
              value={documentType}
              onChange={(e) =>
                onDocumentTypeChange(e.target.value)
              }
            >
              <option value="">All Types</option>
              <option value="Appointment">
                Appointment
              </option>
              <option value="NDA">
                NDA
              </option>
            </select>
          </div>

          {/* DATE RANGE */}
          <div className="col-xl-2 col-lg-2 position-relative">
            <label className="filter-label">
              <i className="bi bi-calendar-range me-1"></i>
              Date Range
            </label>

            <button
              type="button"
              className={`btn btn-sm w-100 date-filter-btn ${
                dateFrom || dateTo
                  ? "date-filter-active"
                  : ""
              }`}
              onClick={() =>
                setShowDatePicker((current) => !current)
              }
            >
              <i className="bi bi-calendar3 me-2"></i>

              {dateFrom || dateTo
                ? `${formatDateForDisplay(dateFrom) || "..."} - ${
                    formatDateForDisplay(dateTo) || "..."
                  }`
                : "Select dates"}
            </button>

            {/* DATE POPUP */}
            {showDatePicker && (
              <div className="date-filter-popover">

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="fw-semibold small">
                      Select Date Range
                    </div>

                    <small className="text-muted">
                      Filter reports by creation date
                    </small>
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm btn-light"
                    onClick={() =>
                      setShowDatePicker(false)
                    }
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>

                {/* FROM */}
                <div className="mb-3">
                  <label className="small fw-semibold mb-1">
                    From Date
                  </label>

                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={dateFrom}
                    onChange={(e) =>
                      onDateFromChange(e.target.value)
                    }
                    max={dateTo || undefined}
                  />
                </div>

                {/* TO */}
                <div className="mb-3">
                  <label className="small fw-semibold mb-1">
                    To Date
                  </label>

                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={dateTo}
                    onChange={(e) =>
                      onDateToChange(e.target.value)
                    }
                    min={dateFrom || undefined}
                  />
                </div>

                <div className="d-flex gap-2">

                  <button
                    type="button"
                    className="btn btn-success btn-sm flex-fill"
                    onClick={() =>
                      setShowDatePicker(false)
                    }
                  >
                    <i className="bi bi-check-lg me-1"></i>
                    Apply
                  </button>

                  <button
                    type="button"
                    className="btn btn-light border btn-sm flex-fill"
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
          <div className="col-xl-2 col-lg-2">
            <label className="filter-label">
              Actions
            </label>

            <div className="d-flex gap-2">

              {/* RESET */}
              <button
                type="button"
                className="btn btn-light border btn-sm filter-action-btn"
                onClick={onClear}
                disabled={!hasActiveFilters}
                title={
                  hasActiveFilters
                    ? "Clear all filters"
                    : "No filters applied"
                }
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                Reset
              </button>

              {/* EXPORT */}
              <button
                type="button"
                className=" btn-sm filter-action-btn filter-export-btn"
                onClick={onExportCSV}
                title="Export filtered reports to CSV"
              >
                <i className="bi bi-filetype-csv me-1"></i>
                Export
              </button>

            </div>
          </div>
        </div>

        {/* ACTIVE FILTERS */}
        {hasActiveFilters && (
          <div className="active-filters mt-3 pt-3">

            <div className="d-flex align-items-center flex-wrap gap-2">

              <span className="active-filter-title">
                <i className="bi bi-funnel me-1"></i>
                Active filters:
              </span>

              {search && (
                <span className="filter-chip">
                  <i className="bi bi-search me-1"></i>
                  {search}

                  <button
                    type="button"
                    onClick={() =>
                      onSearchChange("")
                    }
                  >
                    ×
                  </button>
                </span>
              )}

              {status && (
                <span className="filter-chip">
                  <i className="bi bi-circle-half me-1"></i>
                  {status}

                  <button
                    type="button"
                    onClick={() =>
                      onStatusChange("")
                    }
                  >
                    ×
                  </button>
                </span>
              )}

              {documentType && (
                <span className="filter-chip">
                  <i className="bi bi-file-earmark-text me-1"></i>
                  {documentType}

                  <button
                    type="button"
                    onClick={() =>
                      onDocumentTypeChange("")
                    }
                  >
                    ×
                  </button>
                </span>
              )}

              {(dateFrom || dateTo) && (
                <span className="filter-chip">
                  <i className="bi bi-calendar3 me-1"></i>

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
                    ×
                  </button>
                </span>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}