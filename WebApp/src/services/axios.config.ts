import axios from "axios";

const API_BASE_URL = "https://a28e-2401-4900-1c9a-d930-a0ee-121a-8ddd-5805.ngrok-free.app";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
