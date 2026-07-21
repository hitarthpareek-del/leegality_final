import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import useAuth from "./../context/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Optional loading state
  if (!user) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Dashboard</h1>

      <p>
        <strong>Role:</strong> {user.role}
      </p>

      {user.role === "superadmin" && (
 <button onClick={() => navigate("/superadmin")}>
  Superadmin Panel
</button>
)}

      <img
        src={user.firebaseUser.photoURL}
        alt="Profile"
        width="100"
        style={{ borderRadius: "50%" }}
      />

      <h2>{user.firebaseUser.displayName}</h2>

      <p>
        <strong>Email:</strong> {user.firebaseUser.email}
      </p>

      <h3>Firebase ID Token</h3>

      <textarea
        value={user.token}
        rows={12}
        cols={100}
        readOnly
      />

      <br />
      <br />

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
