import axios from "axios";
import { API_URL } from "./config";

export async function getInvitees(token, company) {
  const response = await axios.get(`${API_URL}/invitees`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Company": company,
    },
  });

  return response.data.data;
}