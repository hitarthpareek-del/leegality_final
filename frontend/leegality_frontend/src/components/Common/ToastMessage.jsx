// src/components/Common/ToastMessage.jsx

import { Toast, ToastContainer } from "react-bootstrap";

export default function ToastMessage({
  show,
  onClose,
  title,
  message,
  bg = "success",
}) {
  const icon =
    bg === "success"
      ? "✅"
      : bg === "danger"
      ? "❌"
      : bg === "warning"
      ? "⚠️"
      : "ℹ️";

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 999999,
        pointerEvents: "none",
      }}
    >
      <Toast
        show={show}
        bg={bg}
        delay={3000}
        autohide
        onClose={onClose}
        style={{
          pointerEvents: "auto",
          minWidth: "300px",
        }}
      >
        <Toast.Header>
          <strong className="me-auto">
            {icon} {title}
          </strong>
        </Toast.Header>

        <Toast.Body className="text-white">
          {message}
        </Toast.Body>
      </Toast>
    </div>
  );                  
}