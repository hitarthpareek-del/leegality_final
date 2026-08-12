import { useState } from "react";

export default function AddUserForm({
  onSubmit,
  loading,
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");

  function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim()) {
      return;
    }

    onSubmit(email.trim(), role);

    setEmail("");
    setRole("admin");
  }

  return (
    <form onSubmit={handleSubmit}>

      <div className="mb-3">

        <label className="form-label">
          Email
        </label>

        <input
          className="form-control"
          type="email"
          placeholder="Enter Google Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

      </div>

      <div className="mb-3">

        <label className="form-label">
          Role
        </label>

        <select
          className="form-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="admin">
            Admin
          </option>

          <option value="superadmin">
            Superadmin
          </option>

        </select>

      </div>

      <button
        className="btn btn-primary w-100"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add User"}
      </button>

    </form>
  );
}