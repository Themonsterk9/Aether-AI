import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';
import authService from '../../services/auth.service';
import useAuth from '../../hooks/useAuth';
import AuthCard from '../../components/Auth/AuthCard';
import styles from '../../components/Auth/AuthCard.module.css';
import otpStyles from './OTP.module.css';

export default function OTP() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser, setToken } = useAuth();

    const email = location.state?.email || '';
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    // Redirect if no email
    useEffect(() => {
        if (!email) navigate('/login', { replace: true });
    }, [email, navigate]);

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) { setCanResend(true); return; }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // Auto-focus first input
    useEffect(() => {
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }, []);

    const handleChange = (index, value) => {
        if (!/^[0-9]$/.test(value) && value !== '') return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (otp[index] === '' && index > 0) {
                inputRefs.current[index - 1]?.focus();
            } else {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
        if (pasted.length === 0) return;
        const newOtp = [...otp];
        pasted.split('').forEach((char, i) => { if (i < 6) newOtp[i] = char; });
        setOtp(newOtp);
        const nextEmpty = newOtp.findIndex(v => v === '');
        const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
        inputRefs.current[focusIndex]?.focus();
    };

    const submittedRef = useRef(false);

    const handleSubmit = useCallback(async (e) => {
        e?.preventDefault();
        if (loading || submittedRef.current) return;

        const otpValue = otp.join('');
        if (otpValue.length < 6) { setError('Please enter the complete 6-digit code.'); return; }

        submittedRef.current = true;
        setLoading(true);
        setError('');

        try {
            const response = await authService.verifyOTP(email, otpValue);
            setToken(response.data.token);
            setUser(response.data.user);
            navigate('/chat', { replace: true });
        } catch (err) {
            submittedRef.current = false;
            setError(err?.response?.data?.message || 'Invalid OTP. Please try again.');
            // Clear inputs on error
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
        } finally {
            setLoading(false);
        }
    }, [otp, email, loading, navigate, setToken, setUser]);

    // Auto-submit when all 6 digits are filled
    useEffect(() => {
        if (otp.every(d => d !== '') && !loading) {
            handleSubmit();
        }
    }, [otp, handleSubmit, loading]);

    const handleResend = async () => {
        if (!canResend || resending) return;
        setResending(true);
        setError('');

        try {
            await authService.resendOTP(email);
            setCountdown(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setResending(false);
        }
    };

    const isRegistration = location.state?.isRegistration || false;
    const title = isRegistration ? "Account Verification" : "Enter verification code";
    const subtitle = isRegistration
        ? "We sent a 6-digit code to activate your account."
        : `We sent a 6-digit code to ${email}`;

    return (
        <AuthCard
            title={title}
            subtitle={subtitle}
            error={error}
        >
            <div className={otpStyles.emailBadge}>
                <FiMail size={14} />
                <span>{email}</span>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                <div className={otpStyles.otpGrid}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            className={`${otpStyles.otpBox} ${digit ? otpStyles.filled : ''}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleChange(index, e.target.value)}
                            onKeyDown={e => handleKeyDown(index, e)}
                            onPaste={index === 0 ? handlePaste : undefined}
                            autoComplete="one-time-code"
                            aria-label={`OTP digit ${index + 1}`}
                        />
                    ))}
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading || otp.join('').length < 6}>
                    {loading ? <span className={styles.spinner} /> : 'Verify Code'}
                </button>
            </form>

            <div className={otpStyles.resendRow}>
                {canResend ? (
                    <button
                        type="button"
                        className={otpStyles.resendBtn}
                        onClick={handleResend}
                        disabled={resending}
                    >
                        {resending ? 'Sending...' : 'Resend code'}
                    </button>
                ) : (
                    <p className={otpStyles.countdown}>
                        Resend code in <span className={otpStyles.countdownNum}>{countdown}s</span>
                    </p>
                )}
            </div>

            <p className={otpStyles.backLink}>
                Wrong email? <a href="/login" className={otpStyles.backAnchor}>Go back</a>
            </p>
        </AuthCard>
    );
}
