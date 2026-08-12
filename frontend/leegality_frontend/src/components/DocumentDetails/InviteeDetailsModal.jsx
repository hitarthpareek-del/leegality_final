import {
  Modal,
  Button,
  Badge,
  ListGroup,
  Row,
  Col,
} from "react-bootstrap";


export default function InviteeDetailsModal({
  invitee,
  onHide,
}) {


  if (!invitee) {
    return null;
  }


  function getStatus() {
    const status = invitee.invitationStatus;

    if (status.signed) {
      return {
        text: "Signed",
        variant: "success",
        description: "Document has been signed"
      };
    }

    if (status.expired) {
      return {
        text: "Expired",
        variant: "danger",
        description: "Signing window has expired"
      };
    }

    if (status.active) {
      return {
        text: "Active",
        variant: "warning",
        description: "Awaiting signature"
      };
    }

    return {
      text: "Waiting",
      variant: "secondary",
      description: "Invitation pending"
    };
  }


  const status = getStatus();
  const invStatus = invitee.invitationStatus;


  return (
    <Modal
      show={!!invitee}
      onHide={onHide}
      centered
      size="md"
      dialogClassName="modal-modern"
    >
      <Modal.Header closeButton className="border-0 py-3">
        <div className="w-100">
          <Modal.Title className="fw-600">
            Invitee Details
          </Modal.Title>
          <small className="text-muted d-block mt-1">
            Complete signing information
          </small>
        </div>
      </Modal.Header>

      <Modal.Body className="px-4 py-3">
        {/* Header with Name and Status */}
        <div className="mb-4 p-3 bg-light rounded-3">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="mb-1 fw-600">
                {invitee.name}
              </h5>
              <p className="text-muted mb-0 small">
                {invitee.email}
              </p>
            </div>
            <div className="text-end">
              <Badge bg={status.variant} className="rounded-pill px-3 mb-2">
                <small className="fw-600">{status.text}</small>
              </Badge>
              <p className="text-muted mb-0 small">
                {status.description}
              </p>
            </div>
          </div>
        </div>

        {/* Information Grid */}
        <div className="mb-4">
          <h6 className="fw-600 text-uppercase mb-3 text-muted" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
            Contact Information
          </h6>

          <Row className="g-3">
            <Col xs={12}>
              <div className="border-start border-3 border-primary ps-3">
                <small className="text-muted d-block mb-1">Email Address</small>
                <p className="mb-0 fw-500">
                  <a href={`mailto:${invitee.email}`} className="text-decoration-none">
                    {invitee.email}
                  </a>
                </p>
              </div>
            </Col>

            {invitee.phone && (
              <Col xs={12}>
                <div className="border-start border-3 border-info ps-3">
                  <small className="text-muted d-block mb-1">Phone Number</small>
                  <p className="mb-0 fw-500">
                    <a href={`tel:${invitee.phone}`} className="text-decoration-none">
                      {invitee.phone}
                    </a>
                  </p>
                </div>
              </Col>
            )}

            <Col xs={12}>
              <div className="border-start border-3 border-secondary ps-3">
                <small className="text-muted d-block mb-1">Invitee Type</small>
                <p className="mb-0 fw-500">
                  <Badge bg="light" text="dark" className="rounded-pill">
                    {invitee.inviteeType || "-"}
                  </Badge>
                </p>
              </div>
            </Col>
          </Row>
        </div>

        {/* Signing Details */}
        <div className="mb-4">
          <h6 className="fw-600 text-uppercase mb-3 text-muted" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
            Signing Details
          </h6>

          <ListGroup variant="flush" className="border rounded-2 overflow-hidden">
            <ListGroup.Item className="d-flex justify-content-between align-items-center px-3 py-2">
              <span className="text-muted small">Signature Method</span>
              <strong>{invitee.usedSignatureType || "-"}</strong>
            </ListGroup.Item>

            <ListGroup.Item className="d-flex justify-content-between align-items-center px-3 py-2">
              <span className="text-muted small">Created Date</span>
              <strong>{invStatus.creationDate || "-"}</strong>
            </ListGroup.Item>

            <ListGroup.Item className="d-flex justify-content-between align-items-center px-3 py-2">
              <span className="text-muted small">Expiry Date</span>
              <strong className="text-warning">{invStatus.expiryDate || "-"}</strong>
            </ListGroup.Item>

            {invStatus.signDate && (
              <ListGroup.Item className="d-flex justify-content-between align-items-center px-3 py-2 bg-success bg-opacity-10">
                <span className="text-muted small">Signed Date</span>
                <strong className="text-success">{invStatus.signDate}</strong>
              </ListGroup.Item>
            )}
          </ListGroup>
        </div>

        {/* Status Summary */}
        <div className="mb-3">
          <h6 className="fw-600 text-uppercase mb-3 text-muted" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
            Status Summary
          </h6>

          <Row className="g-2">
            <Col xs={6} sm={3}>
              <div className="text-center p-2 rounded-2 border">
                <small className="d-block text-muted mb-1">Active</small>
                <Badge bg={invStatus.active ? "success" : "secondary"}>
                  {invStatus.active ? "Yes" : "No"}
                </Badge>
              </div>
            </Col>

            <Col xs={6} sm={3}>
              <div className="text-center p-2 rounded-2 border">
                <small className="d-block text-muted mb-1">Signed</small>
                <Badge bg={invStatus.signed ? "success" : "secondary"}>
                  {invStatus.signed ? "Yes" : "No"}
                </Badge>
              </div>
            </Col>

            <Col xs={6} sm={3}>
              <div className="text-center p-2 rounded-2 border">
                <small className="d-block text-muted mb-1">Expired</small>
                <Badge bg={invStatus.expired ? "danger" : "secondary"}>
                  {invStatus.expired ? "Yes" : "No"}
                </Badge>
              </div>
            </Col>

            <Col xs={6} sm={3}>
              <div className="text-center p-2 rounded-2 border">
                <small className="d-block text-muted mb-1">Rejected</small>
                <Badge bg={invStatus.rejected ? "danger" : "secondary"}>
                  {invStatus.rejected ? "Yes" : "No"}
                </Badge>
              </div>
            </Col>
          </Row>
        </div>

      </Modal.Body>

      <Modal.Footer className="border-top py-3">
        <Button
          variant="secondary"
          onClick={onHide}
          className="px-4"
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}