import axios from "axios";

const api = axios.create({
  baseURL: "https://financeflow.it.com", // ✅ HTTPS + domínio personalizado
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
