import { useState, ChangeEvent } from "react";
import { Link } from "react-router-dom";

import "./RegisterLoginPassword.css";

type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Register() {
  const [dark, setDark] = useState(false);
  
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
  };

  const validateForm = () => {
    const newErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.username.trim())
      newErrors.username = "Username is required!";

    if (!formData.email.trim())
      newErrors.email = "Email is required!";
    
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Please enter a valid email!";

    if (!formData.password)
      newErrors.password = "Password is required!";
    
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters long!";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password!";
    
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match!";

    setErrors(newErrors);

    return Object.values(newErrors).every((value) => value === "");
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid)
      return;

    console.log("Register data:", {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <div className={`container${dark ? " dark" : ""}`}>
      <button className="icon-btn" aria-label="Toggle theme" onClick={() => setDark(!dark)}>
        {dark ? (
          /* Sun */
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          /* Half moon */
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      
      {/* Title */}
      <h1>Join Daily Games Hub</h1>

      <p>Create an account and start your gaming journey</p>
      
      {/* Form */}
      <form className="card" onSubmit={handleSubmit}>
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
        <button type="submit" className="submit-btn">Create Account</button>

        {/* Link to login page */}
        <span className="form-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </span>
      </form>
    </div>
  );
}