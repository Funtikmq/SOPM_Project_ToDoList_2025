import { useState, useEffect } from "react";
import "./Header.css";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useTranslate } from "../translation";

const Header = () => {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { t } = useTranslate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const displayName = user?.displayName || user?.email || "User";
  const email = user?.displayName && user?.email ? user.email : "";

  return (
    <div className="headerLayout">
      <div className="headerLeft">
        <img
          className="userAvatar"
          src={user?.photoURL || "https://i.imgur.com/6VBx3io.png"}
          alt="User avatar"
        />
        <div className="userText">
          <p className="userName">{t("user")}: {displayName}</p>
          {email && <p className="userEmail">{email}</p>}
        </div>
      </div>

      <div className="headerButtons">
        <button
          className="headerIconButton"
          onClick={() => {
            const currentLang = localStorage.getItem("language") || "ro";
            const newLang = currentLang === "ro" ? "en" : "ro";
            localStorage.setItem("language", newLang);
            window.location.reload();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 1536 1792"
          >
            <path
              fill="currentColor"
              d="M654 1078q-1 3-12.5-.5T610 1066l-20-9q-44-20-87-49q-7-5-41-31.5T424 948q-67 103-134 181q-81 95-105 110q-4 2-19.5 4t-18.5 0q6-4 82-92q21-24 85.5-115T393 918q17-30 51-98.5t36-77.5q-8-1-110 33q-8 2-27.5 7.5T308 792t-17 5q-2 2-2 10.5t-1 9.5q-5 10-31 15q-23 7-47 0q-18-4-28-21q-4-6-5-23q6-2 24.5-5t29.5-6q58-16 105-32q100-35 102-35q10-2 43-19.5t44-21.5q9-3 21.5-8t14.5-5.5t6 .5q2 12-1 33q0 2-12.5 27T527 769.5T510 803q-25 50-77 131l64 28q12 6 74.5 32t67.5 28q4 1 10.5 25.5t4.5 30.5zM449 592q3 15-4 28q-12 23-50 38q-30 12-60 12q-26-3-49-26q-14-15-18-41l1-3q3 3 19.5 5t26.5 0t58-16q36-12 55-14q17 0 21 17zm698 129l63 227l-139-42zM39 1521l694-232V257L39 490v1031zm1241-317l102 31l-181-657l-100-31l-216 536l102 31l45-110l211 65zM777 242l573 184V46zm311 1323l158 13l-54 160l-40-66q-130 83-276 108q-58 12-91 12h-84q-79 0-199.5-39T318 1668q-8-7-8-16q0-8 5-13.5t13-5.5q4 0 18 7.5t30.5 16.5t20.5 11q73 37 159.5 61.5T714 1754q95 0 167-14.5t157-50.5q15-7 30.5-15.5t34-19t28.5-16.5zm448-1079v1079l-774-246q-14 6-375 127.5T19 1568q-13 0-18-13q0-1-1-3V474q3-9 4-10q5-6 20-11q107-36 149-50V19l558 198q2 0 160.5-55t316-108.5T1369 0q20 0 20 21v418z"
            />
          </svg>
        </button>

        <button className="headerIconButton" onClick={toggleTheme}>
          {isDarkMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 17q-2.075 0-3.537-1.463T7 12t1.463-3.537T12 7t3.538 1.463T17 12t-1.463 3.538T12 17M2 13v-2h4v2zm16 0v-2h4v2zM11 2h2v4h-2zm0 16h2v4h-2zM6.4 7.75L4.975 6.325L7.75 3.55L9.175 4.975zm12.3 12.3l-1.425-1.425l2.775-2.775l1.425 1.425zM16.25 6.4l1.425-1.425l2.775 2.775L19.025 9.175zM3.55 19.725l2.775-2.775l1.425 1.425l-2.775 2.775z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 21q-3.775 0-6.387-2.613T3 12t2.613-6.387T12 3q.35 0 .688.025t.662.075q-1.025.725-1.638 1.888T11.1 7.5q0 2.25 1.575 3.825T16.5 12.9q1.375 0 2.525-.613T20.9 10.65q.05.325.075.662T21 12q0 3.775-2.613 6.388T12 21"
              />
            </svg>
          )}
        </button>

        <button
          className="headerIconButton logoutButton"
          onClick={handleLogout}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M5.615 20q-.69 0-1.152-.462Q4 19.075 4 18.385V5.615q0-.69.463-1.152Q4.925 4 5.615 4h6.404v1H5.615q-.23 0-.423.192Q5 5.385 5 5.615v12.77q0 .23.192.423q.193.192.423.192h6.404v1H5.615Zm10.847-4.462l-.702-.719l2.319-2.319H9.192v-1h8.887l-2.32-2.32l.703-.718L20 12l-3.538 3.538Z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Header;
