import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';

import authService from '../../services/auth.service';
import AuthCard from '../../components/Auth/AuthCard';
import styles from '../../components/Auth/AuthCard.module.css';
import loginStyles from './Login.module.css';

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');

    const handleChange = (e) => {
        setError('');
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setInfo('');

        try {
            setLoading(true);
            const response = await authService.login(form);

            if (response.data?.requiresOTP) {
                navigate('/otp', { state: { email: response.data.email } });
            } else {
                navigate('/chat');
            }
        } catch (err) {
            const code = err?.response?.data?.code;
            const msg = err?.response?.data?.message || 'Login failed. Please check your credentials.';

            if (code === 'EMAIL_NOT_VERIFIED') {
                setInfo(msg);
            } else {
                setError(msg);
            }
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
            {info && (
                <div className={loginStyles.infoBanner} role="alert">
                    {info}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div className={styles.field}>
                    <label htmlFor="login-email" className={styles.label}>Email Address</label>
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
                        />
                    </div>
                </div>

                <div className={styles.field}>
                    <div className={loginStyles.passwordLabelRow}>
                        <label htmlFor="login-password" className={styles.label}>Password</label>
                        <Link to="/forgot-password" className={loginStyles.forgotLink}>Forgot password?</Link>
                    </div>
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
                        />
                    </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? <span className={styles.spinner} /> : 'Sign In'}
                </button>
            </form>
        </AuthCard>
    );
}