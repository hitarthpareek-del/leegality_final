import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import useAuth from "../../context/useAuth";
import useCompany from "../../context/useCompany";
import "./Header.css";

export default function Header({
  title,
  subtitle,
  backDisable,
  documents,
  allDocumentsList,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();

  const {
    selectedCompany,
    setSelectedCompany,
    companies,
  } = useCompany();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/", { replace: true });
  };

  const isDashboard = location.pathname === "/dashboard";

  return (
    <header className="app-header">

      <div className="container-fluid px-3 px-lg-4">

        <div className="app-header-inner">

          {/* ================================================= */}
          {/* LEFT SIDE */}
          {/* ================================================= */}

          <div className="header-left">

            {/* Back */}
            {!backDisable && (
              <button
                type="button"
                className="header-back-button"
                onClick={() => navigate("/dashboard")}
                aria-label="Back to dashboard"
              >
                <i className="bi bi-arrow-left"></i>
              </button>
            )}

            {/* Brand */}
            <div className="header-brand">

              <div className="header-logo">
                <img
                  src="/leegality-icon.svg"
                  alt="Leegality"
                />
              </div>

              <div className="header-title-wrapper">
                <h4>{title}</h4>

                {subtitle &&
                  subtitle !== "LoginPage" &&
                  subtitle !== "hide-profile" && (
                    <span>
                      {subtitle}
                    </span>
                  )}
              </div>

            </div>

            {/* Company */}
            {backDisable && subtitle !== "LoginPage" && (
              <div className="header-company">

                <span className="header-company-label">
                  <i className="bi bi-building me-1"></i>
                  Company
                </span>

                <select
                  className="company-select"
                  value={selectedCompany}
                  onChange={(e) =>
                    setSelectedCompany(e.target.value)
                  }
                >
                  {companies.map((company) => (
                    <option
                      key={company}
                      value={company}
                    >
                      {company}
                    </option>
                  ))}
                </select>

              </div>
            )}

          </div>


          {/* ================================================= */}
          {/* RIGHT SIDE */}
          {/* ================================================= */}

          {location.pathname === "/" ? (

            <button
              type="button"
              className="header-primary-button"
              onClick={() => navigate("/user-form")}
            >
              <i className="bi bi-file-earmark-plus"></i>
              <span>Fill Form</span>
            </button>

          ) : (

            subtitle !== "LoginPage" &&
            subtitle !== "hide-profile" && (

              <div className="header-right">

                {/* Dashboard Menu */}
                {isDashboard && (
                  <div className="dropdown">

                    <button
                      type="button"
                      className="header-menu-button dropdown-toggle"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="bi bi-grid"></i>
                      <span>Menu</span>
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end header-dropdown">

                      {user?.role === "superadmin" && (
                        <>
                          <li>
                            <button
                              type="button"
                              className="dropdown-item"
                              onClick={() =>
                                navigate("/superadmin")
                              }
                            >
                              <span className="dropdown-icon">
                                <i className="bi bi-shield-lock"></i>
                              </span>

                              <span>
                                <strong>User Management</strong>
                                <small>
                                  Manage system users
                                </small>
                              </span>
                            </button>
                          </li>

                          <li>
                            <hr className="dropdown-divider" />
                          </li>
                        </>
                      )}

                      <li>
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() =>
                            navigate("/reports", {
                              state: {
                                documents,
                                allDocumentsList,
                              },
                            })
                          }
                        >
                          <span className="dropdown-icon">
                            <i className="bi bi-bar-chart-line"></i>
                          </span>

                          <span>
                            <strong>Reports</strong>
                            <small>
                              View signing reports
                            </small>
                          </span>
                        </button>
                      </li>

                      <li>
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() =>
                            navigate("/members")
                          }
                        >
                          <span className="dropdown-icon">
                            <i className="bi bi-people"></i>
                          </span>

                          <span>
                            <strong>Members</strong>
                            <small>
                              Manage employees
                            </small>
                          </span>
                        </button>
                      </li>

                    </ul>
                  </div>
                )}

                {/* Profile */}
                <div className="dropdown">

                  <button
                    type="button"
                    className="header-profile-button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >

                    <img
                      src={user?.firebaseUser?.photoURL}
                      alt="Profile"
                      className="header-avatar"
                    />

                    <div className="header-user-info">
                      <span>
                        {user?.firebaseUser?.displayName ||
                          "User"}
                      </span>

                      <small>
                        {user?.role || "Admin"}
                      </small>
                    </div>

                    <i className="bi bi-chevron-down header-profile-arrow"></i>

                  </button>

                  <ul className="dropdown-menu dropdown-menu-end header-dropdown profile-dropdown">

                    <li className="profile-dropdown-header">

                      <img
                        src={user?.firebaseUser?.photoURL}
                        alt="Profile"
                        className="profile-large-avatar"
                      />

                      <div>
                        <strong>
                          {user?.firebaseUser?.displayName ||
                            "User"}
                        </strong>

                        <small>
                          {user?.firebaseUser?.email}
                        </small>
                      </div>

                    </li>

                    <li>
                      <hr className="dropdown-divider" />
                    </li>

                    {/* <li>
                      <button
                        type="button"
                        className="dropdown-item"
                      >
                        <span className="dropdown-icon">
                          <i className="bi bi-person"></i>
                        </span>

                        <span>
                          <strong>Profile</strong>
                          <small>
                            View your profile
                          </small>
                        </span>
                      </button>
                    </li> */}

                    <li>
                      <button
                        type="button"
                        className="dropdown-item dropdown-logout"
                        onClick={handleLogout}
                      >
                        <span className="dropdown-icon">
                          <i className="bi bi-box-arrow-right"></i>
                        </span>

                        <span>
                          <strong>Logout</strong>
                          <small>
                            Sign out of your account
                          </small>
                        </span>
                      </button>
                    </li>

                  </ul>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </header>
  );
}
