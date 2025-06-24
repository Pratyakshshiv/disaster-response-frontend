// App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

import Login from './Login';
import Register from './Register';
import CreateDisaster from './CreateDisaster';
import DisasterMap from './DisasterMap';
import ReportForm from './component/ReportForm';
import ImageVerifyForm from './component/ImageVerifyForm';
import ResourceView from './component/ResourceView';
import SocialMediaView from './component/SocialMediaView';
import NavBar from './component/Navbar';
import UpdateDisaster from './component/UpdateDisaster';
import NewsView from './component/NewsView';
import CreateResource from './component/CreateResource';
import AllResourcesMap from './component/AllResourcesMap';
import ReportList from './component/ReportList'

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        const expiry = payload.exp * 1000;
        const remaining = expiry - Date.now();
        if (remaining <= 0) {
          handleLogout();
        } else {
          setTimeout(() => {
            handleLogout();
            toast.error("Session expired. Please log in again.");
          }, remaining);
        }
      } catch {
        handleLogout();
      }
    }
  }, []);

  const handleLogin = (receivedToken, receivedUsername, receivedRole) => {
  localStorage.setItem('token', receivedToken);
  localStorage.setItem('username', receivedUsername);
  localStorage.setItem('role', receivedRole);
  setToken(receivedToken);
  setUsername(receivedUsername);
  setRole(receivedRole);
  navigate('/');
  toast.success("Login successful!");
};


  const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  setToken(null);
  setUsername(null);
  setRole(null);
  setSelectedDisaster(null);
  navigate('/login');
  toast("Logged out", { icon: "👋" });
};


  const handleDisasterSelect = (disaster) => {
    setSelectedDisaster(disaster);
  };

  return (
    <div className="h-screen flex flex-col">
      <Toaster />
      <NavBar isLoggedIn={!!token} onLogout={handleLogout} username={username} role={role} />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<DisasterMap token={token} role={role} onSelectDisaster={handleDisasterSelect} />} />
          <Route path="/update/:id" element={role === "admin" ? <UpdateDisaster token={token} role={role} /> : <Navigate to="/" />}/>
          <Route path="/register" element={<Register onRegister={handleLogin} />} />
          <Route path="/create" element={token ? <CreateDisaster token={token} /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/report" element={token ? <ReportForm token={token} /> : <Navigate to="/login" replace />} />
          <Route path="/resources" element={token ? <ResourceView token={token} /> : <Navigate to="/login" />} />
          <Route path="/social/:disasterId" element={token ? <SocialMediaView token={token} /> : <Navigate to="/login" replace />} />
          <Route path="/news" element={<NewsView token={token} />} />
          <Route path="/create-resource" element={token ? <CreateResource token={token} /> : <Navigate to="/login" />} />
          <Route path="/all-resources" element={<AllResourcesMap token={token} />} />
          <Route path="/all-report" element={<ReportList token={token} />} />
          <Route path="*" element={<p>Page not found</p>} />
        </Routes>
      </div>
    </div>
  );
};

const RouteWrapper = ({ component: Component, token }) => {
  const { disasterId } = useParams();
  const [disaster, setDisaster] = useState(null);

  useEffect(() => {
    const fetchDisaster = async () => {
      try {
        const res = await fetch(`${API_BASE}/disasters/${disasterId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDisaster(data);
      } catch (err) {
        console.error('Failed to fetch disaster:', err);
      }
    };
    if (disasterId) fetchDisaster();
  }, [disasterId, token]);

  if (!disaster) return <p>Loading disaster...</p>;
  return <Component disaster={disaster} disasterId={disaster.id} token={token} />;
};

export default App;
