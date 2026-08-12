import StatusBadge from "./StatusBadge";
import ActionDropdown from "./ActionDropdown";
import { useEffect, useState } from "react";

export default function DocumentRow({
  document,
  index,
  allDocumentsList,
  onRefresh,
}) {
  return (
    <tr>
      {index !== undefined && (
        <td
          className="text-center text-muted fw-bold small"
          style={{ width: 50 }}
        >
          {index}
        </td>
      )}

      {/* Name */}

      <td style={{ minWidth: 150 }}>
        <div className="fw-semibold">
          {document.signerName || "-"}
        </div>

        <small className="text-muted">
          Signer
        </small>
      </td>

      {/* Created On */}
      <td style={{ minWidth: 150 }}>
        <div className="fw-semibold">
          {document.creationDate || "-"}
        </div>

        <small className="text-muted">
          Time : {document.creationTime || "-"}
        </small>
      </td>

      {/* Document */}

      <td style={{ minWidth: 230 }}>
        <div className="fw-semibold text-dark">
          <i className="bi bi-file-earmark-pdf-fill text-danger me-2"></i>

          {document.name
            ? document.name.length > 50
              ? `${document.name.slice(0, 50)}...`
              : document.name
            : "Untitled Document"}
        </div>

        <small className="text-muted d-inline-block me-3">
          <strong>ID:</strong>{" "}
          {document.documentId || document.id || "-"}
        </small>

        <small className="text-muted d-inline-block">
          <strong>IRN:</strong>{" "}
          {document.irn || "-"}
        </small>
      </td>

      {/* Folder */}

      <td>
        <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
          <i className="bi bi-people-fill me-1"></i>
          {document.total_signed}/{document.total_invitee}
        </span>
      </td>

      {/* Status */}

      <td>
        <StatusBadge status={document.status} />
      </td>

      {/* Actions */}

      <td className="text-end">
        <ActionDropdown
          document={document}
          allDocumentsList={allDocumentsList}
          onRefresh={onRefresh}
        />
      </td>
    </tr>
  );
}