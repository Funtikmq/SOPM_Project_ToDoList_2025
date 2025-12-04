import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import "./Login.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Parolele nu coincid");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      window.location.href = "/"; // redirect la Login
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Creează cont</h2>
      <p className="login-subtitle">Magenta glass workspace</p>

      <form className="login-form" onSubmit={handleSignup}>
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
