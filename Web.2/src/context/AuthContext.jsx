/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

const AuthContext = createContext({
  user: null,
  loading: true,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (err) => {
        console.error("Auth state error", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    setUser(auth.currentUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshProfile }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
