import "./DashboardSummary.css";

export default function DashboardSummary({
  totals,
  loading = false,
  onStatusClick,
  activeStatus,
}) {
  const stats = [
    {
      title: "Sent",
      status: "SENT",
      value: totals.sent,
      icon: "bi-send",
      color: "blue",
    },
    {
      title: "Completed",
      status: "COMPLETED",
      value: totals.completed,
      icon: "bi-check-circle",
      color: "green",
    },
    {
      title: "Action Required",
      status: "ACTION_REQUIRED",
      value: totals.action_required,
      icon: "bi-exclamation-circle",
      color: "red",
    },
    {
      title: "Expired",
      status: "EXPIRED",
      value: totals.expired,
      icon: "bi-clock-history",
      color: "amber",
    },
    {
      title: "Draft",
      status: "DRAFT",
      value: totals.draft,
      icon: "bi-file-earmark",
      color: "gray",
    },
  ];

  return (
    <div className="row g-3 dashboard-summary">

      {stats.map((item) => {
        const isActive = activeStatus === item.status;

        return (
          <div
            className="col-6 col-md"
            key={item.title}
          >
            <button
              type="button"
              className={`summary-card summary-${item.color} ${
                isActive ? "summary-card-active" : ""
              }`}
              onClick={() => onStatusClick(item.status)}
            >
              <div className="summary-card-content">

                {/* Icon */}
                <div className="summary-icon">
                  <i className={`bi ${item.icon}`}></i>
                </div>

                {/* Details */}
                <div className="summary-details">

                  <div className="summary-title">
                    {item.title}
                  </div>

                  {loading ? (
                    <div className="summary-loader">
                      <span className="spinner-border spinner-border-sm" />
                    </div>
                  ) : (
                    <div className="summary-value">
                      {item.value ?? 0}
                    </div>
                  )}

                </div>

              </div>

              {/* Active indicator */}
              <div className="summary-status">
                {isActive ? (
                  <>
                    <i className="bi bi-check2 me-1"></i>
                    Selected
                  </>
                ) : (
                  <>
                    View
                    <i className="bi bi-arrow-right ms-1"></i>
                  </>
                )}
              </div>

            </button>
          </div>
        );
      })}

    </div>
  );
}



