import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import useAuth from "./../context/useAuth";
import { useEffect } from "react";

export default function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const login = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, navigate, user]);

  return (
    
    <div className="login-page">
      <h1>E-Sign Portal</h1>

      <button onClick={login}>
        Sign in with Google
      </button>
    </div>
  );
}
