import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const buildProfile = (currentUser, profile) => ({
    uid: currentUser.uid,
    email: currentUser.email || profile.email || "",
    displayName: currentUser.displayName || profile.displayName,
    username: profile.username,
    tag: profile.tag,
    avatarUrl: profile.avatarUrl || null,
  });

  const loadProfile = async (currentUser) => {
    const userRef = doc(db, "users", currentUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      const ensured = {
        uid: currentUser.uid,
        email: currentUser.email || data.email || "",
        displayName: data.displayName || currentUser.displayName || "",
        username: data.username || data.email || "",
        tag: data.tag || (data.username ? `#${data.username}` : ""),
        avatarUrl: data.avatarUrl || null,
      };
      if (!data.tag || !data.username) {
        await setDoc(
          userRef,
          {
            username: ensured.username,
            tag: ensured.tag,
            displayName: ensured.displayName,
            avatarUrl: ensured.avatarUrl,
            email: ensured.email,
            uid: ensured.uid,
          },
          { merge: true }
        );
      }
      return buildProfile(currentUser, ensured);
    }

    const base = (currentUser.email || "user").split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") || "user";
    const generated = `${base}${Math.floor(Math.random() * 900 + 100)}`.toLowerCase();
    const profile = {
      uid: currentUser.uid,
      email: currentUser.email || "",
      displayName: currentUser.displayName || base,
      username: generated,
      tag: `#${generated}`,
      avatarUrl: null,
    };
    await setDoc(userRef, profile);
    return buildProfile(currentUser, profile);
  };

  const refreshProfile = async () => {
    if (!auth.currentUser) return null;
    const combined = await loadProfile(auth.currentUser);
    setUser(combined);
    return combined;
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const combined = await loadProfile(currentUser);
        setUser(combined);
      } catch (err) {
        console.error("AuthContext profile load error:", err);
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || "",
        });
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
