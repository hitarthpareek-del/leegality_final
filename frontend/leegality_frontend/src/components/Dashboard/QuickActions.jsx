import { useNavigate } from "react-router-dom";
import "./QuickActions.css";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Appointment Letter",
      description:
        "Create and send an appointment letter for electronic signing.",
      icon: "bi-file-earmark-text",
      color: "blue",
      button: "Create Request",
      onClick: () => navigate("/appointmentletter"),
    },
    {
      title: "NDA Agreement",
      description:
        "Create and send a non-disclosure agreement for signing.",
      icon: "bi-file-earmark-lock",
      color: "green",
      button: "Create Request",
      onClick: () => navigate("/nda"),
    },
    {
      title: "KOL Agreement",
      description:
        "Create and send a Key Opinion Leader agreement.",
      icon: "bi-file-earmark-check",
      color: "amber",
      button: "Create Request",
      onClick: () => navigate("/nda"),
    },
  ];

  return (
    <div className="quick-actions-section">

      {/* Section Header */}
      <div className="quick-actions-heading">
        <div>
          <h5>Quick Actions</h5>

          <p>
            Start a new e-sign workflow.
          </p>
        </div>

        <span className="quick-actions-count">
          {actions.length} workflows
        </span>
      </div>

      {/* Action Cards */}
      <div className="row g-3">

        {actions.map((action) => (
          <div
            className="col-lg-4"
            key={action.title}
          >
            <div className={`action-card action-${action.color}`}>

              {/* Top */}
              <div className="action-card-top">

                <div className="action-icon">
                  <i className={`bi ${action.icon}`}></i>
                </div>

                <span className="action-arrow">
                  <i className="bi bi-arrow-up-right"></i>
                </span>

              </div>

              {/* Content */}
              <div className="action-content">

                <h6>
                  {action.title}
                </h6>

                <p>
                  {action.description}
                </p>

              </div>

              {/* Footer */}
              <div className="action-footer">

                <button
                  type="button"
                  className="action-button"
                  onClick={action.onClick}
                >
                  <span>{action.button}</span>

                  <i className="bi bi-arrow-right"></i>
                </button>

              </div>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}








