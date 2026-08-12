import request from "./apiClient";
import axios from "axios";
const API_URL = "http://localhost:5000/api";

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function getDocuments(params, company) {
  return request(`/documents${buildQuery(params)}`, {
    method: "GET",
    headers: { "X-Company": company },
  });
}

export async function getAllDocuments(company, params = {}) {
  try {
    const response = await getDocuments(params, company);

    // Handle the response structure: { status: 1, data: { documents: [], total: 26 } }
    let allDocuments = [];

    if (response?.data?.documents && Array.isArray(response.data.documents)) {
      // New structure from updated backend
      allDocuments = response.data.documents;
    } else if (Array.isArray(response?.documents)) {
      // Fallback: direct documents array
      allDocuments = response.documents;
    } else if (Array.isArray(response?.data)) {
      // Fallback: data is array
      allDocuments = response.data;
    } else if (Array.isArray(response)) {
      // Fallback: response is array
      allDocuments = response;
    }

    // Deduplicate documents by documentId/id/irn
    const documentsById = new Map();
    allDocuments.forEach((doc, idx) => {
      const key = doc?.documentId || doc?.id || doc?.irn || `doc-${idx}`;
      if (!documentsById.has(key)) {
        documentsById.set(key, doc);
      }
    });

    const uniqueDocuments = Array.from(documentsById.values());

    console.log(`✓ Loaded ${uniqueDocuments.length} documents from backend`);

    return uniqueDocuments;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw new Error(error?.message || "Failed to load documents");
  }
}

export async function getDocumentDetails(documentId, company, token) {
  const response = await axios.get(
    `${API_URL}/documents/details?documentId=${documentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Company": company,
      },
    }
  );
  return response.data.data;
}


export async function deleteDocument(documentId, company, token) {
  const response = await axios.delete(
    `${API_URL}/documents/deleteDocument`,
    {
      params: {
        documentId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Company": company,
      },
    }
  );

  return response.data;
}

export async function reactivateDocument(documentId, company, token) {
  const response = await axios.post(
    `${API_URL}/documents/reactivateDocument`,
    {
      documentId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Company": company,
      },
    }
  );

  return response.data;
}

export async function activateInvitee(signUrl, company, token) {
  const response = await axios.get(
    `${API_URL}/documents/activateInvitee`,
    {
      params: {
        signUrl,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Company": company,
      },
    }
  );

  return response.data;
}

export async function deleteInvitee(signUrl, company, token) {
  const response = await axios.delete(
    `${API_URL}/documents/deleteInvitee`,
    {
      params: {
        signUrl,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Company": company,
      },
    }
  );

  return response.data;
}

export async function resendInvitation(signUrl, company, token) {
  const response = await axios.post(
    `${API_URL}/documents/resend`,
    {
      signUrls: [signUrl],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Company": company,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

export async function downloadDocument(
  documentId,
  documentDownloadType,
  company,
  token
) {
  const response = await axios.get(
    `${API_URL}/documents/downloadDocument`,
    {
      params: {
        documentId,
        documentDownloadType,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Company": company,
      },
    }
  );

  return response.data;
}

// services/documentService.js

export async function markDocumentComplete(
  documentId,
  company,
  token
) {
  const response = await axios.post(
    `${API_URL}/documents/markDocumentComplete`,
    {
      documentId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Company": company,
      },
    }
  );

  return response.data;
}

