import axios from "axios";

const API_URL = "http://localhost:5000/api/invitees";

export async function getInvitees(token, company) {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Company": company,
    },
  });

  return response.data.data;
}