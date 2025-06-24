// --- FRONTEND: Register.jsx ---
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const Register = ({ onRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        onRegister(data.token, data.username);
        toast.success("Registration successful!");
        navigate('/');
      } else {
        setMessage(data.error || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Request failed.");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Register</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="citizen">Citizen</option>
          <option value="responder">Responder</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Register</button>
      </form>
      {message && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
};

export default Register;
