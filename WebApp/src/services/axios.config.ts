import axios from "axios";

const API_BASE_URL = "https://2327-106-213-83-170.ngrok-free.app";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
