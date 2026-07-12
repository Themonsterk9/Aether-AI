import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";

import authService from "../../services/auth.service";
import useAuth from "../../hooks/useAuth";
import AuthCard from "../../components/Auth/AuthCard";
import styles from "../../components/Auth/AuthCard.module.css";

export default function Login() {

    const navigate = useNavigate();
    const { setUser, setToken } = useAuth();

    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        setError("");
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        try {
            setLoading(true);

            const response = await authService.login(form);

            setToken(response.data.token);
            setUser(response.data.user);

            navigate("/chat");

        } catch (err) {
            setError(
                err?.response?.data?.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="Welcome back"
            subtitle="Sign in to Aether AI to continue"
            error={error}
            footerLinkText="Don't have an account?"
            footerActionText="Register"
            footerLinkTo="/register"
        >
            <form onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div className={styles.field}>
                    <label htmlFor="login-email" className={styles.label}>
                        Email Address
                    </label>
                    <div className={styles.inputWrap}>
                        <FiMail className={styles.inputIcon} size={16} />
                        <input
                            id="login-email"
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
                    <label htmlFor="login-password" className={styles.label}>
                        Password
                    </label>
                    <div className={styles.inputWrap}>
                        <FiLock className={styles.inputIcon} size={16} />
                        <input
                            id="login-password"
                            className={styles.input}
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            required
                            aria-label="Password"
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
                        "Sign In"
                    )}
                </button>
            </form>
        </AuthCard>
    );
}