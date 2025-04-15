import axios from "axios";

const API_BASE_URL =
  "https://50dc-123-252-204-198.ngrok-free.app";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
