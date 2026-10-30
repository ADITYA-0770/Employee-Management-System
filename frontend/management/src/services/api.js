import axios from "axios";

export const getBaseURL = () => {
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

export const getMediaURL = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const base = getBaseURL();
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
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
    // If sending FormData (file upload), delete Content-Type so Axios & browser
    // automatically generate 'multipart/form-data; boundary=----...'
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
