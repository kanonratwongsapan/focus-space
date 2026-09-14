// Centralized API Base URL Configuration for Cross-Platform & Cloud Deployment Readiness

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${hostname}:5000/api`;
};

export const API_URL = getApiBaseUrl();
export default API_URL;
