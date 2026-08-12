import request from "./apiClient";

// Get all users
export async function getUsers() {
  return await request("/users", {
    method: "GET",
  });
}

// Add new user / Reactivate existing user
export async function addUser(email, role) {
  return await request("/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      role,
    }),
  });
}

// Update user role
export async function updateRole(id, role) {
  return await request(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      role,
    }),
  });
}

// Enable / Disable user
export async function updateUserStatus(id, is_active) {
  return await request(`/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      is_active,
    }),
  });
}