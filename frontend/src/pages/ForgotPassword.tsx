import { useState,ChangeEvent } from "react";
import { Link } from "react-router-dom";

import "./RegisterLoginPassword.css";

type ForgotPasswordFormData = {
    email: string;
};

export default function ForgotPassword() {
    const [dark, setDark] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const [formData, setFormData] =
        useState<ForgotPasswordFormData>({
            email: "",
        });
    
    const [errors, setErrors] = useState({
        email: "",
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

        setSuccess("");
    };

    const validateForm = () => {
        const newErrors = {
            email: "",
        };

        if (!formData.email.trim())
            newErrors.email = "Email is required!";
        
        else if (!/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = "Please enter a valid email!";

        setErrors(newErrors);

        return Object.values(newErrors).every((value) => value === "");
    };

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const isValid = validateForm();

        if (!isValid)
            return;

        setLoading(true);

        setTimeout(() => {
            setLoading(false);

            setSuccess(
                "Password reset instructions have been sent to your email!"
            );

            console.log("Reset password request:", formData);
        }, 1000);
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
            <h1>Forgot password?</h1>

            <p>No worries, we'll send you reset instructions</p>
            
            {/* Form */}
            <form className="card" onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Input your email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                />

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                {errors.email && (
                    <span className="error-text">
                        {errors.email}
                    </span>
                )}

                {/* Submit button */}
                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Sending..." : "Reset password"}
                </button>

                {/* Link to login page */}
                <span className="form-link">
                    Back to <Link to="/login">Login</Link>
                </span>
            </form>
        </div>
  );
}