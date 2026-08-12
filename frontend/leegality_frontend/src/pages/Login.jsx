import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import useAuth from "../context/useAuth";
import { useEffect, useState } from "react";
import Header from "../components/Layout/Header";
import ToastMessage from "../components/Common/ToastMessage";

export default function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
    bg: "success",
  });

  const showToast = (title, message, bg = "success") => {
    setToast({
      show: true,
      title,
      message,
      bg,
    });
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      showToast("Error", error.message, "danger");
    }
  };

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, navigate, user]);

  return (
    <>
      <Header backDisable={true} title="Leegality" subtitle="LoginPage" />
      <div
        className="min-vh-100"
        style={{
          background:
            "linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#2563eb 100%)",
        }}
      >
        <div className="container-fluid h-100">
          <div className="row min-vh-100 align-items-center">

            {/* Left Side */}

            <div className="col-lg-7 text-white px-5 d-none d-lg-block">

              <div style={{ maxWidth: 650 }}>

                <span className="badge bg-light text-primary px-3 py-2 mb-4">
                  Secure HR Document Platform
                </span>

                <h1 className="display-4 fw-bold mb-4">
                  E-Sign Portal
                </h1>

                <p
                  className="lead text-white-50 mb-5"
                  style={{ lineHeight: 1.7 }}
                >
                  Create, manage and track appointment letters,
                  NDA agreements and other HR documents with
                  secure electronic signatures.
                </p>

                <div className="row g-4">

                  <div className="col-md-6">
                    <div className="card bg-white bg-opacity-10 border-0 text-white">
                      <div className="card-body">
                        <h5>⚡ Fast</h5>
                        <small className="text-white-50">
                          Create signing requests in seconds.
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card bg-white bg-opacity-10 border-0 text-white">
                      <div className="card-body">
                        <h5>🔒 Secure</h5>
                        <small className="text-white-50">
                          Protected with Google Authentication.
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card bg-white bg-opacity-10 border-0 text-white">
                      <div className="card-body">
                        <h5>📄 Digital</h5>
                        <small className="text-white-50">
                          Paperless HR documentation.
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card bg-white bg-opacity-10 border-0 text-white">
                      <div className="card-body">
                        <h5>📊 Track</h5>
                        <small className="text-white-50">
                          Monitor document status in real time.
                        </small>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* Right Side */}

            <div className="col-lg-5">

              <div className="d-flex justify-content-center">

                <div
                  className="card shadow-lg border-0"
                  style={{
                    width: "100%",
                    maxWidth: 430,
                    borderRadius: 20,
                  }}
                >
                  <div className="card-body p-5">

                    <div className="text-center mb-5">

                      <div
                        className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3"
                        style={{
                          width: 70,
                          height: 70,
                          fontSize: 28,
                        }}
                      >
                        📄
                      </div>

                      <h2 className="fw-bold mb-2">
                        Welcome
                      </h2>

                      <p className="text-muted mb-0">
                        Sign in using your organization Google account.
                      </p>

                    </div>

                    <button
                      onClick={login}
                      className="btn btn-outline-dark w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-3"
                    >
                      <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        width="22"
                      />

                      Continue with Google
                    </button>

                    <hr className="my-4" />

                    <div className="text-center text-muted small">

                      Only authorized users can access the
                      E-Sign Portal.

                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
      <ToastMessage
        show={toast.show}
        title={toast.title}
        message={toast.message}
        bg={toast.bg}
        onClose={() =>
          setToast((prev) => ({
            ...prev,
            show: false,
          }))
        }
      />
    </>
  );
}