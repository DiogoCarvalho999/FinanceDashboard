import axios from "axios";

const api = axios.create({
  baseURL: "http://13.61.146.251:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  // Não adicionar o token se for login ou register
  if (
    token &&
    !config.url.includes("/auth/login") &&
    !config.url.includes("/auth/register")
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
