import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
