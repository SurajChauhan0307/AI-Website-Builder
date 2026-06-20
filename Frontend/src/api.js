import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "https://ai-website-builder-d0n1.onrender.com",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  // Extra quotes hata kar token clean karein
  const cleanToken = token ? token.replace(/"/g, "") : null;

  if (cleanToken) {
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;