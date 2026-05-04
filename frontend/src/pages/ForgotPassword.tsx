import { useState,ChangeEvent } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

import "./RegisterLoginPassword.css";

type ForgotPasswordFormData = {
    email: string;
};

export default function ForgotPassword() {
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
        <div className={"container auth-container"}>
            <Navbar activeLink="none" variant="auth" />
            <div className="auth-content">
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
        </div>
  );
}