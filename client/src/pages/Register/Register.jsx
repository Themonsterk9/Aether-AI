import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock } from "react-icons/fi";

import authService from "../../services/auth.service";
import AuthCard from "../../components/Auth/AuthCard";
import styles from "../../components/Auth/AuthCard.module.css";

export default function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        setError("");
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            // Destructure to avoid sending confirmPassword to the backend API
            const { confirmPassword, ...registerData } = form;
            await authService.register(registerData);

            navigate("/login");

        } catch (err) {
            setError(
                err?.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="Create account"
            subtitle="Get started with Aether AI today"
            error={error}
            footerLinkText="Already have an account?"
            footerActionText="Sign in"
            footerLinkTo="/login"
        >
            <form onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div className={styles.field}>
                    <label htmlFor="reg-name" className={styles.label}>
                        Full Name
                    </label>
                    <div className={styles.inputWrap}>
                        <FiUser className={styles.inputIcon} size={16} />
                        <input
                            id="reg-name"
                            className={styles.input}
                            type="text"
                            name="name"
                            placeholder="Your full name"
                            value={form.name}
                            onChange={handleChange}
                            autoComplete="name"
                            required
                            aria-label="Full name"
                            aria-required="true"
                        />
                    </div>
                </div>

                {/* Email Address */}
                <div className={styles.field}>
                    <label htmlFor="reg-email" className={styles.label}>
                        Email Address
                    </label>
                    <div className={styles.inputWrap}>
                        <FiMail className={styles.inputIcon} size={16} />
                        <input
                            id="reg-email"
                            className={styles.input}
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                            aria-label="Email address"
                            aria-required="true"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className={styles.field}>
                    <label htmlFor="reg-password" className={styles.label}>
                        Password
                    </label>
                    <div className={styles.inputWrap}>
                        <FiLock className={styles.inputIcon} size={16} />
                        <input
                            id="reg-password"
                            className={styles.input}
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            required
                            aria-label="Password"
                            aria-required="true"
                        />
                    </div>
                </div>

                {/* Confirm Password */}
                <div className={styles.field}>
                    <label htmlFor="reg-confirm" className={styles.label}>
                        Confirm Password
                    </label>
                    <div className={styles.inputWrap}>
                        <FiLock className={styles.inputIcon} size={16} />
                        <input
                            id="reg-confirm"
                            className={styles.input}
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                            required
                            aria-label="Confirm password"
                            aria-required="true"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                    aria-busy={loading}
                >
                    {loading ? (
                        <span className={styles.spinner} aria-hidden="true" />
                    ) : (
                        "Create Account"
                    )}
                </button>
            </form>
        </AuthCard>
    );
}