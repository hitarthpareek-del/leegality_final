import { useEffect, useMemo, useState } from "react";

import AddUserForm from "../components/UserManagement/AddUserForm";
import UserTable from "../components/UserManagement/UserTable";

import ConfirmModal from "../components/Common/ConfirmModal";
import ToastMessage from "../components/Common/ToastMessage";
import Header from "../components/Layout/Header";

import {
  getUsers,
  addUser,
  updateRole,
  updateUserStatus,
} from "../services/userService";

import "../styles/superadmin.css";

export default function SuperAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingUser, setAddingUser] = useState(false);
  const [search, setSearch] = useState("");


  const [toast, setToast] = useState({
  show: false,
  title: "",
  message: "",
  bg: "success",
});

const [confirm, setConfirm] = useState({
  show: false,
  title: "",
  message: "",
  confirmText: "",
  confirmVariant: "primary",
  onConfirm: null,
});

function showToast(title, message, bg = "success") {
  setToast({
    show: true,
    title,
    message,
    bg,
  });
}

  // ==========================
  // Fetch Users
  // ==========================
  async function fetchUsers() {
    try {
      const data = await getUsers();
      setUsers(data.users);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================
  // Add User
  // ==========================
async function handleAddUser(email, role) {
  try {
    setAddingUser(true);

    const data = await addUser(email, role);

    showToast(
      "Success",
      data.message,
      "success"
    );

    await fetchUsers();
  } catch (error) {
    showToast(
      "Error",
      error.message,
      "danger"
    );
  } finally {
    setAddingUser(false);
  }
}

  // ==========================
  // Update Role
  // ==========================
function handleRoleChange(user, role) {
  setConfirm({
    show: true,
    title: "Change Role",
    message: `Change ${user.email} to ${role}?`,
    confirmText: "Change",
    confirmVariant: "warning",

    onConfirm: async () => {
      try {
        const data = await updateRole(user.id, role);

        showToast(
          "Success",
          data.message,
          "success"
        );

        await fetchUsers();
      } catch (error) {
        showToast(
          "Error",
          error.message,
          "danger"
        );
      } finally {
        setConfirm((prev) => ({
          ...prev,
          show: false,
        }));
      }
    },
  });
}

  // ==========================
  // Enable / Disable User
  // ==========================
function handleStatusChange(user) {
  const active = !user.is_active;

  setConfirm({
    show: true,

    title: active
      ? "Enable User"
      : "Disable User",

    message: `${active ? "Enable" : "Disable"} ${user.email}?`,

    confirmText: active
      ? "Enable"
      : "Disable",

    confirmVariant: active
      ? "success"
      : "danger",

    onConfirm: async () => {
      try {
        const data = await updateUserStatus(
          user.id,
          active
        );

        showToast(
          "Success",
          data.message,
          "success"
        );

        await fetchUsers();
      } catch (error) {
        showToast(
          "Error",
          error.message,
          "danger"
        );
      } finally {
        setConfirm((prev) => ({
          ...prev,
          show: false,
        }));
      }
    },
  });
}

  // ==========================
  // Search
  // ==========================
 const filteredUsers = useMemo(() => {
  const text = search.trim().toLowerCase();

  if (!text) {
    return users;
  }

  return users.filter((user) => {
    const status = user.is_active
      ? "active"
      : "disabled";

    return (
      user.email.toLowerCase().includes(text) ||
      status.includes(text)
    );
  });
}, [users, search]);

  // ==========================
  // Loading
  // ==========================
  if (loading) {
    return (
      <div className="container py-5">
        <h3>Loading users...</h3>
      </div>
    );
  }

  // ==========================
  // UI
  // ==========================
  return (
 <>
  <Header
    title="User Management"
    subtitle="Manage Admin and Superadmin accounts."
    backDisable={false}
  />

  <div className="container-fluid px-4 page-content">

      <div className="row g-4">

        {/* Left Column */}

        <div className="col-lg-4">

          <div className="card dashboard-card">

            <div className="card-header">
              Add New User
            </div>

            <div className="card-body">

              <AddUserForm
                onSubmit={handleAddUser}
                loading={addingUser}
              />

            </div>

          </div>

        </div>

        {/* Right Column */}

        <div className="col-lg-8">

          {/* Search */}

          <div className="card dashboard-card mb-3">

            <div className="card-header">
              Search Users
            </div>

            <div className="card-body">

              <SearchBar
                search={search}
                setSearch={setSearch}
              />

            </div>

          </div>

          {/* Users Table */}

          <div className="card dashboard-card">

            <div className="card-header d-flex justify-content-between align-items-center">

              <span>
                Users
              </span>

              <span className="badge bg-primary">
                {filteredUsers.length}
              </span>

            </div>

            <div className="card-body">

              <UserTable
                users={filteredUsers}
                onRoleChange={handleRoleChange}
                onStatusChange={handleStatusChange}
              />

            </div>

          </div>

        </div>

      </div>

      <ToastMessage
  show={toast.show}
  title={toast.title}
  message={toast.message}
  bg={toast.bg}
  onClose={() =>
    setToast((prev) => ({
      ...prev,
      show: false,
    }))
  }
/>

<ConfirmModal
  show={confirm.show}
  title={confirm.title}
  message={confirm.message}
  confirmText={confirm.confirmText}
  confirmVariant={confirm.confirmVariant}
  onClose={() =>
    setConfirm((prev) => ({
      ...prev,
      show: false,
    }))
  }
  onConfirm={confirm.onConfirm}
/>

    </div>
    </>
  );
}