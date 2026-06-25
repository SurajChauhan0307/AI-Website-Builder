import axios from 'axios';

// Single source of truth for the backend URL
const BASE_URL =
  import.meta.env.VITE_SERVER_URL ||
  'https://ai-website-builder-d0n1.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 120000, // 2 min — AI generation can be slow
});

// ─── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
// Attach JWT from localStorage on every request as Authorization: Bearer <token>
api.interceptors.request.use(
  (config) => {
    const raw = localStorage.getItem('token');
    if (raw) {
      const token = raw.replace(/^"|"$/g, ''); // strip accidental surrounding quotes
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
// On 401: clear stale auth and redirect to home.
// NOTE: App.jsx startup /me check uses plain axios (not this instance)
// so a cold-start 401 won't accidentally log the user out.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('persist:ai-website-builder');

      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;