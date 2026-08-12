import {
  Card,
  Badge,
  Row,
  Col,
  Table,
} from "react-bootstrap";


export default function SignersCard({
  signers = [],
}) {


  if (!signers.length) {
    return null;
  }


  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-bottom py-3 px-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-0 fw-600">
              Authorized Signers
            </h6>
            <small className="text-muted">Legal representatives authorized to sign</small>
          </div>
          <Badge bg="light" text="dark" className="rounded-pill px-3">
            <small className="fw-600">{signers.length} Signer{signers.length > 1 ? "s" : ""}</small>
          </Badge>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover borderless className="mb-0 align-middle">
            <thead>
              <tr className="border-bottom border-2 bg-light">
                <th className="fw-600 text-muted small text-uppercase px-4 py-3">#</th>
                <th className="fw-600 text-muted small text-uppercase py-3">Name</th>
                <th className="fw-600 text-muted small text-uppercase py-3">Title</th>
                <th className="fw-600 text-muted small text-uppercase py-3">State</th>
                <th className="fw-600 text-muted small text-uppercase py-3">Pincode</th>
              </tr>
            </thead>
            <tbody>
              {signers.map((signer, index) => (
                <tr key={index} className="border-bottom">
                  <td className="px-4 py-3">
                    <Badge bg="info" className="rounded-circle" style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <small className="fw-600">{index + 1}</small>
                    </Badge>
                  </td>

                  <td className="py-3">
                    <div>
                      <p className="mb-0 fw-600 small">
                        {signer.name || "-"}
                      </p>
                      {signer.state && (
                        <small className="text-muted">
                          {signer.state}
                        </small>
                      )}
                    </div>
                  </td>

                  <td className="py-3">
                    <small>{signer.title || "-"}</small>
                  </td>

                  <td className="py-3">
                    <Badge bg="light" text="dark" className="rounded-pill px-2 py-1">
                      <small>{signer.state || "-"}</small>
                    </Badge>
                  </td>

                  <td className="py-3">
                    <small className="font-monospace fw-500">
                      {signer.pincode || "-"}
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Alternative Grid View */}
        {/* <Row className="g-3 p-4">
          {signers.map((signer, index) => (
            <Col lg={6} key={index}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-3">
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div className="bg-info bg-opacity-10 rounded-circle p-3" style={{ minWidth: "45px" }}>
                      <span className="fw-600 text-info d-block text-center">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-600">
                        {signer.name || "-"}
                      </h6>
                      {signer.title && (
                        <p className="text-muted small mb-2">
                          {signer.title}
                        </p>
                      )}
                    </div>
                  </div>

                  <hr className="my-2" />

                  <div className="small">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">State:</span>
                      <Badge bg="light" text="dark" className="rounded-pill px-2">
                        {signer.state || "-"}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Pincode:</span>
                      <span className="fw-500 font-monospace">
                        {signer.pincode || "-"}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row> */}
      </Card.Body>
    </Card>
  );
}