import { useMemo, useState, useRef } from "react";
import Header from "../components/Layout/Header";
import ReportFilters from "../components/Reports/ReportFilters";
import DocumentsTable from "../components/Dashboard/DocumentsTable";
import LoadingSkeleton from "../components/Dashboard/LoadingSkeleton";
import { useLocation } from "react-router-dom";
import "../styles/ReportsPage.css";

const DEFAULT_PAGE_SIZE = "5";

const emptyTotals = {
    draft: 0,
    sent: 0,
    completed: 0,
    signed: 0,
    expired: 0,
};


function matchesActiveFilters(
    document,
    { search, status, documentType }
) {
    if (
        status &&
        document.status?.toUpperCase() !== status.toUpperCase()
    ) {
        return false;
    }

    if (documentType) {
        const name = (document.name || "").toLowerCase();

        if (
            documentType === "Appointment" &&
            !name.includes("appointment")
        ) {
            return false;
        }

        if (
            documentType === "NDA" &&
            !name.includes("nda")
        ) {
            return false;
        }
    }

    if (!search) return true;

    const searchValue = search.toLowerCase();

    return [
        document.name,
        document.documentId,
        document.irn,
        document.signerName,
    ]
        .filter(Boolean)
        .some((value) =>
            String(value)
                .toLowerCase()
                .includes(searchValue)
        );
}

function countDocumentStatuses(documents) {
    return documents.reduce(
        (counts, document) => {
            const normalizedStatus = document.status?.toUpperCase();

            if (normalizedStatus === "DRAFT") counts.draft += 1;
            if (normalizedStatus === "SENT") counts.sent += 1;
            if (normalizedStatus === "COMPLETED") counts.completed += 1;
            if (normalizedStatus === "SIGNED") counts.signed += 1;
            if (normalizedStatus === "EXPIRED") counts.expired += 1;

            return counts;
        },
        { ...emptyTotals }
    );
}

export default function ReportsPage() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [documentType, setDocumentType] = useState("");

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const { state } = useLocation();

    const documents = state?.documents ?? [];
    const allDocumentsList = state?.allDocumentsList ?? [];

    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [page, setPage] = useState(1);

    const tableRef = useRef(null);

    const loading = false;
    const error = "";


    function handleDocumentTypeChange(nextDocumentType) {
        setDocumentType(nextDocumentType);
        setPage(1);
    }

    function handleDateFromChange(nextDateFrom) {
        setDateFrom(nextDateFrom);
        setPage(1);
    }

    function handleDateToChange(nextDateTo) {
        setDateTo(nextDateTo);
        setPage(1);
    }

    ///////////////
    // exported file format name
    const formatDateForFileName = (dateString) => {
        if (!dateString) return "";

        // dateString = YYYY-MM-DD
        const [year, month, day] = dateString.split("-").map(Number);

        if (!year || !month || !day) {
            return "";
        }

        const date = new Date(year, month - 1, day);

        const monthName = date.toLocaleString("en-US", {
            month: "short",
        });

        return `${String(day).padStart(2, "0")}${monthName}${String(
            year
        ).slice(-2)}`;
    };

    const exportReportsToCSV = () => {
        if (filteredDocuments.length === 0) {
            return;
        }

        // -------------------------------
        // Status
        // -------------------------------

        const statusName = status
            ? status.toUpperCase()
            : "ALL";

        // -------------------------------
        // Document Type
        // -------------------------------

        const typeName = documentType
            ? documentType
            : "All";

        // -------------------------------
        // Date Range
        // -------------------------------

        const fromDate = dateFrom
            ? formatDateForFileName(dateFrom)
            : "Start";

        const toDate = dateTo
            ? formatDateForFileName(dateTo)
            : "End";

        // -------------------------------
        // Filename
        // -------------------------------

        const fileName =
            `${statusName}_${typeName}_${fromDate}_to_${toDate}.csv`;

        // -------------------------------
        // CSV
        // -------------------------------

        const headers = [
            "Document Name",
            "Document ID",
            "IRN",
            "Document Type",
            "Status",
            "Created",
            "Signer Name",
        ];

        const escapeCSV = (value) => {
            if (value === null || value === undefined) {
                return "";
            }

            const stringValue = String(value);

            if (
                stringValue.includes(",") ||
                stringValue.includes('"') ||
                stringValue.includes("\n")
            ) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }

            return stringValue;
        };

        const rows = filteredDocuments.map((document) => [
            document.name || "",
            document.documentId || "",
            document.irn || "",
            document.name?.toLowerCase().includes("nda")
                ? "NDA"
                : document.name?.toLowerCase().includes("appointment")
                    ? "Appointment"
                    : "",
            document.status || "",
            document.creationDate || document.created || "",
            document.signerName || "",
        ]);

        const csvContent = [
            headers,
            ...rows,
        ]
            .map((row) =>
                row.map(escapeCSV).join(",")
            )
            .join("\n");

        const blob = new Blob(
            [csvContent],
            {
                type: "text/csv;charset=utf-8;",
            }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = fileName;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };


    // ==========================================
    // FILTER HANDLERS
    // ==========================================

    function handleStatusChange(nextStatus) {
        setStatus(nextStatus);
        setPage(1);
    }

    function handleSearchChange(nextSearch) {
        setSearch(nextSearch);
        setPage(1);
    }

    function clearFilters() {
        setSearch("");
        setStatus("");
        setDocumentType("");
        setDateFrom("");
        setDateTo("");
        setPage(1);
    }

    // ==========================================
    // TOTALS
    // ==========================================

    const totals = useMemo(
        () => countDocumentStatuses(documents),
        [documents]
    );

    // ==========================================
    // FILTER DOCUMENTS
    // ==========================================

    const filteredDocuments = useMemo(() => {
        return documents
            // Reports page should only show Sent & Completed
            .filter((document) =>
                ["SENT", "COMPLETED"].includes(
                    document.status?.toUpperCase()
                )
            )
            // Apply user filters
            .filter((document) =>
                matchesActiveFilters(document, {
                    search: search.trim(),
                    status,
                    documentType,
                })
            );
    }, [documents, search, status, documentType]);

    // ==========================================
    // PAGINATION
    // ==========================================

    const total = filteredDocuments.length;

    const isAll = pageSize === "All";

    const numericPageSize = isAll
        ? Math.max(1, total)
        : Number(pageSize);

    const pageCount = Math.max(
        1,
        Math.ceil(total / numericPageSize)
    );

    const activePage = Math.min(page, pageCount);

    const pageOffset = isAll
        ? 0
        : (activePage - 1) * numericPageSize;

    const visibleDocuments = filteredDocuments.slice(
        pageOffset,
        pageOffset + numericPageSize
    );

    const pageStart =
        total === 0 ? 0 : pageOffset + 1;

    const pageEnd = Math.min(
        pageOffset + visibleDocuments.length,
        total
    );

    const hasPreviousPage = activePage > 1;

    const hasNextPage =
        !isAll && activePage < pageCount;



    // ==========================================
    // UI
    // ==========================================


    return (
        <>
            <Header
                title="Reports"
                subtitle="DetailsPage"
                backDisable={false}
            />

            <div className="container-fluid dashboard-container">


                {/* ================================
            DOCUMENTS CARD
        ================================= */}

                <div
                    ref={tableRef}
                    className="card dashboard-card"
                >

                    {/* ================================
              HEADER
          ================================= */}

                    <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">

                        <div>
                            <h5 className="mb-0">
                                Documents
                            </h5>

                            <small className="text-muted">
                                Showing all matching signing requests
                            </small>
                        </div>

                        <div className="d-flex align-items-center gap-3">

                            {/* PAGE SIZE */}

                            <div className="d-flex align-items-center gap-1">

                                <small className="text-muted me-1">
                                    Show:
                                </small>

                                <select
                                    className="form-select form-select-sm"
                                    style={{ width: "auto" }}
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(e.target.value);
                                        setPage(1);
                                    }}
                                >
                                    <option value="5">
                                        5
                                    </option>

                                    <option value="10">
                                        10
                                    </option>

                                    <option value="25">
                                        25
                                    </option>

                                    <option value="50">
                                        50
                                    </option>

                                    <option value="100">
                                        100
                                    </option>

                                    <option value="All">
                                        All ({total})
                                    </option>
                                </select>

                            </div>

                            {/* TOTAL */}

                            <span className="badge bg-primary">
                                {loading
                                    ? "-"
                                    : `${total} Total`}
                            </span>


                        </div>
                    </div>

                    {/* ================================
              FILTERS
          ================================= */}

                    <ReportFilters
                        search={search}
                        onSearchChange={handleSearchChange}

                        status={status}
                        onStatusChange={handleStatusChange}

                        documentType={documentType}
                        onDocumentTypeChange={handleDocumentTypeChange}

                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        onDateFromChange={handleDateFromChange}
                        onDateToChange={handleDateToChange}

                        onClear={clearFilters}
                        onExportCSV={exportReportsToCSV}
                    />

                    {/* ================================
              TABLE BODY
          ================================= */}

                    <div
                        className="card-body p-0 overflow-auto"
                    >

                        {loading ? (

                            <div className="p-4 text-center">
                                <LoadingSkeleton />
                            </div>

                        ) : error ? (

                            <div
                                className="alert alert-danger m-3 mb-0"
                                role="alert"
                            >
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                {error}
                            </div>

                        ) : total === 0 ? (

                            <div
                                className="alert alert-info m-3 mb-0"
                                role="alert"
                            >
                                <i className="bi bi-info-circle me-2"></i>
                                No documents found matching your filters.
                            </div>

                        ) : (

                            <DocumentsTable
                                documents={visibleDocuments}
                                startIndex={pageStart}
                                allDocumentsList={allDocumentsList}
                            />

                        )}

                    </div>

                    {/* ================================
              PAGINATION FOOTER
          ================================= */}

                    {!loading &&
                        !error &&
                        total > 0 && (

                            <div className="card-footer mt-auto d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">

                                <small className="text-muted">

                                    {isAll
                                        ? `Showing all ${total} documents`
                                        : `Showing ${pageStart}-${pageEnd} of ${total} documents`}

                                </small>

                                {!isAll &&
                                    pageCount > 1 && (

                                        <div
                                            className="btn-group"
                                            role="group"
                                            aria-label="Document pagination"
                                        >

                                            {/* PREVIOUS */}

                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm"
                                                disabled={!hasPreviousPage}
                                                onClick={() =>
                                                    setPage((currentPage) =>
                                                        Math.max(
                                                            1,
                                                            currentPage - 1
                                                        )
                                                    )
                                                }
                                            >
                                                <i className="bi bi-chevron-left me-1"></i>
                                                Previous
                                            </button>

                                            {/* PAGE NUMBER */}

                                            <span className="btn btn-outline-secondary btn-sm disabled">
                                                Page {activePage} of {pageCount}
                                            </span>

                                            {/* NEXT */}

                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm"
                                                disabled={!hasNextPage}
                                                onClick={() =>
                                                    setPage(
                                                        (currentPage) =>
                                                            currentPage + 1
                                                    )
                                                }
                                            >
                                                Next
                                                <i className="bi bi-chevron-right ms-1"></i>
                                            </button>

                                        </div>
                                    )}

                            </div>
                        )}

                </div>
            </div>
        </>
    );
}