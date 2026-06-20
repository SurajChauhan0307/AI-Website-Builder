import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "https://ai-website-builder-d0n1.onrender.com",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;