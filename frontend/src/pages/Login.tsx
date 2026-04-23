import { useState, ChangeEvent, FormEvent } from "react";

import "./RegisterLoginPassword.css";

type LoginFormData = {
  username: string;
  password: string;
};

export default function Login() {
  const [dark, setDark] = useState(false);

  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Login data:", formData);
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
      
      <h1>Welcome Back!</h1>

      <p>Sign in to continue your daily challenge streak</p>

      <form className="card" onSubmit={handleSubmit}>
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

        <span className="forgot-password">
          <a href="/forgot-password">Forgot password</a>
        </span>

        <button type="submit" className="submit-btn">
          {/* Arrow left */}
          <svg viewBox="0 0 24 17" fill="none" width="18" height="18">
            <path d="M2 8h10M10 4l4 4-4 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          Sign In
        </button>

        <span className="form-link">
          Don't have an account? <a href="/register">Sign up</a>
        </span>
      </form>
    </div>
  );
}