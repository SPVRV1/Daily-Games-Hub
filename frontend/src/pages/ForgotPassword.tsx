import { useState,ChangeEvent, FormEvent } from "react";

import "./RegisterLoginPassword.css";

type ForgotPasswordFormData = {
    email: string;
};

export default function ForgotPassword() {
    const [dark, setDark] = useState(false);

    const [formData, setFormData] =
        useState<ForgotPasswordFormData>({
            email: "",
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

        console.log("Reset password request:", formData);
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

            <h1>Forgot password?</h1>

            <p>No worries, we'll send you reset instructions</p>

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

                <button type="submit" className="submit-btn">Reset password</button>

                <span className="form-link">
                    Back to <a href="/Login">Login</a>
                </span>
            </form>
        </div>
  );
}