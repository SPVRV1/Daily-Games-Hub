import { useState, ChangeEvent, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import "./RegisterLoginPassword.css";

type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const apiBaseUrl = useMemo(() => {
    const envPort = import.meta.env.VITE_API_PORT;

    if (envPort)
      return `http://localhost:${envPort}`;

    return import.meta.env.VITE_API_URL ?? "http://localhost:3000";
  }, []);

  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    setAuthError(null);
  };

  const validateForm = () => {
    const newErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    // Username validation
    if (!formData.username.trim())
      newErrors.username = "Username is required!";

    else if (formData.username.length < 3)
      newErrors.username = "Username must be at least 3 characters!";

    // Email validation
    if (!formData.email.trim())
      newErrors.email = "Email is required!";
    
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Please enter a valid email!";

    // Password validation
    if (!formData.password)
      newErrors.password = "Password is required!";
    
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters long!";

    else if (!/[A-Z]/.test(formData.password))
      newErrors.password = "Password must contain uppercase letter!";
    
    else if (!/[0-9]/.test(formData.password))
      newErrors.password = "Password must contain number!";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password!";
    
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match!";

    setErrors(newErrors);

    return Object.values(newErrors).every((value) => value === "");
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid)
      return;

    setLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json().catch(() => null);

      // console.log("REGISTER RESPONSE:", data);

      if (!response.ok || !data?.ok)
        throw new Error(data?.error || "Registration failed");
      
      if (data.token)
        localStorage.setItem("token", data.token);
      
      alert("User created successfully!");

      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      navigate("/login"); // Redirect to login page after successfull registration

    }
    catch (err) {
      setAuthError(err instanceof Error ? err.message : "Registration failed");
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-container">
      <Navbar variant="auth" />

      <div className="auth-content">
        {/* Title */}
        <h1>Join Daily Games Hub</h1>

        <p>Create an account and start your gaming journey</p>

        {/* Form */}
        <form className="card" onSubmit={handleSubmit}>
          {authError && (
            <span className="error-text">{authError}</span>
          )}
          
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Choose a username"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
          />

          {errors.username && (
            <span className="error-text">
              {errors.username}
            </span>
          )}

          <label htmlFor="email">Email</label>
          <input 
            id="email"
            name="email"
            type="email"
            placeholder="Choose an email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
          />

          {errors.email && (
            <span className="error-text">
              {errors.email}
            </span>
          )}

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />

          {formData.password && (
              <ul className="password-requirements">
                  <li className={formData.password.length >= 8 ? "req-met" : "req-unmet"}>
                      At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? "req-met" : "req-unmet"}>
                      One uppercase letter
                  </li>
                  <li className={/[0-9]/.test(formData.password) ? "req-met" : "req-unmet"}>
                      One number
                  </li>
              </ul>
            )}

          {errors.password && (
            <span className="error-text">
              {errors.password}
            </span>
          )}

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          {errors.confirmPassword && (
            <span className="error-text">
              {errors.confirmPassword}
            </span>
          )}

          {/* Submit button */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

          {/* Link to login page */}
          <span className="form-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </span>
        </form>
      </div>
    </div>
  );
}