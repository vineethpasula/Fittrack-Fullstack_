// src/pages/Login.js
import React, { useState } from "react";
import { apiLogin } from "../api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("alice@example.com");
  const [password, setPassword] = useState("test123");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await apiLogin(email, password);
      if (typeof onLogin === "function") {
        onLogin(user);
      }
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1 className="login-title">FitTrack Login</h1>
        <p className="login-subtitle">Use one of the seeded accounts.</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-field" style={{ marginBottom: 10 }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-field" style={{ marginBottom: 16 }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Login
          </button>
        </form>

        <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 12 }}>
          Example accounts: <b>xyz@example.com / too123</b>,{" "}
          <b>abc@example.com / yoo123</b>, etc.
        </p>
      </div>
    </div>
  );
}

export default Login;
