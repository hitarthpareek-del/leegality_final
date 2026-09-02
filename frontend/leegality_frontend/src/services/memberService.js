import axios from "axios";
import { auth } from "../firebase";
import { API_URL } from "./config";

async function getAuthHeaders() {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("User is not authenticated.");
    }

    const token = await user.getIdToken();

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

export async function getMembers() {
    const headers = await getAuthHeaders();

    const response = await axios.get(`${API_URL}/members`, {
        headers,
    });

    return response.data;
}

export async function updateMemberStatus(memberId, status) {
    const headers = await getAuthHeaders();

    const response = await axios.patch(
        `${API_URL}/members/${memberId}/status`,
        {
            status,
        },
        {
            headers,
        }
    );

    return response.data;
}

export async function deactivateMember(memberId) {
    const headers = await getAuthHeaders();

    const response = await axios.patch(
        `${API_URL}/members/${memberId}/deactivate`,
        {},
        {
            headers,
        }
    );

    return response.data;
}

export const updateHrDetails = async (memberId, hrData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(
      `${API_URL}/members/${memberId}/hr`,
      hrData,
      {
        headers
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Update HR details error:",
      error.response?.data || error.message
    );

    throw error;
  }
};