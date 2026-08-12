import UserRow from "./UserRow";

export default function UserTable({
  users,
  onRoleChange,
  onStatusChange,
}) {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onRoleChange={onRoleChange}
                onStatusChange={onStatusChange}
              />
            ))
          ) : (
            <tr>
              <td colSpan="6">
                <div className="table-empty">
                  <i
                    className="bi bi-people"
                    style={{ fontSize: "28px" }}
                  ></i>

                  <div className="mt-2 fw-semibold">
                    No users found
                  </div>

                  <div className="small">
                    Try changing your search.
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}