import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Header from "../components/Layout/Header";
import DashboardSummary from "../components/Dashboard/DashboardSummary";
import QuickActions from "../components/Dashboard/QuickActions";
import DocumentFilters from "../components/Dashboard/DocumentFilters";
import DocumentsTable from "../components/Dashboard/DocumentsTable";
import LoadingSkeleton from "../components/Dashboard/LoadingSkeleton";

import useAuth from "../context/useAuth";
import useCompany from "../context/useCompany";

import {
  getAllDocuments,
  getDocumentDetails,
} from "../services/documentService";

import { useLocation } from "react-router-dom";

import "../styles/dashboard.css";

const DEFAULT_PAGE_SIZE = "5";

const emptyTotals = {
  draft: 0,
  sent: 0,
  completed: 0,
  signed: 0,
  expired: 0,
  action_required: 0,
};

// ============================================================
// COMPANY NAME
// ============================================================

function apiCompanyName(company) {
  return company === "Akar Limited"
    ? "Akar"
    : company;
}

// ============================================================
// ACTION REQUIRED
// ============================================================

function isActionRequired(document) {
  if (
    document.status?.toUpperCase() !== "SENT"
  ) {
    return false;
  }

  const totalInvitee =
    document.total_invitee || 0;

  const totalSigned =
    document.total_signed || 0;

  const totalExpired =
    document.total_expired || 0;

  return (
    totalSigned + totalExpired ===
      totalInvitee &&
    totalInvitee > 0
  );
}

// ============================================================
// FILTER MATCHING
// ============================================================

function matchesActiveFilters(
  document,
  { search, status, dateFrom, dateTo }
) {
  // ==========================================================
  // STATUS FILTER
  // ==========================================================

  if (status) {
    if (
      status.toUpperCase() ===
      "ACTION_REQUIRED"
    ) {
      if (!isActionRequired(document)) {
        return false;
      }
    } else if (
      document.status?.toUpperCase() !==
      status.toUpperCase()
    ) {
      return false;
    }
  }

  // ==========================================================
  // SEARCH FILTER
  // ==========================================================

  if (search) {
    const searchValue =
      search.toLowerCase();

    const matchesSearch = [
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

    if (!matchesSearch) {
      return false;
    }
  }

  // ==========================================================
  // DATE FILTER
  // ==========================================================

  if (dateFrom || dateTo) {
    const documentDate =
      document.creationDate;

    if (!documentDate) {
      return false;
    }

    // Backend date:
    // DD-MM-YYYY
    //
    // Example:
    // 06-08-2026

    const [
      day,
      month,
      year,
    ] = documentDate
      .split("-")
      .map(Number);

    if (!day || !month || !year) {
      return false;
    }

    const normalizedDocumentDate = [
      year,
      String(month).padStart(2, "0"),
      String(day).padStart(2, "0"),
    ].join("-");

    if (
      dateFrom &&
      normalizedDocumentDate < dateFrom
    ) {
      return false;
    }

    if (
      dateTo &&
      normalizedDocumentDate > dateTo
    ) {
      return false;
    }
  }

  return true;
}

// ============================================================
// STATUS TOTALS
// ============================================================

function countDocumentStatuses(
  documents
) {
  return documents.reduce(
    (counts, document) => {
      const normalizedStatus =
        document.status?.toUpperCase();

      if (
        normalizedStatus === "DRAFT"
      ) {
        counts.draft += 1;
      }

      if (
        normalizedStatus === "SENT"
      ) {
        counts.sent += 1;
      }

      if (
        normalizedStatus ===
        "COMPLETED"
      ) {
        counts.completed += 1;
      }

      if (
        normalizedStatus === "SIGNED"
      ) {
        counts.signed += 1;
      }

      if (
        normalizedStatus ===
        "EXPIRED"
      ) {
        counts.expired += 1;
      }

      if (
        isActionRequired(document)
      ) {
        counts.action_required += 1;
      }

      return counts;
    },
    { ...emptyTotals }
  );
}

// ============================================================
// DASHBOARD
// ============================================================

export default function Dashboard() {
  const { user } = useAuth();
  const { selectedCompany } =
    useCompany();

  const location = useLocation();

  // ==========================================================
  // DOCUMENT STATE
  // ==========================================================

  const [documents, setDocuments] =
    useState([]);

  const [
    allDocumentsList,
    setAllDocumentsList,
  ] = useState([]);

  // ==========================================================
  // FILTER STATE
  // ==========================================================

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState("desc");

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [pageSize, setPageSize] =
    useState(DEFAULT_PAGE_SIZE);

  const [page, setPage] =
    useState(1);

  // ==========================================================
  // UI STATE
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================================
  // REQUEST TRACKING
  // ==========================================================

  const latestRequest =
    useRef(0);

  const tableRef =
    useRef(null);

  // ==========================================================
  // FORMAT DATE FOR CSV
  // ==========================================================

  function formatDateForFileName(
    dateString
  ) {
    if (!dateString) {
      return "";
    }

    const [
      year,
      month,
      day,
    ] = dateString
      .split("-")
      .map(Number);

    if (!year || !month || !day) {
      return "";
    }

    const date = new Date(
      year,
      month - 1,
      day
    );

    const monthName =
      date.toLocaleString(
        "en-US",
        {
          month: "short",
        }
      );

    return `${String(day).padStart(
      2,
      "0"
    )}${monthName}${String(
      year
    ).slice(-2)}`;
  }

  // ==========================================================
  // EXPORT CSV
  // ==========================================================

  function exportDocumentsToCSV() {
    if (!filteredDocuments.length) {
      return;
    }

    const headers = [
      "Document Name",
      "Document ID",
      "IRN",
      "Status",
      "Signer Name",
      "Creation Date",
      "Creation Time",
      "Total Invitees",
      "Total Signed",
      "Total Expired",
    ];

    const escapeCSV = (value) => {
      if (
        value === null ||
        value === undefined
      ) {
        return "";
      }

      const stringValue =
        String(value);

      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(
          /"/g,
          '""'
        )}"`;
      }

      return stringValue;
    };

    const rows =
      filteredDocuments.map(
        (document) => [
          document.name,
          document.documentId,
          document.irn,
          document.status,
          document.signerName,
          document.creationDate,
          document.creationTime,
          document.total_invitee ||
            0,
          document.total_signed ||
            0,
          document.total_expired ||
            0,
        ]
      );

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(escapeCSV)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    const statusName = status
      ? status.toUpperCase()
      : "ALL";

    const fromDate = dateFrom
      ? formatDateForFileName(
          dateFrom
        )
      : "Start";

    const toDate = dateTo
      ? formatDateForFileName(
          dateTo
        )
      : "End";

    link.download =
      `${statusName}_${fromDate}_to_${toDate}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(url);
  }

  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  const loadDashboard =
    useCallback(async () => {
      if (
        !user?.token ||
        !selectedCompany
      ) {
        return;
      }

      const requestId =
        latestRequest.current + 1;

      latestRequest.current =
        requestId;

      const company =
        apiCompanyName(
          selectedCompany
        );

      setLoading(true);
      setError("");

      try {
        console.log(
          `Loading documents for company: ${company}`
        );

        const allDocuments =
          await getAllDocuments(
            company
          );

        const allDocumentsDetails =
          [];

        const documentsWithSigner =
          await Promise.all(
            allDocuments.map(
              async (doc) => {
                try {
                  const details =
                    await getDocumentDetails(
                      doc.documentId,
                      company,
                      user.token
                    );

                  // =================================================
                  // STORE COMPLETE DOCUMENT DETAILS
                  // =================================================

                  allDocumentsDetails.push(
                    {
                      ...doc,
                      ...details,
                    }
                  );

                  const invitations =
                    details.invitations ||
                    [];

                  const total_invitee =
                    invitations.length;

                  const total_signed =
                    invitations.filter(
                      (invitation) =>
                        invitation
                          .invitationStatus
                          ?.signed
                    ).length;

                  const total_expired =
                    invitations.filter(
                      (invitation) =>
                        invitation
                          .invitationStatus
                          ?.expired
                    ).length;

                  const [
                    creationDate = "",
                    creationTime = "",
                  ] =
                    (
                      details.document
                        ?.creationDate ||
                      ""
                    ).split(" ");

                  return {
                    ...doc,

                    signerName:
                      invitations[0]
                        ?.name || "",

                    creationDate,

                    creationTime,

                    total_invitee,

                    total_signed,

                    total_expired,
                  };
                } catch (detailsError) {
                  console.error(
                    `Failed to load details for document ${doc.documentId}:`,
                    detailsError
                  );

                  allDocumentsDetails.push(
                    {
                      ...doc,
                      document: null,
                      invitations: [],
                    }
                  );

                  return {
                    ...doc,

                    signerName: "",

                    total_invitee:
                      0,

                    total_signed:
                      0,

                    total_expired:
                      0,
                  };
                }
              }
            )
          );

        // =========================================================
        // IGNORE OUTDATED REQUEST
        // =========================================================

        if (
          requestId !==
          latestRequest.current
        ) {
          return;
        }

        // =========================================================
        // UPDATE STATE
        // =========================================================

        setAllDocumentsList(
          allDocumentsDetails
        );

        setDocuments(
          documentsWithSigner
        );

        setPage(1);

        console.log(
          `✓ Dashboard loaded with ${allDocuments.length} documents`
        );
      } catch (requestError) {
        if (
          requestId !==
          latestRequest.current
        ) {
          return;
        }

        console.error(
          "Dashboard error:",
          requestError
        );

        setDocuments([]);

        setAllDocumentsList([]);

        setError(
          requestError.message ||
            "Unable to load documents."
        );
      } finally {
        if (
          requestId ===
          latestRequest.current
        ) {
          setLoading(false);
        }
      }
    }, [
      selectedCompany,
      user?.token,
    ]);

  // ==========================================================
  // REFRESH DASHBOARD
  // ==========================================================

  const refreshDashboard =
    useCallback(async () => {
      console.log(
        "Refreshing dashboard..."
      );

      await loadDashboard();
    }, [loadDashboard]);

  // ==========================================================
  // INITIAL LOAD / COMPANY CHANGE
  // ==========================================================

  useEffect(() => {
    if (
      !user?.token ||
      !selectedCompany
    ) {
      return;
    }

    loadDashboard();
  }, [
    loadDashboard,
    user?.token,
    selectedCompany,
  ]);

  // ==========================================================
  // CHECK DASHBOARD REFRESH FLAG
  // ==========================================================

  const checkDashboardRefresh =
    useCallback(async () => {
      const refreshRequired =
        sessionStorage.getItem(
          "dashboardRefresh"
        );

      if (
        refreshRequired !== "true"
      ) {
        return;
      }

      console.log(
        "Dashboard refresh requested."
      );

      // Clear FIRST so multiple events
      // don't trigger duplicate API calls.
      sessionStorage.removeItem(
        "dashboardRefresh"
      );

      await loadDashboard();
    }, [loadDashboard]);

  // ==========================================================
  // REFRESH WHEN RETURNING TO DASHBOARD
  // ==========================================================
  //
  // This handles:
  //
  // 1. navigate(-1)
  // 2. browser back
  // 3. browser forward/back cache
  // 4. returning to the tab
  //
  // ==========================================================

  useEffect(() => {
    const handlePageShow = () => {
      checkDashboardRefresh();
    };

    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          checkDashboardRefresh();
        }
      };

    window.addEventListener(
      "pageshow",
      handlePageShow
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener(
        "pageshow",
        handlePageShow
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [
    checkDashboardRefresh,
  ]);

  // ==========================================================
  // ROUTE CHANGE REFRESH
  // ==========================================================
  //
  // When React Router returns from:
  //
  // /documents/:documentId
  //
  // to:
  //
  // /dashboard
  //
  // location.key changes.
  //
  // ==========================================================

  useEffect(() => {
    checkDashboardRefresh();
  }, [
    location.key,
    checkDashboardRefresh,
  ]);

  // ==========================================================
  // FILTER HANDLERS
  // ==========================================================

  function handleStatusChange(
    nextStatus
  ) {
    setStatus(nextStatus);
    setPage(1);
  }

  function handleSearchChange(
    nextSearch
  ) {
    setSearch(nextSearch);
    setPage(1);
  }

  function handleSortChange(
    nextSortOrder
  ) {
    setSortOrder(
      nextSortOrder
    );
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setSortOrder("desc");
    setPage(1);
  }

  // ==========================================================
  // TOTALS
  // ==========================================================

  const totals = useMemo(
    () =>
      countDocumentStatuses(
        documents
      ),
    [documents]
  );

  // ==========================================================
  // FILTER DOCUMENTS
  // ==========================================================

  const filteredDocuments =
    useMemo(
      () =>
        documents.filter(
          (document) =>
            matchesActiveFilters(
              document,
              {
                search:
                  search.trim(),
                status,
                dateFrom,
                dateTo,
              }
            )
        ),
      [
        documents,
        search,
        status,
        dateFrom,
        dateTo,
      ]
    );

  // ==========================================================
  // SORT DOCUMENTS
  // ==========================================================

  const sortedDocuments =
    useMemo(() => {
      if (
        sortOrder === "desc"
      ) {
        return [
          ...filteredDocuments,
        ].reverse();
      }

      return filteredDocuments;
    }, [
      filteredDocuments,
      sortOrder,
    ]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const total =
    sortedDocuments.length;

  const isAll =
    pageSize === "All";

  const numericPageSize =
    isAll
      ? Math.max(1, total)
      : Number(pageSize);

  const pageCount = Math.max(
    1,
    Math.ceil(
      total /
        numericPageSize
    )
  );

  const activePage =
    Math.min(
      page,
      pageCount
    );

  const pageOffset = isAll
    ? 0
    : (activePage - 1) *
      numericPageSize;

  const visibleDocuments =
    sortedDocuments.slice(
      pageOffset,
      pageOffset +
        numericPageSize
    );

  const pageStart =
    total === 0
      ? 0
      : pageOffset + 1;

  const pageEnd =
    Math.min(
      pageOffset +
        visibleDocuments.length,
      total
    );

  const hasPreviousPage =
    activePage > 1;

  const hasNextPage =
    !isAll &&
    activePage < pageCount;

  // ==========================================================
  // USER LOADING
  // ==========================================================

  if (!user) {
    return (
      <h2>
        Loading user...
      </h2>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <Header
        title="Leegality"
        backDisable={true}
        documents={documents}
        allDocumentsList={
          allDocumentsList
        }
      />

      <div className="container-fluid dashboard-container">

        {/* =====================================================
            DASHBOARD SUMMARY
        ====================================================== */}

        <DashboardSummary
          totals={totals}
          loading={loading}
          activeStatus={status}
          onStatusClick={(
            clickedStatus
          ) => {
            const nextStatus =
              clickedStatus ===
              status
                ? ""
                : clickedStatus;

            setStatus(
              nextStatus
            );

            setPage(1);

            setTimeout(() => {
              if (
                !tableRef.current
              ) {
                return;
              }

              const y =
                tableRef.current.getBoundingClientRect()
                  .top +
                window.pageYOffset -
                80;

              window.scrollTo({
                top: y,
                behavior:
                  "smooth",
              });
            }, 100);
          }}
        />

        {/* =====================================================
            QUICK ACTIONS
        ====================================================== */}

        <QuickActions />

        {/* =====================================================
            DOCUMENTS CARD
        ====================================================== */}

        <div
          ref={tableRef}
          className="card dashboard-card"
        >

          {/* ===================================================
              HEADER
          ==================================================== */}

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
                  className=""
                  style={{
                    width: "auto",
                    padding:"2px",
                    borderRadius:"20px"
                  }}
                  value={
                    pageSize
                  }
                  onChange={(
                    e
                  ) => {
                    setPageSize(
                      e.target
                        .value
                    );

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

          {/* ===================================================
              FILTERS
          ==================================================== */}

          <DocumentFilters
            search={search}
            onSearchChange={
              handleSearchChange
            }

            status={status}
            onStatusChange={
              handleStatusChange
            }

            sortOrder={
              sortOrder
            }
            onSortChange={
              handleSortChange
            }

            dateFrom={
              dateFrom
            }
            dateTo={dateTo}

            onDateFromChange={(
              value
            ) => {
              setDateFrom(
                value
              );

              setPage(1);
            }}

            onDateToChange={(
              value
            ) => {
              setDateTo(
                value
              );

              setPage(1);
            }}

            onClear={
              clearFilters
            }

            onExportCSV={
              exportDocumentsToCSV
            }
          />

          {/* ===================================================
              TABLE BODY
          ==================================================== */}

          <div className="card-body p-0 mx-3">

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
                documents={
                  visibleDocuments
                }
                startIndex={
                  pageStart
                }
                allDocumentsList={
                  allDocumentsList
                }
                onRefresh={
                  refreshDashboard
                }
              />

            )}

          </div>

          {/* ===================================================
              PAGINATION FOOTER
          ==================================================== */}

          {!loading &&
            !error &&
            total > 0 && (

              <div className="card-footer d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">

                <small className="text-muted">

                  {isAll
                    ? `Showing all ${total} documents`
                    : `Showing ${pageStart}-${pageEnd} of ${total} documents`}

                </small>

                {!isAll &&
                  pageCount >
                    1 && (

                    <div
                      className="btn-group"
                      role="group"
                      aria-label="Document pagination"
                    >

                      {/* PREVIOUS */}

                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        disabled={
                          !hasPreviousPage
                        }
                        onClick={() =>
                          setPage(
                            (
                              currentPage
                            ) =>
                              Math.max(
                                1,
                                currentPage -
                                  1
                              )
                          )
                        }
                      >
                        <i className="bi bi-chevron-left me-1"></i>

                        Previous
                      </button>

                      {/* CURRENT PAGE */}

                      <span className="btn btn-outline-secondary btn-sm disabled">
                        Page{" "}
                        {
                          activePage
                        }{" "}
                        of{" "}
                        {
                          pageCount
                        }
                      </span>

                      {/* NEXT */}

                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        disabled={
                          !hasNextPage
                        }
                        onClick={() =>
                          setPage(
                            (
                              currentPage
                            ) =>
                              currentPage +
                              1
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