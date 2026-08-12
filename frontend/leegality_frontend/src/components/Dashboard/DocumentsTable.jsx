import DocumentRow from "./DocumentRow";
import "./DocumentsTable.css";

export default function DocumentsTable({
  documents = [],
  startIndex = 1,
  allDocumentsList,
  onRefresh,
}) {
  if (!documents || documents.length === 0) {
    return (
      <div className="documents-empty">
        <div className="documents-empty-icon">
          <i className="bi bi-file-earmark-text"></i>
        </div>

        <h6 className="documents-empty-title">
          No documents found
        </h6>

        <p className="documents-empty-text">
          There are no documents to display here.
        </p>
      </div>
    );
  }

  return (
    <div className="documents-table-card">
      <div className="table-responsive">
        <table className="table documents-table mb-0">
          <thead>
            <tr>
              <th className="documents-index-col">#</th>

              <th>
                <span className="table-heading">
                  <i className="bi bi-file-earmark-text"></i>
                  Name
                </span>
              </th>

              <th>
                <span className="table-heading">
                  <i className="bi bi-calendar3"></i>
                  Created On
                </span>
              </th>

              <th>
                <span className="table-heading">
                  <i className="bi bi-file-earmark"></i>
                  Document
                </span>
              </th>

              <th>
                <span className="table-heading">
                  <i className="bi bi-bar-chart"></i>
                  Completion
                </span>
              </th>

              <th>
                <span className="table-heading">
                  <i className="bi bi-circle-half"></i>
                  Status
                </span>
              </th>

              <th className="text-end">
                <span className="table-heading justify-content-end">
                  Actions
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            {documents.map((document, idx) => (
              <DocumentRow
                key={
                  document.documentId ||
                  document.id ||
                  document.irn ||
                  `doc-${idx}`
                }
                index={startIndex + idx}
                document={document}
                allDocumentsList={allDocumentsList}
                onRefresh={onRefresh}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}