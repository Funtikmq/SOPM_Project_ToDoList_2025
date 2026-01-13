/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "./AuthContext";

const THEME_KEY = "appTheme";
const ALLOWED = ["magenta", "minimal", "dark", "blue"];
const THEMES = [
  { id: "magenta", label: "Magenta" },
  { id: "minimal", label: "Minimal" },
  { id: "dark", label: "Dark" },
  { id: "blue", label: "Blue" },
];

const ThemeContext = createContext({
  theme: "magenta",
  currentTheme: "magenta",
  setTheme: () => {},
  availableThemes: THEMES,
  loadThemeFromFirestore: async () => {},
  saveThemeToFirestore: async () => {},
});

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  if (document.body) {
    document.body.dataset.theme = theme;
  }
};

const normalizeTheme = (value) => (ALLOWED.includes(value) ? value : "magenta");

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState("magenta");

  const saveThemeToFirestore = useCallback(async (uid, nextTheme) => {
    if (!uid) return;
    const safe = normalizeTheme(nextTheme);
    await setDoc(doc(db, "users", uid), { theme: safe }, { merge: true });
  }, []);

  const loadThemeFromFirestore = useCallback(
    async (uid) => {
      const targetUid = uid || user?.uid;
      if (!targetUid) return null;
      try {
        const snap = await getDoc(doc(db, "users", targetUid));
        const fromDb = snap.exists() ? snap.data()?.theme : null;
        const resolved = normalizeTheme(fromDb || localStorage.getItem(THEME_KEY) || "magenta");
        setThemeState(resolved);
        applyTheme(resolved);
        localStorage.setItem(THEME_KEY, resolved);
        if (!fromDb) {
          await saveThemeToFirestore(targetUid, resolved);
        }
        return resolved;
      } catch (err) {
        console.error("Failed to load theme", err);
        return null;
      }
    },
    [saveThemeToFirestore, user?.uid]
  );

  const setTheme = useCallback(
    (next) => {
      const safe = normalizeTheme(next);
      setThemeState(safe);
      applyTheme(safe);
      localStorage.setItem(THEME_KEY, safe);
      if (user?.uid) {
        saveThemeToFirestore(user.uid, safe);
      }
    },
    [saveThemeToFirestore, user?.uid]
  );

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) || localStorage.getItem("theme");
    const initial = normalizeTheme(stored || "magenta");
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!user?.uid) return;
    loadThemeFromFirestore(user.uid);
  }, [loadThemeFromFirestore, user?.uid]);

  const value = useMemo(
    () => ({
      theme,
      currentTheme: theme,
      setTheme,
      availableThemes: THEMES,
      loadThemeFromFirestore,
      saveThemeToFirestore,
    }),
    [loadThemeFromFirestore, saveThemeToFirestore, setTheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
