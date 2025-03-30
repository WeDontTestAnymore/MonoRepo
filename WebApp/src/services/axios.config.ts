import axios from "axios";

const API_BASE_URL = "https://d3c3-210-212-183-60.ngrok-free.app";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
