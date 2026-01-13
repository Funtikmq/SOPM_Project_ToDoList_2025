import { useEffect, useRef, useState } from "react";
import "./Header.css";
import { useAuth } from "../context/AuthContext";
import { signOut, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { useTranslate } from "../translation";
import { useTheme } from "../context/ThemeContext";
import { collection, doc, onSnapshot, query, setDoc, where } from "firebase/firestore";
import RecycleBin from "./RecycleBin";
import ProfileModal from "./ProfileModal";
import MiniCalendar from "./calendar/MiniCalendar";
import { useTasks } from "../context/TaskContext";

const Header = ({ view = "list", onToggleView }) => {
  const { user, refreshProfile } = useAuth();
  const { t, lang } = useTranslate();
  const { theme, setTheme } = useTheme();
  const { tasksByDate } = useTasks();

  const [showBin, setShowBin] = useState(false);
  const [binCount, setBinCount] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showCalDropdown, setShowCalDropdown] = useState(false);

  const calBtnRef = useRef(null);
  const calDropRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "trash"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => setBinCount(snap.docs.length));
    return () => unsub();
  }, [user]);

  useEffect(() => {
    setNameInput(user?.displayName || user?.email || "");
  }, [user]);

  const isCalendar = view === "calendar";
  const handleToggleView = () => onToggleView?.();
  const handleToggleTheme = () => {
    const next = theme === "dark" ? "magenta" : "dark";
    setTheme?.(next);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleSaveName = async () => {
    if (!user) return;
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    await updateProfile(auth.currentUser, { displayName: trimmed });
    try {
      await setDoc(doc(db, "users", user.uid), { displayName: trimmed }, { merge: true });
      await refreshProfile?.();
    } catch (err) {
      console.error("Failed to sync display name", err);
    } finally {
      setIsEditingName(false);
    }
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (
        !showCalDropdown ||
        calBtnRef.current?.contains(e.target) ||
        calDropRef.current?.contains(e.target)
      ) {
        return;
      }
      setShowCalDropdown(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [showCalDropdown]);

  return (
    <>
      <header className="headerLayout glass-surface topbarContainer">
        <div className="headerLeft">
          <div className="headerUser">
            <img
              className="userPhoto"
              src={user?.photoURL || "https://i.imgur.com/6VBx3io.png"}
              alt="user"
            />
            <div className="userInfo">
              <div className="userNameRow">
                {isEditingName ? (
                  <>
                    <input
                      className="userNameInput"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName();
                        if (e.key === "Escape") setIsEditingName(false);
                      }}
                    />
                    <button className="smallIconButton" aria-label="Save name" onClick={handleSaveName}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="m10 15.5l-3.5-3.5l1.4-1.4l2.1 2.1l4.6-4.6l1.4 1.4z" />
                      </svg>
                    </button>
                    <button
                      className="smallIconButton ghost"
                      aria-label="Cancel edit name"
                      onClick={() => {
                        setNameInput(user?.displayName || user?.email || "");
                        setIsEditingName(false);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="m6.4 19l-1.4-1.4L10.6 12L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4L12 13.4z"
                        />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="userName">{user?.displayName || user?.email || "User"}</div>
                    <button
                      className="smallIconButton"
                      aria-label="Edit display name"
                      onClick={() => setIsEditingName(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M5 19h1.4l9.225-9.225l-1.4-1.4L5 17.6zm13.8-11.625l-2.175-2.15l1.05-1.05q.575-.575 1.4-.575t1.4.575l.95.95q.575.575.575 1.4t-.575 1.4zM4 21v-3.775l10.6-10.6l3.8 3.8L7.8 21z"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              <div className="userMail">{user?.email}</div>
            </div>
          </div>
        </div>

        <div className="headerRight">
          <div className="headerButtons">
            <button
              className={`iconButton ${isCalendar ? "iconActive" : ""}`}
              onClick={handleToggleView}
              aria-label="Tasks / Calendar"
              title={isCalendar ? (t ? t("taskList") : "Task List") : t ? t("calendar.title") : "Calendar"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
              </svg>
            </button>
            <div className="calendarButtonWrapper" ref={calBtnRef}>
              <button
                className="iconButton"
                onClick={() => setShowCalDropdown((p) => !p)}
                aria-label="Calendar dropdown"
                title={t ? t("calendar.title") : "Calendar"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M7 2v2h10V2h2v2h3v18H2V4h3V2zm13 6H4v12h16z" />
                </svg>
              </button>
              {showCalDropdown && (
                <div className="calendarDropdown" ref={calDropRef}>
                  <MiniCalendar tasksByDate={tasksByDate} t={t} lang={lang} />
                </div>
              )}
            </div>
            <button
              className="iconButton"
              onClick={() => {
                const currentLang = localStorage.getItem("language") || "ro";
                const newLang = currentLang === "ro" ? "en" : "ro";
                localStorage.setItem("language", newLang);
                window.location.reload();
              }}
              aria-label="Toggle language"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 1536 1792">
                <path
                  fill="currentColor"
                  d="M654 1078q-1 3-12.5-.5T610 1066l-20-9q-44-20-87-49q-7-5-41-31.5T424 948q-67 103-134 181q-81 95-105 110q-4 2-19.5 4t-18.5 0q6-4 82-92q21-24 85.5-115T393 918q17-30 51-98.5t36-77.5q-8-1-110 33q-8 2-27.5 7.5T308 792t-17 5q-2 2-2 10.5t-1 9.5q-5 10-31 15q-23 7-47 0q-18-4-28-21q-4-6-5-23q6-2 24.5-5t29.5-6q58-16 105-32q100-35 102-35q10-2 43-19.5t44-21.5q9-3 21.5-8t14.5-5.5t6 .5q2 12-1 33q0 2-12.5 27T527 769.5T510 803q-25 50-77 131l64 28q12 6 74.5 32t67.5 28q4 1 10.5 25.5t4.5 30.5zM449 592q3 15-4 28q-12 23-50 38q-30 12-60 12q-26-3-49-26q-14-15-18-41l1-3q3 3 19.5 5t26.5 0t58-16q36-12 55-14q17 0 21 17zm698 129l63 227l-139-42zM39 1521l694-232V257L39 490v1031zm1241-317l102 31l-181-657l-100-31l-216 536l102 31l45-110l211 65zM777 242l573 184V46zm311 1323l158 13l-54 160l-40-66q-130 83-276 108q-58 12-91 12h-84q-79 0-199.5-39T318 1668q-8-7-8-16q0-8 5-13.5t13-5.5q4 0 18 7.5t30.5 16.5t20.5 11q73 37 159.5 61.5T714 1754q95 0 167-14.5t157-50.5q15-7 30.5-15.5t34-19t28.5-16.5zm448-1079v1079l-774-246q-14 6-375 127.5T19 1568q-13 0-18-13q0-1-1-3V474q3-9 4-10q5-6 20-11q107-36 149-50V19l558 198q2 0 160.5-55t316-108.5T1369 0q20 0 20 21v418z"
                />
              </svg>
            </button>

            <button className="iconButton binButton" onClick={() => setShowBin(true)} aria-label="Recycle bin">
              {binCount > 0 && <span className="binBadge">{binCount}</span>}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M7 4V2h10v2h5v2H2V4zm0 18q-.825 0-1.412-.587T5 20V8h14v12q0 .825-.587 1.413T17 22z"
                />
              </svg>
            </button>

            <button onClick={handleToggleTheme} className="iconButton theme-toggle-btn" aria-label="Toggle theme">
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 17q-2.075 0-3.537-1.463T7 12t1.463-3.537T12 7t3.538 1.463T17 12t-1.463 3.538T12 17M2 13v-2h4v2zm16 0v-2h4v2zM11 2h2v4h-2zm0 16h2v4h-2zM6.4 7.75L4.975 6.325L7.75 3.55L9.175 4.975zm12.3 12.3l-1.425-1.425l2.775-2.775l1.425 1.425zM16.25 6.4l1.425-1.425l2.775 2.775L19.025 9.175zM3.55 19.725l2.775-2.775l1.425 1.425l-2.775 2.775z"
                  />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 21q-3.775 0-6.387-2.613T3 12t2.613-6.387T12 3q.35 0 .688.025t.662.075q-1.025.725-1.638 1.888T11.1 7.5q0 2.25 1.575 3.825T16.5 12.9q1.375 0 2.525-.613T20.9 10.65q.05.325.075.662T21 12q0 3.775-2.613 6.388T12 21"
                  />
                </svg>
              )}
            </button>

            <button className="iconButton" onClick={() => setShowProfile(true)} aria-label="Profile settings">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 15q1.25 0 2.125-.875T15 12t-.875-2.125T12 9t-2.125.875T9 12t.875 2.125T12 15m0 7q-2.075 0-3.9-.788t-3.175-2.137t-2.137-3.175T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137t2.137 3.175T22 12t-.788 3.9t-2.137 3.175t-3.175 2.137T12 22"
                />
              </svg>
            </button>

            <button className="iconButton" onClick={handleLogout} aria-label="Logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M5.615 20q-.69 0-1.152-.462Q4 19.075 4 18.385V5.615q0-.69.463-1.152Q4.925 4 5.615 4h6.404v1H5.615q-.23 0-.423.192Q5 5.385 5 5.615v12.77q0 .23.192.423q.193.192.423.192h6.404v1H5.615Zm10.847-4.462l-.702-.719l2.319-2.319H9.192v-1h8.887l-2.32-2.32l.703-.718L20 12l-3.538 3.538Z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <RecycleBin open={showBin} onClose={() => setShowBin(false)} />
      <ProfileModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
        onUpdated={refreshProfile}
      />
    </>
  );
};

export default Header;
