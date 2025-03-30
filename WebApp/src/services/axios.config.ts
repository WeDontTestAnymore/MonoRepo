import axios from "axios";

const API_BASE_URL = "https://a658-2a09-bac1-36c0-78-00-243-10.ngrok-free.app";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
