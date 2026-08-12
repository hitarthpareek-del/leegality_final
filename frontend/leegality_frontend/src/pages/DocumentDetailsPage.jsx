import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Layout/Header";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Stack,
  ListGroup,
} from "react-bootstrap";

import {
  getDocumentDetails,
  deleteDocument,
  reactivateDocument,
  downloadDocument,
  markDocumentComplete,
} from "../services/documentService";

import useAuth from "../context/useAuth";
import useCompany from "../context/useCompany";

import ConfirmModal from "../components/Common/ConfirmModal";
import ToastMessage from "../components/Common/ToastMessage";

import InviteesSection from "../components/DocumentDetails/InviteesSection";
import SignersCard from "../components/DocumentDetails/SignersCard";

export default function DocumentDetailsPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { selectedCompany } = useCompany();

  const [documentData, setDocumentData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
    bg: "success",
  });

  const [confirm, setConfirm] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // =========================================================
  // LOAD FRESH DOCUMENT DETAILS FROM API
  // =========================================================

  const loadDocument = useCallback(async () => {
    if (!documentId || !user?.token || !selectedCompany) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log(
        "Loading fresh document details:",
        documentId
      );

      const details = await getDocumentDetails(
        documentId,
        selectedCompany,
        user.token
      );

      if (!details) {
        throw new Error("Document details not found.");
      }

      console.log(
        "Fresh document details received:",
        details
      );

      setDocumentData(details);
    } catch (err) {
      console.error(
        "Failed to load document details:",
        err
      );

      setDocumentData(null);

      setError(
        err.response?.data?.message ||
          err.response?.data?.messages?.[0]?.message ||
          err.message ||
          "Unable to load document."
      );
    } finally {
      setLoading(false);
    }
  }, [documentId, selectedCompany, user?.token]);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // =========================================================
  // TOAST
  // =========================================================

  function showToast(
    title,
    message,
    bg = "success"
  ) {
    setToast({
      show: true,
      title,
      message,
      bg,
    });
  }

  // =========================================================
  // CONFIRM MODAL
  // =========================================================

  function showConfirm(
    title,
    message,
    onConfirm
  ) {
    setConfirm({
      show: true,
      title,
      message,
      onConfirm,
    });
  }

  function closeConfirm() {
    setConfirm({
      show: false,
      title: "",
      message: "",
      onConfirm: null,
    });
  }

  // =========================================================
  // DELETE DOCUMENT
  // =========================================================

  function handleDeleteDocument() {
    showConfirm(
      "Delete Document",
      "Are you sure you want to delete this document? This action cannot be undone.",
      async () => {
        try {
          const response = await deleteDocument(
            documentId,
            selectedCompany,
            user.token
          );

          closeConfirm();

          if (response.status === 1) {
            showToast(
              "Success",
              response.messages?.[0]?.message ||
                "Document deleted successfully.",
              "success"
            );

            /*
             * Tell Dashboard that its document list must
             * be refreshed when we return.
             */
            sessionStorage.setItem(
              "dashboardRefresh",
              "true"
            );

            setTimeout(() => {
              navigate(-1);
            }, 800);
          } else {
            showToast(
              "Error",
              response.messages?.[0]?.message ||
                "Failed to delete document.",
              "danger"
            );
          }
        } catch (error) {
          console.error(
            "Delete document error:",
            error
          );

          closeConfirm();

          showToast(
            "Error",
            error.response?.data?.messages?.[0]?.message ||
              error.response?.data?.message ||
              error.message ||
              "Failed to delete document.",
            "danger"
          );
        }
      }
    );
  }

  // =========================================================
  // MARK DOCUMENT COMPLETE
  // =========================================================

  async function markingComplete() {
    try {
      const response = await markDocumentComplete(
        documentId,
        selectedCompany,
        user.token
      );

      if (response.status === 1) {
        showToast(
          "Success",
          response.messages?.[0]?.message ||
            "Document marked as complete.",
          "success"
        );

        /*
         * IMPORTANT:
         * Fetch completely fresh data from API.
         */
        await loadDocument();

        /*
         * Tell Dashboard to refresh when user returns.
         */
        sessionStorage.setItem(
          "dashboardRefresh",
          "true"
        );

        return true;
      }

      showToast(
        "Error",
        response.messages?.[0]?.message ||
          "Unable to mark document as complete.",
        "danger"
      );

      return false;
    } catch (error) {
      console.error(
        "Mark document complete error:",
        error
      );

      showToast(
        "Error",
        error.response?.data?.messages?.[0]?.message ||
          error.response?.data?.message ||
          error.message ||
          "Unable to mark document as complete.",
        "danger"
      );

      return false;
    }
  }

  // =========================================================
  // MARK COMPLETE VALIDATION
  // =========================================================

  function handleMarkComplete() {
    const invitations =
      documentData?.invitations || [];

    const allSigned =
      invitations.length > 0 &&
      invitations.every(
        (invitation) =>
          invitation.invitationStatus?.signed
      );

    if (!allSigned) {
      showToast(
        "Error",
        "Cannot mark document as complete. Please delete unsigned or expired invitations first.",
        "danger"
      );

      return;
    }

    showConfirm(
      "Mark Complete",
      "Are you sure you want to mark this document as complete?",
      async () => {
        closeConfirm();

        await markingComplete();
      }
    );
  }

  // =========================================================
  // REACTIVATE DOCUMENT
  // =========================================================

  function handleReactivateDocument() {
    showConfirm(
      "Reactivate Document",
      "Are you sure you want to reactivate this expired document?",
      async () => {
        try {
          const response =
            await reactivateDocument(
              documentId,
              selectedCompany,
              user.token
            );

          closeConfirm();

          if (response.status === 1) {
            showToast(
              "Success",
              response.messages?.[0]?.message ||
                "Document reactivated successfully.",
              "success"
            );

            /*
             * Fetch fresh document state.
             */
            await loadDocument();

            /*
             * Tell Dashboard to refresh later.
             */
            sessionStorage.setItem(
              "dashboardRefresh",
              "true"
            );
          } else {
            showToast(
              "Error",
              response.messages?.[0]?.message ||
                "Failed to reactivate document.",
              "danger"
            );
          }
        } catch (error) {
          console.error(
            "Reactivate document error:",
            error
          );

          closeConfirm();

          showToast(
            "Error",
            error.response?.data?.messages?.[0]?.message ||
              error.response?.data?.message ||
              error.message ||
              "Failed to reactivate document.",
            "danger"
          );
        }
      }
    );
  }

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  async function handleDownloadPDF(
    documentType
  ) {
    try {
      const response =
        await downloadDocument(
          documentId,
          documentType,
          selectedCompany,
          user.token
        );

      if (
        response.status === 1 &&
        response.data?.file
      ) {
        const link =
          document.createElement("a");

        link.href = response.data.file;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return;
      }

      showToast(
        "Error",
        response.messages?.[0]?.message ||
          "Unable to open document.",
        "danger"
      );
    } catch (error) {
      console.error(
        "Download document error:",
        error
      );

      showToast(
        "Error",
        error.response?.data?.message ||
          error.response?.data?.messages?.[0]?.message ||
          error.message ||
          "Unable to open document.",
        "danger"
      );
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <>
        <Header title="Document Details" />

        <Container fluid className="p-4">
          <Alert variant="danger">
            {error}
          </Alert>

          <Button
            variant="outline-secondary"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back
          </Button>
        </Container>
      </>
    );
  }

  // =========================================================
  // NO DATA
  // =========================================================

  if (!documentData) {
    return null;
  }

  // =========================================================
  // DOCUMENT DATA
  // =========================================================

  const doc =
    documentData.document || {};

  const invitations =
    documentData.invitations || [];

  const total =
    invitations.length;

  const signed =
    invitations.filter(
      (x) =>
        x.invitationStatus?.signed
    ).length;

  const expired =
    invitations.filter(
      (x) =>
        x.invitationStatus?.expired
    ).length;

  const pending =
    invitations.filter(
      (x) =>
        !x.invitationStatus?.signed &&
        !x.invitationStatus?.expired
    ).length;

  // =========================================================
  // DOCUMENT STATUS
  // =========================================================

  let status = "Draft";

  if (doc.status === "COMPLETED") {
    status = "Completed";
  } else if (invitations.length) {
    if (
      expired === invitations.length
    ) {
      status = "Expired";
    } else {
      status = "Sent";
    }
  }

  const statusColor = {
    Draft: "secondary",
    Sent: "primary",
    Completed: "success",
    Expired: "danger",
  };

  // =========================================================
  // PARTIAL EXPIRED
  // =========================================================

  const isPartialExpired =
    status === "Sent" &&
    signed > 0 &&
    pending === 0 &&
    expired > 0;

  // =========================================================
  // ACTIVE UNSIGNED INVITEE
  // =========================================================

  const hasActiveUnsigned =
    invitations.some(
      (invitation) =>
        invitation.invitationStatus?.active &&
        !invitation.invitationStatus?.signed
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <Header title={doc.name} />

      <Container fluid className="p-4">

        {/* =====================================================
            DOCUMENT OVERVIEW
        ====================================================== */}

        <Card className="border-0 shadow-sm mb-4">

          <Card.Header className="bg-white border-bottom py-3 px-4">

            <div className="d-flex justify-content-between align-items-center">

              <div>
                <h5 className="mb-1 fw-600">
                  Document Details
                </h5>
              </div>

              <Badge
                bg={statusColor[status]}
                className="rounded-pill px-3 py-2"
              >
                <small className="fw-600">
                  {status}
                </small>
              </Badge>

            </div>

          </Card.Header>

          <Card.Body className="p-0">

            <Row className="g-0">

              {/* =================================================
                  LEFT COLUMN
              ================================================== */}

              <Col
                lg={8}
                className="border-end p-4"
              >

                <Row className="g-4">

                  {/* =================================================
                      SIGNING PROGRESS
                  ================================================== */}

                  <Col xs={12}>

                    <h6
                      className="fw-600 text-uppercase mb-3"
                      style={{
                        fontSize: "0.75rem",
                        letterSpacing: "0.5px",
                        color: "#6c757d",
                      }}
                    >
                      Signing Progress
                    </h6>

                    <Row className="g-3 mb-3">

                      <Col xs={6} sm={3}>
                        <div className="p-3 rounded-2 text-center border">
                          <h4 className="mb-1">
                            {total}
                          </h4>

                          <small className="text-muted d-block">
                            Total Invitees
                          </small>
                        </div>
                      </Col>

                      <Col xs={6} sm={3}>
                        <div className="p-3 rounded-2 text-center border border-success bg-success bg-opacity-10">
                          <h4 className="mb-1 text-success">
                            {signed}
                          </h4>

                          <small className="text-muted d-block">
                            Signed
                          </small>
                        </div>
                      </Col>

                      <Col xs={6} sm={3}>
                        <div className="p-3 rounded-2 text-center border border-warning bg-warning bg-opacity-10">
                          <h4 className="mb-1 text-warning">
                            {pending}
                          </h4>

                          <small className="text-muted d-block">
                            Pending
                          </small>
                        </div>
                      </Col>

                      <Col xs={6} sm={3}>
                        <div className="p-3 rounded-2 text-center border border-danger bg-danger bg-opacity-10">
                          <h4 className="mb-1 text-danger">
                            {expired}
                          </h4>

                          <small className="text-muted d-block">
                            Expired
                          </small>
                        </div>
                      </Col>

                    </Row>

                    {/* =================================================
                        DOCUMENT INFORMATION
                    ================================================== */}

                    <ListGroup
                      variant="flush"
                      className="border rounded-2 overflow-hidden"
                    >

                      <ListGroup.Item className="px-3 py-3 d-flex justify-content-between">
                        <span className="text-muted small">
                          Document ID
                        </span>

                        <span className="font-monospace small fw-500">
                          {doc.id || "-"}
                        </span>
                      </ListGroup.Item>

                      {doc.irn && (
                        <ListGroup.Item className="px-3 py-3 d-flex justify-content-between">
                          <span className="text-muted small">
                            IRN
                          </span>

                          <strong>
                            {doc.irn}
                          </strong>
                        </ListGroup.Item>
                      )}

                      <ListGroup.Item className="px-3 py-3 d-flex justify-content-between">
                        <span className="text-muted small">
                          Created Date
                        </span>

                        <strong>
                          {doc.creationDate || "-"}
                        </strong>
                      </ListGroup.Item>

                      {doc.completionDate && (
                        <ListGroup.Item className="px-3 py-3 d-flex justify-content-between bg-success bg-opacity-10">
                          <span className="text-muted small">
                            Completed Date
                          </span>

                          <strong className="text-success">
                            {doc.completionDate}
                          </strong>
                        </ListGroup.Item>
                      )}

                    </ListGroup>

                  </Col>

                </Row>

              </Col>

              {/* =================================================
                  RIGHT COLUMN - ACTIONS
              ================================================== */}

              <Col
                lg={4}
                className="p-4 bg-light"
              >

                <h6
                  className="fw-600 text-uppercase mb-3"
                  style={{
                    fontSize: "0.75rem",
                    letterSpacing: "0.5px",
                    color: "#6c757d",
                  }}
                >
                  Document Actions
                </h6>

                <Stack gap={2} className="mb-4">

                  {/* DOWNLOAD DOCUMENT */}

                  <Button
                    onClick={() =>
                      handleDownloadPDF(
                        "DOCUMENT"
                      )
                    }
                    className="d-flex align-items-center justify-content-between"
                  >
                    <span>
                      Download PDF
                    </span>

                    <span>↓</span>
                  </Button>

                  {/* DOWNLOAD AUDIT TRAIL */}

                  {doc.status === "COMPLETED" && (
                    <Button
                      variant="success"
                      onClick={() =>
                        handleDownloadPDF(
                          "AUDIT_TRAIL"
                        )
                      }
                      className="d-flex align-items-center justify-content-between"
                    >
                      <span>
                        Download Audit Trail
                      </span>

                      <span>↓</span>
                    </Button>
                  )}

                  {/* MARK COMPLETE */}

                  {status === "Sent" &&
                    (hasActiveUnsigned ||
                      !isPartialExpired) && (
                      <Button
                        variant="warning"
                        onClick={
                          handleMarkComplete
                        }
                        className="d-flex align-items-center justify-content-between"
                      >
                        <span>
                          Mark Complete
                        </span>

                        <span>✓</span>
                      </Button>
                    )}

                  {/* REACTIVATE */}

                  {(status === "Expired" ||
                    isPartialExpired) && (
                    <Button
                      variant="info"
                      onClick={
                        handleReactivateDocument
                      }
                      className="d-flex align-items-center justify-content-between"
                    >
                      <span>
                        Reactivate Document
                      </span>

                      <span>⟳</span>
                    </Button>
                  )}

                </Stack>

                <hr className="my-3" />

                {/* DELETE DOCUMENT */}

                <div className="d-grid gap-2">

                  <Button
                    variant="outline-danger"
                    onClick={
                      handleDeleteDocument
                    }
                    className="fw-600"
                  >
                    Delete Document
                  </Button>

                </div>

                {/* =================================================
                    STATUS INFORMATION
                ================================================== */}

                <div className="mt-4 p-3 rounded-2 bg-primary bg-opacity-10 border border-primary border-opacity-25">

                  <small className="fw-600 d-block mb-1 text-primary">
                    Status Information
                  </small>

                  <small className="text-muted d-block">

                    {status === "Draft" &&
                      "This document is in draft status. Send invitations to start the signing process."}

                    {status === "Sent" &&
                      "Waiting for signatures from all invitees."}

                    {status === "Completed" &&
                      "All signatures collected successfully!"}

                    {status === "Expired" &&
                      "This document has expired. Reactivate to send new invitations."}

                  </small>

                </div>

              </Col>

            </Row>

          </Card.Body>

        </Card>

        {/* =====================================================
            INVITEES
        ====================================================== */}

        <Row className="g-3 mb-4">

          <Col xs={12}>

            <InviteesSection
              invitations={invitations}
              doc={doc}
              onRefresh={loadDocument}
              isPartialExpired={
                isPartialExpired
              }
              hasActiveUnsigned={
                hasActiveUnsigned
              }
              status={status}
            />

          </Col>

        </Row>

        {/* =====================================================
            SIGNERS
        ====================================================== */}

        {documentData.signers?.length > 0 && (
          <Row className="g-3 mb-4">

            <Col xs={12}>

              <SignersCard
                signers={
                  documentData.signers
                }
              />

            </Col>

          </Row>
        )}

        {/* =====================================================
            CONFIRM MODAL
        ====================================================== */}

        <ConfirmModal
          show={confirm.show}
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onClose={closeConfirm}
        />

        {/* =====================================================
            TOAST
        ====================================================== */}

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

      </Container>
    </>
  );
}