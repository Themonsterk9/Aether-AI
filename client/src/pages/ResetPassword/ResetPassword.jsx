import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FiLock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import authService from '../../services/auth.service';
import AuthCard from '../../components/Auth/AuthCard';
import styles from '../../components/Auth/AuthCard.module.css';
import rpStyles from './ResetPassword.module.css';

const checks = [
    { id: 'length', label: 'At least 8 characters', test: p => p.length >= 8 },
    { id: 'upper', label: 'Uppercase letter', test: p => /[A-Z]/.test(p) },
    { id: 'lower', label: 'Lowercase letter', test: p => /[a-z]/.test(p) },
    { id: 'number', label: 'Number', test: p => /[0-9]/.test(p) },
    { id: 'special', label: 'Special character', test: p => /[^A-Za-z0-9]/.test(p) },
];

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';

    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showStrength, setShowStrength] = useState(false);
    const [done, setDone] = useState(false);

    if (!token) {
        return (
            <AuthCard title="Invalid link" subtitle="This password reset link is invalid or has expired.">
                <Link to="/forgot-password" className={`${styles.submitBtn} ${rpStyles.actionBtn}`}>
                    Request New Reset Link
                </Link>
            </AuthCard>
        );
    }

    const handleChange = (e) => {
        setError('');
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === 'password') setShowStrength(value.length > 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.password || !form.confirmPassword) { setError('Both fields are required.'); return; }
        if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
        const failedCheck = checks.find(c => !c.test(form.password));
        if (failedCheck) { setError(`Password requirement: ${failedCheck.label}`); return; }

        try {
            setLoading(true);
            await authService.resetPassword(token, form.password);
            setDone(true);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <AuthCard title="Password reset!" subtitle="Your password has been changed successfully.">
                <div className={rpStyles.doneWrap}>
                    <FiCheckCircle size={52} className={rpStyles.successIcon} />
                    <p className={rpStyles.doneMsg}>You can now sign in with your new password.</p>
                    <button className={styles.submitBtn} onClick={() => navigate('/login', { replace: true })}>
                        Sign In
                    </button>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard
            title="Reset password"
            subtitle="Choose a strong new password"
            error={error}
        >
            <form onSubmit={handleSubmit} noValidate>
                <div className={styles.field}>
                    <label htmlFor="rp-password" className={styles.label}>New Password</label>
                    <div className={styles.inputWrap}>
                        <FiLock className={styles.inputIcon} size={16} />
                        <input id="rp-password" className={styles.input} type="password" name="password"
                            placeholder="••••••••" value={form.password} onChange={handleChange}
                            autoComplete="new-password" required />
                    </div>
                    {showStrength && (
                        <div className={rpStyles.strengthBox}>
                            {checks.map(c => {
                                const passed = c.test(form.password);
                                return (
                                    <div key={c.id} className={`${rpStyles.checkRow} ${passed ? rpStyles.passed : ''}`}>
                                        {passed ? <FiCheckCircle size={13} /> : <FiXCircle size={13} />}
                                        <span>{c.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className={styles.field}>
                    <label htmlFor="rp-confirm" className={styles.label}>Confirm New Password</label>
                    <div className={styles.inputWrap}>
                        <FiLock className={styles.inputIcon} size={16} />
                        <input id="rp-confirm" className={styles.input} type="password" name="confirmPassword"
                            placeholder="••••••••" value={form.confirmPassword} onChange={handleChange}
                            autoComplete="new-password" required />
                    </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? <span className={styles.spinner} /> : 'Reset Password'}
                </button>
            </form>
        </AuthCard>
    );
}
