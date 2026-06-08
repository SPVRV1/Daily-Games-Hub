import { useState, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useUser } from "../context/UserContext";

import "./RegisterLoginPassword.css";

type LoginFormData = {
  username: string;
  password: string;
};

export default function Login() {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";

  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {
      username: "",
      password: "",
    };

    if (!formData.username.trim())
      newErrors.username = "Username is required!";

    if (!formData.password.trim())
      newErrors.password = "Password is required!";

    setErrors(newErrors);

    return Object.values(newErrors).every((value) => value === "");
  };
  
  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid)
      return;

    setLoading(true);
    setAuthError(null);

    (async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/user/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.ok || !payload?.token) {
          throw new Error(payload?.error || "Login failed");
        }

        localStorage.setItem("token", payload.token);
        await refreshUser();
        navigate("/");
      } catch (err) {
        setAuthError(err instanceof Error ? err.message : "Login failed");
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="container auth-container w-full">
      <Navbar activeLink="home" variant="auth" />
      <div className="auth-content">
        {/* Title */}
        <h1>Welcome Back!</h1>

      <p>Sign in to continue your daily challenge streak</p>
      
      {/* Form */}
      <form className="card" onSubmit={handleSubmit}>
        {authError && (
          <span className="error-text">
            {authError}
          </span>
        )}
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Enter your username"
          autoComplete="username"
          value={formData.username}
          onChange={handleChange}
        />

        {errors.username && (
          <span className="error-text">
            {errors.username}
          </span>
        )}

        <label htmlFor="password">Password</label>
        <input 
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
        />

        {errors.password && (
          <span className="error-text">
            {errors.password}
          </span>
        )}

        <span className="forgot-password">
          <a href="/forgot-password">Forgot password</a>
        </span>

        {/* Submit button */}
        <button type="submit" className="submit-btn" disabled={loading}>
          {/* Arrow right */}
          <svg viewBox="0 0 24 17" fill="none" width="18" height="18">
            <path d="M2 8h10M10 4l4 4-4 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Link to registration page */}
        <span className="form-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </span>
      </form>
      </div>
    </div>
  );
}