import { useState } from 'react';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
import authService from '../../services/auth.service';
import AuthCard from '../../components/Auth/AuthCard';
import styles from '../../components/Auth/AuthCard.module.css';
import fpStyles from './ForgotPassword.module.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) { setError('Please enter your email address.'); return; }

        try {
            setLoading(true);
            await authService.forgotPassword(email);
            setSent(true);
        } catch (err) {
            setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <AuthCard title="Check your inbox" subtitle="Password reset instructions sent">
                <div className={fpStyles.sentWrap}>
                    <div className={fpStyles.sentIcon}><FiCheckCircle size={48} /></div>
                    <div className={fpStyles.sentEmail}>{email}</div>
                    <p className={fpStyles.sentMsg}>If an account with that email exists, we've sent a reset link. The link expires in <strong>15 minutes</strong>.</p>
                    <p className={fpStyles.sentHint}>Don't see it? Check your spam folder.</p>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard
            title="Forgot password"
            subtitle="Enter your email to receive a reset link"
            error={error}
            footerLinkText="Remembered it?"
            footerActionText="Back to Sign In"
            footerLinkTo="/login"
        >
            <form onSubmit={handleSubmit} noValidate>
                <div className={styles.field}>
                    <label htmlFor="forgot-email" className={styles.label}>Email Address</label>
                    <div className={styles.inputWrap}>
                        <FiMail className={styles.inputIcon} size={16} />
                        <input
                            id="forgot-email"
                            className={styles.input}
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={e => { setError(''); setEmail(e.target.value); }}
                            autoComplete="email"
                            required
                        />
                    </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? <span className={styles.spinner} /> : 'Send Reset Link'}
                </button>
            </form>
        </AuthCard>
    );
}
