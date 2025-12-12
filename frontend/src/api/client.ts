import axios, { AxiosHeaders } from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("escrow_token");
    if (!token) return config;

    // Normalize to AxiosHeaders then set
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;

    return config;
});

export default api;
