import axios from "axios";

const getBaseURL = () => {
    // 1. If explicit environment variable is provided at build/runtime
    if (import.meta.env.VITE_API_BASE_URL) {
        let url = import.meta.env.VITE_API_BASE_URL;
        return url.endsWith("/") ? url : `${url}/`;
    }
    // 2. If running locally on development machine
    if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        return "http://localhost:8000/";
    }
    // 3. Deployed production backend URL on Render
    return "https://employee-management-system-fppi.onrender.com/";
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    // Do not attach token for login or register endpoints
    if (token && !config.url.includes("login") && !config.url.includes("register")) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
