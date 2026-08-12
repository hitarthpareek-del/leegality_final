import request from "./apiClient";

export async function loginWithBackend() {
  return await request("/auth/login", {
    method: "GET",
  });
}