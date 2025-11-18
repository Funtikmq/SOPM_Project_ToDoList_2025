import "./Header.css";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

const Header = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="headerLayout">
      <div className="headerUser">
        <img
          className="userPhoto"
          src={user?.photoURL || "https://i.imgur.com/6VBx3io.png"}
          alt="image"
        />

        <div className="userInfo">
          {user?.displayName || user?.email || "User"}
        </div>
      </div>

      <div className="headerButtons">
        <button>
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

        <button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 48 48"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M24.288 42.47C13.91 42.412 5.498 34.2 5.498 24S13.91 5.53 24.288 5.53c6.602 0 12.328 3.64 15.76 8.41c1.63 2.265 3.133 5.465 2.131 10.278c-1 4.813-5.944 7.888-8.723 7.888H28.95c-3.896 0-4.265 3.667-2.635 5.396c1.53 1.623.41 4.982-2.028 4.968"
            />
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.93 20.832a3.21 3.21 0 0 1-3.21 3.211h0a3.211 3.211 0 0 1 0-6.422h0a3.21 3.21 0 0 1 3.21 3.211m22.557 0a3.21 3.21 0 0 1-3.211 3.211h0a3.21 3.21 0 0 1-3.211-3.21h0a3.21 3.21 0 0 1 3.21-3.212h0a3.21 3.21 0 0 1 3.212 3.211m-6.043-8.215a3.211 3.211 0 0 1-6.422 0h0a3.21 3.21 0 0 1 3.211-3.211h0a3.21 3.21 0 0 1 3.211 3.21m-10.471.001a3.21 3.21 0 0 1-3.21 3.21h0a3.211 3.211 0 1 1 3.21-3.21"
            />
          </svg>
        </button>

        <button onClick={handleLogout}>
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
