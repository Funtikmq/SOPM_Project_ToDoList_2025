import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import "./Login.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [username, setUsername] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Parolele nu coincid");
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const usernameValid = /^[a-zA-Z0-9_]{3,}$/.test(cleanUsername);
    if (!usernameValid) {
      alert("Username invalid. Folosește doar litere/cifre/underscore, minim 3 caractere.");
      return;
    }

    try {
      // verificare unicitate username
      const q = query(collection(db, "users"), where("username", "==", cleanUsername));
      const snap = await getDocs(q);
      if (!snap.empty) {
        alert("Acest username este deja folosit");
        return;
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      const displayName = user.displayName || email?.split("@")[0] || cleanUsername;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName,
        username: cleanUsername,
        tag: `#${cleanUsername}`,
        avatarUrl: null,
      });

      window.location.href = "/"; // redirect la Login
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Crează cont</h2>
      <p className="login-subtitle">Magenta glass workspace</p>

      <form className="login-form" onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Alege un username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Parolă"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmă parola"
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button className="login-btn" type="submit">
          Sign Up
        </button>
      </form>

      <div className="auth-switch">
        Ai deja cont?{" "}
        <a onClick={() => (window.location.href = "/")}>Login</a>
      </div>
    </div>
  );
};

export default Signup;
