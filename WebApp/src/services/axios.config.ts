import axios from "axios";

const API_BASE_URL =
  "https://62e3-2401-4900-1c2c-71bf-4ca8-39f2-4f7e-11ad.ngrok-free.app";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
