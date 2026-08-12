const { createLeegalityClient } = require("../utils/axiosClient");
const axios = require("axios");

async function getDocuments(company, query = {}) {
  const { q, status, limit } = query;

  const pageSize = Number(limit) || 40;
  let offset = 0;
  let total = 0;

  let apiStatus = 1;
  let apiMessages = [];

  const allDocuments = [];
  const seenIds = new Set();

  while (true) {
    let url =
      `${process.env.LEEGALITY_BASE_URL}/v3.0/sign/request/list?max=${pageSize}&offset=${offset}`;

    if (q?.trim()) {
      url += `&q=${encodeURIComponent(q.trim())}`;
    }

    if (status?.trim()) {
      url += `&status=${encodeURIComponent(
        status.trim().toUpperCase()
      )}`;
    }

    const response = await axios.get(url, {
      headers: {
        "X-Auth-Token": company.token,
        Accept: "application/json",
      },
      timeout: 30000,
    });

    const data = response.data;

    apiStatus = data.status;
    apiMessages = data.messages;

    const pageDocuments = data.data.documents || [];

    if (!total) {
      total = data.data.total || 0;
    }

    let newDocuments = 0;

    for (const doc of pageDocuments) {
      if (!seenIds.has(doc.documentId)) {
        seenIds.add(doc.documentId);
        allDocuments.push(doc);
        newDocuments++;
      }
    }

    if (pageDocuments.length === 0) break;

    if (newDocuments === 0) break;

    if (allDocuments.length >= total) break;

    offset += 20;
  }

  return {
    status: apiStatus,
    messages: apiMessages,
    data: {
      total,
      documents: allDocuments,
    },
  };
}

async function getDocumentDetails(company, documentId) {

  const response = await axios.get(
    `${process.env.LEEGALITY_BASE_URL}/v3.3/document/details`,
    {
      headers: {
        "X-Auth-Token": company.token,
        Accept: "application/json",
      },
      params: {
        documentId,
      },
    }
  );

  return response.data;

}


async function deleteDocument(company, documentId) {

  const response = await axios.delete(
    `${process.env.LEEGALITY_BASE_URL}/v3.0/sign/request`,
    {
      headers: {
        "X-Auth-Token": company.token,
        Accept: "application/json",
      },
      params: {
        documentId,
      },
    }
  );

  return response.data;

}

async function reactivateDocument(company, documentId) {

  const response = await axios.post(
    `${process.env.LEEGALITY_BASE_URL}/v3.0/sign/request/reactivate`,
    {
      documentId,
      "expiryDays": 5
    },
    {
      headers: {
        "X-Auth-Token": company.token,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

async function activateInvitee(company, signUrl) {
  const response = await axios.put(
    `${process.env.LEEGALITY_BASE_URL}/v3.1/invitation/activate`,
    {},
    {
      headers: {
        "X-Auth-Token": company.token,
        "Content-Type": "application/json",
        Cookie: "_lee=Leegality",
      },
      params: {
        signUrl,
      },
    }
  );

  return response.data;
}

async function deleteInvitee(company, signUrl) {
  const response = await axios.delete(
    `${process.env.LEEGALITY_BASE_URL}/v3.0/sign/request/invitation`,
    {
      headers: {
        "X-Auth-Token": company.token,
        "Content-Type": "application/json",
        Cookie: "_lee=Leegality",
      },
      params: {
        signUrl,
      },
    }
  );

  return response.data;
}

async function downloadDocument(
  company,
  documentId,
  documentDownloadType
) {
  const url =
    `${process.env.LEEGALITY_BASE_URL}/v3.3/document/fetchDocument` +
    `?documentId=${encodeURIComponent(documentId)}` +
    `&documentDownloadType=${encodeURIComponent(documentDownloadType)}`;

  const response = await axios.get(url, {
    headers: {
      "X-Auth-Token": company.token,
      Accept: "application/json",
    },
  });

  return response.data;
}

// services/documentService.js

async function markDocumentComplete(company, documentId) {
  const response = await axios.post(
    `${process.env.LEEGALITY_BASE_URL}/v3.0/sign/request/complete`,
    {
      documentId,
    },
    {
      headers: {
        "X-Auth-Token": company.token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return response.data;
}

 async function resendInvitation({
  signUrls,
  company,
}) {
  if (!company.token) {
    throw new Error("Leegality token is missing.");
  }

  if (!Array.isArray(signUrls) || signUrls.length === 0) {
    throw new Error("At least one sign URL is required.");
  }

  const response = await axios.post(
    `${process.env.LEEGALITY_BASE_URL}/v3.0/sign/request/resend`,
    {
      signUrls,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": company.token,
      },
    }
  );

  return response.data;
}


async function walletBalance(
  company
) {
  const client =
    createLeegalityClient(company);

  const { data } =
    await client.get(
      "/v3.0/wallet/balance/details"
    );

  return data;
}

async function walletHistory(
  company,
  query
) {
  const client =
    createLeegalityClient(company);

  const {
    page = 1,
    limit = 20,
  } = query;

  const { data } =
    await client.get(
      "/v3.0/wallet/balance/list",
      {
        params: {
          completed: true,
          max: limit,
          offset:
            (page - 1) * limit,
        },
      }
    );

  return data;
}

module.exports = {
  getDocuments,
  getDocumentDetails,
  deleteDocument,
  reactivateDocument,
  activateInvitee,
  deleteInvitee,
  downloadDocument,
  markDocumentComplete,
  resendInvitation,
  walletBalance,
  walletHistory
};
