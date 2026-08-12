const express = require("express");

const router = express.Router();

const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const loadCurrentUser = require("../middleware/loadCurrentUser");
const requireAdmin = require("../middleware/requireAdmin");
const companyMiddleware = require("../middleware/companyMiddleware");

const documentController = require("../controllers/documentController");

// Authentication & Authorization
router.use(verifyFirebaseToken);
router.use(loadCurrentUser);
router.use(requireAdmin);
router.use(companyMiddleware);

// ===============================
// Documents List
// ===============================
router.get(
"/",
documentController.getDocuments
);

// ===============================
// Document Details
// ===============================
router.get(
"/details",
documentController.getDocumentDetails
);

// ===============================
// Delete Document 
// ===============================
router.delete(
    "/deleteDocument",
    documentController.deleteDocument
);

// ===============================
// Handle Reactivate Document
// ===============================
router.post(
    "/reactivateDocument",
    documentController.handleReactivateDocument
);

// ===============================
// Handle activate invitee
// ===============================
router.get(
    "/activateInvitee",
    documentController.handleActivateInvitee
);

// ===============================
// Handle delete invitee
// ===============================
router.delete(
    "/deleteInvitee",
    documentController.handleDeleteInvitee
);

//// resend notification to invitee
router.post(
  "/resend",
  documentController.resendInvitee
);

// ===============================
// Download Document 
// ===============================
router.get(
    "/downloadDocument",
    documentController.handleDownloadDocument
);

// ===============================
// Mark document as complete
// ===============================
router.post(
    "/markDocumentComplete",
    documentController.handleMarkDocumentComplete
);

// ===============================
// Wallet
// ===============================
router.get(
"/wallet",
documentController.walletBalance
);

router.get(
"/wallet/history",
documentController.walletHistory
);




module.exports = router;
