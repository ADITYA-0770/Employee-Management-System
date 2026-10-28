import axios from "axios";

const getBaseURL = () => {
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
        return "http://localhost:8000/";
    }
    if (typeof window !== "undefined" && window.location.hostname) {
        return `http://${window.location.hostname}:8000/`;
    }
    return "http://127.0.0.1:8000/";
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