export default function UserRow({
  user,
  onRoleChange,
  onStatusChange,
}) {
  return (
    <tr>
      <td>
        <div className="fw-semibold text-dark">
          {user.email}
        </div>
      </td>

      <td>
        <select
          className="dropdown p-1 border border-secondary border-opacity-50 rounded-3"
          value={user.role}
          onChange={(e) =>
            onRoleChange(user, e.target.value)
          }
        >
          <option value="admin">Admin</option>
          <option value="superadmin">Superadmin</option>
        </select>
      </td>

      <td>
        <span
          className={`badge ${
            user.is_active
              ? "bg-success"
              : "bg-danger"
          }`}
        >
          {user.is_active ? "Active" : "Disabled"}
        </span>
      </td>

      <td>
        <span className="text-muted">
          {new Date(user.created_at).toLocaleDateString()}
        </span>
      </td>

      <td>
        <span className="text-muted">
          {new Date(user.updated_at).toLocaleDateString()}
        </span>
      </td>

      <td>
        <button
          type="button"
          className={`btn btn-sm ${
            user.is_active
              ? "btn-danger"
              : "btn-success"
          }`}
          onClick={() => onStatusChange(user)}
        >
          {user.is_active ? "Disable" : "Enable"}
        </button>
      </td>
    </tr>
  );
}