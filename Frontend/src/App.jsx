import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import WebsiteEditor from './pages/WebsiteEditor';
import LiveSite from './pages/LiveSite';
import Pricing from './pages/Pricing';
import { useSelector, useDispatch } from 'react-redux';
import { setUserData, clearUserData } from './redux/userSlice';
import axios from 'axios';

// Base URL — single source of truth
const BASE_URL =
  import.meta.env.VITE_SERVER_URL ||
  'https://ai-website-builder-d0n1.onrender.com';

const App = () => {
  const { userData } = useSelector((s) => s.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const raw = localStorage.getItem('token');
    if (!raw) return;

    // Strip accidental quotes that older code may have stored
    const token = raw.replace(/^"|"$/g, '');
    if (!token) return;

    // ✅ Use a plain axios call (NOT the shared api instance) for session restore.
    // The shared api.js response interceptor redirects to / on ANY 401.
    // If the server is waking up (Render cold start) and briefly returns 401,
    // the interceptor would clear the token and log the user out incorrectly.
    // A plain call lets us handle the 401 ourselves — just stay logged out quietly.
    axios
      .get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        timeout: 15000,
      })
      .then((res) => {
        if (res.data?.user) {
          dispatch(setUserData(res.data.user));
        }
      })
      .catch((err) => {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          // Token is genuinely expired or invalid — clear it
          dispatch(clearUserData());
          localStorage.removeItem('token');
          localStorage.removeItem('persist:ai-website-builder');
        }
        // Any other error (network, 500, timeout) — keep the token and try again later
        // Don't log the user out just because Render is waking up
        console.warn('❌ User fetch failed on initialization:', err.message);
      });
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/dashboard"   element={userData ? <Dashboard />     : <Home />} />
        <Route path="/generate"    element={userData ? <Generate />      : <Home />} />
        <Route path="/editor/:id"  element={userData ? <WebsiteEditor /> : <Home />} />
        <Route path="/site/:slug"  element={<LiveSite />} />
        <Route path="/pricing"     element={<Pricing />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;