import {
  createContext,
  useEffect,
  useState,
} from "react";

import { auth } from "../firebase";
import { loginWithBackend } from "../services/authService";
import { signOut, onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export { AuthContext };

export default function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();

          const data = await loginWithBackend(token);

          setUser({
            firebaseUser,
            token,
            role: data.role,
          });
        } catch (error) {
          alert(error.message);
          console.error(error);

          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
