import { useState, ChangeEvent, FormEvent } from "react";

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      
      <h1>Join Daily Games Hub</h1>

      <p>Create an account and start your gaming journey</p>

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

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <button type="submit" className="submit-btn">Create Account</button>

        <span className="form-link">
          Already have an account? <a href="/login">Sign in</a>
        </span>
      </form>
    </div>
  );
}