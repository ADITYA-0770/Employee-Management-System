import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import api from "../../services/api";
import "./login.css";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post("accounts/login/", {
                email: formData.email,
                password: formData.password,
            });

            console.log("Login response:", response.data);

            const accessToken = response.data.access;
            const refreshToken = response.data.refresh;

            localStorage.setItem("access_token", accessToken);
            localStorage.setItem("refresh_token", refreshToken);

            const isAdmin = response.data.user?.is_staff || 
                            response.data.user?.is_superuser || 
                            (response.data.user?.groups && response.data.user.groups.includes("Admin"));

            if (isAdmin) {
                navigate("/admin/employees");
            } else {
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Login error:", error);

            if (error.response) {
                const data = error.response.data;
                const errorMsg = data?.message ||
                    data?.detail ||
                    (Array.isArray(data?.non_field_errors) ? data.non_field_errors[0] : null) ||
                    (typeof data === "string" ? data : null) ||
                    "Invalid email or password.";
                setError(errorMsg);
            } else {
                setError("Unable to connect to the server. Please check that the backend is running.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-card">
                <Link to="/" className="back-home-link">
                    <ArrowLeft size={16} />
                    <span>Back to Home</span>
                </Link>

                <div className="login-header">
                    <h2>Welcome Back</h2>
                    <p>Log in to access the employee management system</p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <div className="form-input-wrapper">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="form-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                className="form-input"
                                style={{ paddingRight: "2.5rem" }}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "rgba(255, 255, 255, 0.6)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="login-button"
                    >
                        {loading && <div className="spinner"></div>}
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;