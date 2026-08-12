import {
  Card,
  Badge,
  Button,
  Row,
  Col,
  ButtonGroup,
  Table,
} from "react-bootstrap";

import { useState, useCallback } from "react";
import InviteeDetailsModal from "./InviteeDetailsModal";
import useAuth from "../../context/useAuth";
import useCompany from "../../context/useCompany";
import {
  activateInvitee,
  deleteInvitee,
  resendInvitation,
} from "../../services/documentService";
import ToastMessage from "../Common/ToastMessage";

export default function InviteesSection({
  invitations = [],
  doc,
  onRefresh,
  isPartialExpired = false,
  hasActiveUnsigned = false,
  status = "Draft",
}) {
  const [selectedInvitee, setSelectedInvitee] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  const { user } = useAuth();
  const { selectedCompany } = useCompany();

  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
    bg: "success",
  });

  function showToast(title, message, bg = "success") {
    setToast({
      show: true,
      title,
      message,
      bg,
    });
  }

  /*
   * Wait before refreshing so the toast has time
   * to become visible to the user.
   */
  const refreshAfterToast = useCallback(async () => {
    if (!onRefresh) return;

    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

    await onRefresh();
  }, [onRefresh]);

  function getVisibleButtons(invitation) {
    const invStatus = invitation.invitationStatus || {};

    // If signed, only show Details
    if (invStatus.signed) {
      return ["details"];
    }

    // If document is Expired, only details
    if (status === "Expired") {
      return ["details"];
    }

    // If Sent and partial expired, only details
    if (status === "Sent" && isPartialExpired) {
      return ["details"];
    }

    // If invitation is expired, only details
    if (invStatus.expired) {
      return ["details"];
    }

    // If active and unsigned
    if (invStatus.active && !invStatus.signed) {
      return ["details", "resend", "delete"];
    }

    // If inactive and unsigned
    if (!invStatus.active && !invStatus.signed && !invStatus.expired) {
      return ["details", "activate", "delete"];
    }

    return ["details"];
  }

  /*
   * ACTIVATE INVITEE
   */
  const handleActivateInvitee = useCallback(
    async (invitationUrl) => {
      try {
        if (!invitationUrl) {
          showToast(
            "Error",
            "Sign URL is missing.",
            "danger"
          );
          return;
        }

        if (!user?.token) {
          showToast(
            "Error",
            "User authentication token is missing.",
            "danger"
          );
          return;
        }

        const response = await activateInvitee(
          invitationUrl,
          selectedCompany,
          user.token
        );

        console.log("Activate response:", response);

        if (response.status === 1) {
          showToast(
            "Success",
            response.messages?.[0]?.message ||
              "Invitee activated successfully.",
            "success"
          );

          // Toast remains visible for 2 seconds,
          // then refresh happens.
          await refreshAfterToast();
        } else {
          showToast(
            "Error",
            response.messages?.[0]?.message ||
              response.message ||
              "Failed to activate invitee.",
            "danger"
          );
        }
      } catch (error) {
        console.error(
          "Activate invitee error:",
          error.response?.data || error
        );

        showToast(
          "Error",
          error.response?.data?.message ||
            error.response?.data?.messages?.[0]?.message ||
            error.message ||
            "Failed to activate invitee.",
          "danger"
        );
      }
    },
    [
      selectedCompany,
      user?.token,
      refreshAfterToast,
    ]
  );

  /*
   * DELETE INVITEE
   */
  const handleDeleteInvitee = useCallback(
    async (invitationUrl) => {
      try {
        if (!invitationUrl) {
          showToast(
            "Error",
            "Sign URL is missing.",
            "danger"
          );
          return;
        }

        if (!user?.token) {
          showToast(
            "Error",
            "User authentication token is missing.",
            "danger"
          );
          return;
        }

        const response = await deleteInvitee(
          invitationUrl,
          selectedCompany,
          user.token
        );

        console.log("Delete response:", response);

        if (response.status === 1) {
          showToast(
            "Success",
            response.messages?.[0]?.message ||
              "Invitee deleted successfully.",
            "success"
          );

          // Toast remains visible for 2 seconds,
          // then refresh happens.
          await refreshAfterToast();
        } else {
          showToast(
            "Error",
            response.messages?.[0]?.message ||
              response.message ||
              "Failed to delete invitee.",
            "danger"
          );
        }
      } catch (error) {
        console.error(
          "Delete invitee error:",
          error.response?.data || error
        );

        showToast(
          "Error",
          error.response?.data?.message ||
            error.response?.data?.messages?.[0]?.message ||
            error.message ||
            "Failed to delete invitee.",
          "danger"
        );
      }
    },
    [
      selectedCompany,
      user?.token,
      refreshAfterToast,
    ]
  );

  /*
   * RESEND INVITATION
   */
  const handleResendInvitee = useCallback(
    async (signUrl) => {
      try {
        if (!signUrl) {
          showToast(
            "Error",
            "Sign URL is missing.",
            "danger"
          );
          return;
        }

        if (!user?.token) {
          showToast(
            "Error",
            "User authentication token is missing.",
            "danger"
          );
          return;
        }

        const response = await resendInvitation(
          signUrl,
          selectedCompany,
          user.token
        );

        console.log("Resend response:", response);

        if (response.status === 1) {
          showToast(
            "Success",
            response.messages?.[0]?.message ||
              "Invitation resent successfully.",
            "success"
          );

          // Toast remains visible for 2 seconds,
          // then refresh happens.
          await refreshAfterToast();
        } else {
          showToast(
            "Error",
            response.messages?.[0]?.message ||
              response.message ||
              "Failed to resend invitation.",
            "danger"
          );
        }
      } catch (error) {
        console.error(
          "Resend invitation error:",
          error.response?.data || error
        );

        showToast(
          "Error",
          error.response?.data?.message ||
            error.response?.data?.messages?.[0]?.message ||
            error.message ||
            "Failed to resend invitation.",
          "danger"
        );
      }
    },
    [
      selectedCompany,
      user?.token,
      refreshAfterToast,
    ]
  );

  function getStatus(invitation) {
    const status = invitation.invitationStatus || {};

    if (status.signed) {
      return {
        text: "Signed",
        variant: "success",
        icon: "✓",
      };
    }

    if (status.expired) {
      return {
        text: "Expired",
        variant: "danger",
        icon: "⚠",
      };
    }

    if (status.active) {
      return {
        text: "Active",
        variant: "warning",
        icon: "●",
      };
    }

    return {
      text: "Waiting",
      variant: "secondary",
      icon: "○",
    };
  }

  if (!invitations.length) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="py-5 text-center">
          <div className="mb-3">
            <i
              className="bi bi-inbox"
              style={{
                fontSize: "2rem",
                color: "#dee2e6",
              }}
            />
          </div>

          <h6 className="text-muted mb-1">
            No Invitees
          </h6>

          <p className="text-muted small mb-0">
            There are no invitees added to this document yet.
          </p>
        </Card.Body>
      </Card>
    );
  }

  const GridView = () => (
    <Row className="g-3">
      {invitations.map((invitation, index) => {
        const invStatus =
          invitation.invitationStatus || {};

        const statusObj = getStatus(invitation);

        const visibleButtons =
          getVisibleButtons(invitation);

        return (
          <Col lg={6} xl={4} key={index}>
            <Card
              className="border-0 shadow-sm h-100"
              style={{ cursor: "pointer" }}
            >
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="flex-grow-1 me-2">
                    <h6 className="mb-1 fw-600">
                      {invitation.name}
                    </h6>

                    <a
                      href={`mailto:${invitation.email}`}
                      className="text-decoration-none"
                    >
                      <small className="text-muted">
                        {invitation.email}
                      </small>
                    </a>
                  </div>

                  <Badge
                    bg={statusObj.variant}
                    className="rounded-pill px-3"
                  >
                    <small className="fw-600">
                      {statusObj.text}
                    </small>
                  </Badge>
                </div>

                <hr className="my-3" />

                <div className="mb-4">
                  <div className="row g-2 small">
                    {invitation.phone && (
                      <div className="col-12">
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">
                            Phone
                          </span>

                          <span className="fw-500">
                            {invitation.phone}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="col-12">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">
                          Signature Type
                        </span>

                        <span className="fw-500">
                          {invitation.usedSignatureType || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">
                          Expires
                        </span>

                        <span className="fw-500">
                          {invStatus.expiryDate?.split(" ")[0] || "-"}
                        </span>
                      </div>
                    </div>

                    {invStatus.signed &&
                      invStatus.signDate && (
                        <div className="col-12">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">
                              Signed On
                            </span>

                            <span className="fw-500 text-success">
                              {invStatus.signDate?.split(" ")[0]}
                            </span>
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  {visibleButtons.includes("details") && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="flex-grow-1"
                      onClick={() =>
                        setSelectedInvitee(invitation)
                      }
                    >
                      <small>View Details</small>
                    </Button>
                  )}

                  {visibleButtons.includes("resend") && (
                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="flex-grow-1"
                      onClick={() =>
                        handleResendInvitee(
                          invitation.invitationUrl
                        )
                      }
                    >
                      <small>Resend</small>
                    </Button>
                  )}

                  {visibleButtons.includes("activate") && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="flex-grow-1"
                      onClick={() =>
                        handleActivateInvitee(
                          invitation.invitationUrl
                        )
                      }
                    >
                      <small>
                        Activate Invitee
                      </small>
                    </Button>
                  )}

                  {visibleButtons.includes("delete") && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="flex-grow-1"
                      onClick={() =>
                        handleDeleteInvitee(
                          invitation.invitationUrl
                        )
                      }
                    >
                      <small>Delete</small>
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );

  const TableView = () => (
    <div className="table-responsive">
      <Table
        hover
        borderless
        className="mb-0 align-middle"
      >
        <thead>
          <tr className="border-bottom border-2">
            <th className="fw-600 text-muted small text-uppercase">
              Invitee
            </th>

            <th className="fw-600 text-muted small text-uppercase">
              Email
            </th>

            <th className="fw-600 text-muted small text-uppercase">
              Type
            </th>

            <th className="fw-600 text-muted small text-uppercase">
              Status
            </th>

            <th className="fw-600 text-muted small text-uppercase">
              Expires
            </th>

            <th className="fw-600 text-muted small text-uppercase">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {invitations.map((invitation, index) => {
            const invStatus =
              invitation.invitationStatus || {};

            const statusObj = getStatus(invitation);

            const visibleButtons =
              getVisibleButtons(invitation);

            return (
              <tr
                key={index}
                className="border-bottom"
              >
                <td>
                  <div>
                    <p className="mb-0 fw-600 small">
                      {invitation.name}
                    </p>

                    {invitation.phone && (
                      <small className="text-muted">
                        {invitation.phone}
                      </small>
                    )}
                  </div>
                </td>

                <td>
                  <small>
                    {invitation.email}
                  </small>
                </td>

                <td>
                  <small>
                    {invitation.usedSignatureType || "-"}
                  </small>
                </td>

                <td>
                  <Badge
                    bg={statusObj.variant}
                    className="rounded-pill"
                  >
                    <small className="fw-600">
                      {statusObj.text}
                    </small>
                  </Badge>
                </td>

                <td>
                  <small>
                    {invStatus.expiryDate?.split(" ")[0] ||
                      "-"}
                  </small>
                </td>

                <td>
                  <div className="d-flex flex-wrap gap-1">
                    {visibleButtons.includes("details") && (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() =>
                          setSelectedInvitee(invitation)
                        }
                      >
                        Details
                      </Button>
                    )}

                    {visibleButtons.includes("resend") && (
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() =>
                          handleResendInvitee(
                            invitation.invitationUrl
                          )
                        }
                      >
                        Resend
                      </Button>
                    )}

                    {visibleButtons.includes("activate") && (
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() =>
                          handleActivateInvitee(
                            invitation.invitationUrl
                          )
                        }
                      >
                        Activate
                      </Button>
                    )}

                    {visibleButtons.includes("delete") && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() =>
                          handleDeleteInvitee(
                            invitation.invitationUrl
                          )
                        }
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );

  return (
    <>
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom py-3 px-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-0 fw-600">
                Invitees & Signers
              </h6>

              <small className="text-muted">
                Manage document signing requests
              </small>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Badge
                bg="light"
                text="dark"
                className="rounded-pill px-3"
              >
                <small className="fw-600">
                  {invitations.length} Total
                </small>
              </Badge>

              <Badge
                bg="light"
                text="dark"
                className="rounded-pill px-3"
              >
                <small className="fw-600">
                  {
                    invitations.filter(
                      (i) =>
                        i.invitationStatus?.signed
                    ).length
                  }{" "}
                  Signed
                </small>
              </Badge>

              <ButtonGroup size="sm">
                <Button
                  variant={
                    viewMode === "grid"
                      ? "primary"
                      : "outline-secondary"
                  }
                  onClick={() =>
                    setViewMode("grid")
                  }
                  className="px-3"
                >
                  <small>⊞ Grid</small>
                </Button>

                <Button
                  variant={
                    viewMode === "table"
                      ? "primary"
                      : "outline-secondary"
                  }
                  onClick={() =>
                    setViewMode("table")
                  }
                  className="px-3"
                >
                  <small>≡ List</small>
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-4">
          {viewMode === "grid" ? (
            <GridView />
          ) : (
            <TableView />
          )}
        </Card.Body>
      </Card>

      <InviteeDetailsModal
        invitee={selectedInvitee}
        onHide={() =>
          setSelectedInvitee(null)
        }
      />

      <ToastMessage
        show={toast.show}
        onClose={() =>
          setToast((prev) => ({
            ...prev,
            show: false,
          }))
        }
        title={toast.title}
        message={toast.message}
        bg={toast.bg}
      />
    </>
  );
}

