import axios from "axios";

const API_BASE_URL = "https://8125-2401-4900-1c8f-f9b-add3-4203-52e6-2488.ngrok-free.app";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
