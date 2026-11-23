import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

axiosInstance.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(sessionStorage.getItem("fyp-user"));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  } catch {
    sessionStorage.removeItem("fyp-user");
  }
  return config;
});

export const getApiErrorMessage = (error) =>
  error.response?.data?.error ||
  (error.request
    ? "Could not reach the server. Check your connection and try again."
    : error.message);
