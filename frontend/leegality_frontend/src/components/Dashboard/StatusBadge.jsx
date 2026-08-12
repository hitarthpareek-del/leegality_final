export default function StatusBadge({ status }) {
  if (!status) {
    return <span className="badge bg-secondary">Unknown</span>;
  }

  const normalizedStatus = String(status).toUpperCase();

  const statusConfig = {
    DRAFT: {
      label: "Draft",
      className: "bg-secondary",
      icon: "bi-file-earmark",
    },
    SENT: {
      label: "Sent",
      className: "bg-primary",
      icon: "bi-send",
    },
    RECEIVED: {
      label: "Received",
      className: "bg-info",
      icon: "bi-inbox",
    },
    SIGNED: {
      label: "Signed",
      className: "bg-success",
      icon: "bi-check-circle",
    },
    COMPLETED: {
      label: "Completed",
      className: "bg-success",
      icon: "bi-check2-circle",
    },
    EXPIRED: {
      label: "Expired",
      className: "bg-danger",
      icon: "bi-exclamation-circle",
    },
  };

  const config = statusConfig[normalizedStatus] || {
    label: status,
    className: "bg-secondary",
    icon: "bi-question-circle",
  };

  return (
    <span
      className={`badge ${config.className}`}
      style={{
        minWidth: "90px",
        minHeight:"30px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 12px",
      }}
    >
      <i className={`bi ${config.icon} me-1`}></i>
      {config.label}
    </span>
  );
}