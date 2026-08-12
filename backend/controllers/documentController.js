const documentService = require("../services/leegalityService");

async function getDocuments(req, res) {
  try {
    const documents = await documentService.getDocuments(
      req.company,
      req.query
    );

    res.json(documents);

  } catch (error) {

    console.error(error.response?.data || error);

    res.status(500).json({
      success: false,
      message:
        error.response?.data?.messages?.[0]?.message ||
        "Unable to fetch documents.",
    });

  }
}


async function getDocumentDetails(req, res) {
  try {
    const { documentId } = req.query;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "documentId is required.",
      });
    }

    const data = await documentService.getDocumentDetails(
      req.company,
      documentId
    );

    res.json(data);
  } catch (error) {
    console.error(error.response?.data || error);

    res.status(500).json({
      success: false,
      message:
        error.response?.data?.messages?.[0]?.message ||
        "Unable to fetch document details.",
      error: error.response?.data || error.message,
    });
  }
}

async function deleteDocument(req, res) {
  try {
    const { documentId } = req.query;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "documentId is required.",
      });
    }

    const data = await documentService.deleteDocument(
      req.company,
      documentId
    );

    res.json(data);
  } catch (error) {
    console.error(error.response?.data || error);

    res.status(500).json({
      success: false,
      message:
        error.response?.data?.messages?.[0]?.message ||
        "Unable to delete document.",
      error: error.response?.data || error.message,
    });
  }
}

async function handleReactivateDocument(req, res) {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "documentId is required.",
      });
    }

    const data = await documentService.reactivateDocument(
      req.company,
      documentId,
    );

    res.json(data);
  } catch (error) {
    console.error(error.response?.data || error);

    res.status(500).json({
      success: false,
      message:
        error.response?.data?.messages?.[0]?.message ||
        "Unable to reactivate document.",
      error: error.response?.data || error.message,
    });
  }
}

async function handleActivateInvitee(req, res) {
  try {
    const { signUrl } = req.query;

    if (!signUrl) {
      return res.status(400).json({
        success: false,
        message: "signUrl is required.",
      });
    }

    const data = await documentService.activateInvitee(
      req.company,
      signUrl
    );

    res.json(data);
  } catch (error) {
    console.error(error.response?.data || error);

    res.status(500).json({
      success: false,
      message:
        error.response?.data?.messages?.[0]?.message ||
        "Unable to activate invitee.",
      error: error.response?.data || error.message,
    });
  }
}

async function handleDeleteInvitee(req, res) {
  try {
    const { signUrl } = req.query;

    if (!signUrl) {
      return res.status(400).json({
        success: false,
        message: "signUrl is required.",
      });
    }

    const data = await documentService.deleteInvitee(
      req.company,
      signUrl
    );

    res.json(data);
  } catch (error) {
    console.error(error.response?.data || error);

    res.status(500).json({
      success: false,
      message:
        error.response?.data?.messages?.[0]?.message ||
        "Unable to delete invitee.",
      error: error.response?.data || error.message,
    });
  }
}


async function resendInvitee(req, res) {
  try {
    const { signUrls } = req.body;

    // Validate request body
    if (!Array.isArray(signUrls) || signUrls.length === 0) {
      return res.status(400).json({
        status: 0,
        message: "signUrls must be a non-empty array.",
      });
    }

    // Validate every URL
    const invalidUrl = signUrls.some(
      (url) =>
        typeof url !== "string" ||
        !url.trim() ||
        !url.startsWith("https://")
    );

    if (invalidUrl) {
      return res.status(400).json({
        status: 0,
        message: "One or more sign URLs are invalid.",
      });
    }

    const response = await documentService.resendInvitation({
      signUrls,
      company: req.company,
    });

    /*
     * Return Leegality response to frontend
     */
    return res.status(200).json(response);
  } catch (error) {
    console.error(
      "Resend Leegality invitation error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json({
      status: 0,
      message:
        error.response?.data?.message ||
        error.response?.data?.messages?.[0]?.message ||
        error.message ||
        "Failed to resend invitation.",
      leegality:
        error.response?.data || null,
    });
  }
}

async function handleDownloadDocument(req, res) {
  try {
    const { documentId, documentDownloadType } = req.query;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "documentId is required.",
      });
    }

    if (!documentDownloadType) {
      return res.status(400).json({
        success: false,
        message: "documentDownloadType is required.",
      });
    }

    const data = await documentService.downloadDocument(
      req.company,
      documentId,
      documentDownloadType
    );

    return res.json(data);
  } catch (error) {
    console.error(
      "DOWNLOAD DOCUMENT ERROR:",
      error.response?.data || error
    );

    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.messages?.[0]?.message ||
        "Unable to download document.",
      error: error.response?.data || error.message,
    });
  }
}

// controllers/documentController.js

async function handleMarkDocumentComplete(req, res) {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "documentId is required.",
      });
    }

    const data = await documentService.markDocumentComplete(
      req.company,
      documentId
    );

    res.json(data);
  } catch (error) {
    console.error(error.response?.data || error);

    res.status(500).json({
      success: false,
      message:
        error.response?.data?.messages?.[0]?.message ||
        "Unable to mark document as complete.",
      error: error.response?.data || error.message,
    });
  }
}

async function walletBalance(
  req,
  res
) {
  try {

    const data =
      await documentService.walletBalance(
        req.company
      );

    res.json(data);

  } catch (error) {

    console.error(error.response?.data || error);

    res.status(500).json({
      success: false,
      message:
        error.response?.data?.messages?.[0]?.message ||
        "Unable to fetch wallet balance.",
    });

  }
}

async function walletHistory(req, res) {
  try {
    const data =
      await documentService.walletHistory(
        req.company,
        req.query
      );

    res.json(data);

  } catch (error) {

    console.error(error.response?.data || error);

    res.status(500).json({
      success: false,
      message:
        error.response?.data?.messages?.[0]?.message ||
        "Unable to fetch wallet history.",
    });

  }
}

module.exports = {
  getDocuments,
  getDocumentDetails,
  deleteDocument,
  handleReactivateDocument,
  handleActivateInvitee,
  handleDeleteInvitee,
  resendInvitee,
  handleDownloadDocument,
  handleMarkDocumentComplete,
  walletBalance,
  walletHistory,
};
