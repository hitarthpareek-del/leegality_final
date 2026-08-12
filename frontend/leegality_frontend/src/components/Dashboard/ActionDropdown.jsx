import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ActionDropdown({
  document,
  allDocumentsList,
  onRefresh,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  if (!document) {
    return null;
  }

  const handleView = () => {
    navigate(`/documents/${document.documentId}`, {
      state: {
        allDocumentsList,
      },
    });
  };

  const handleDownload = () => {
    console.log("Download document:", document.documentId);
    // Add download functionality here
  };

  const handleDelete = () => {
    console.log("Delete document:", document.documentId);
    // Add delete functionality here
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-sm btn-outline-secondary"
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        title="Document actions"
      >
        <i className="bi bi-three-dots-vertical"></i>
      </button>
      {showMenu && (
        <div className="dropdown-menu show" style={{ position: "absolute", right: 0, zIndex: 1000 }}>
          <button
            className="dropdown-item"
            onClick={() => {
              handleView();
              setShowMenu(false);
            }}
          >
            <i className="bi bi-eye me-2"></i>View
          </button>
          {/* <button
            className="dropdown-item"
            onClick={() => {
              handleDownload();
              setShowMenu(false);
            }}
          >
            <i className="bi bi-download me-2"></i>Download
          </button> */}
          {/* <hr className="dropdown-divider" />
            <button
              className="dropdown-item text-danger"
              onClick={() => {
                handleDelete();
                setShowMenu(false);
              }}
            >
              <i className="bi bi-trash me-2"></i>Delete
            </button> */}
        </div>
      )}
    </div>
  );
}