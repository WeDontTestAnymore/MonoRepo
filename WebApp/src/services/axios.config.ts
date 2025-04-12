import axios from "axios";

<<<<<<< HEAD
const API_BASE_URL = "https://8125-2401-4900-1c8f-f9b-add3-4203-52e6-2488.ngrok-free.app";
=======
<<<<<<< HEAD
<<<<<<< Updated upstream
const API_BASE_URL = "https://c06b-210-212-183-60.ngrok-free.app";
=======
const API_BASE_URL = "http://backend:3000";
>>>>>>> Stashed changes
=======
const API_BASE_URL = "http://localhost:3000";
>>>>>>> delta
>>>>>>> 3cfe41a9d46e3f8725e4d45d051f3695f6abf8bf

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
