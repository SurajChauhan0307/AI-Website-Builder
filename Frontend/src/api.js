import axios from 'axios';

// Single source of truth for the backend URL
const BASE_URL =
  import.meta.env.VITE_SERVER_URL ||
  'https://ai-website-builder-d0n1.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies on every request
  timeout: 120000,       // 2 min — AI generation can be slow
});

// ─── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
// Attach JWT from localStorage on every request as Authorization: Bearer <token>
// This is the fallback for cross-origin deploys where cookies are blocked.
api.interceptors.request.use(
  (config) => {
    const raw = localStorage.getItem('token');
    if (raw) {
      // Strip any accidental surrounding quotes saved by older code
      const token = raw.replace(/^"|"$/g, '');
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
// On 401 Unauthorized: clear stale auth state and send user to home page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale token + persisted redux state
      localStorage.removeItem('token');
      localStorage.removeItem('persist:ai-website-builder');

      // Only redirect if not already on the home page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;