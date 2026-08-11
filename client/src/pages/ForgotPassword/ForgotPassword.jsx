import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiMail, 
    FiLock, 
    FiCheckCircle, 
    FiXCircle, 
    FiEye, 
    FiEyeOff, 
    FiCheck, 
    FiCircle 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import authService from '../../services/auth.service';
import AuthCard from '../../components/Auth/AuthCard';
import styles from '../../components/Auth/AuthCard.module.css';
import fpStyles from './ForgotPassword.module.css';

const checks = [
    { id: 'length', label: '8+ Characters', test: p => p.length >= 8 },
    { id: 'upper', label: 'Uppercase', test: p => /[A-Z]/.test(p) },
    { id: 'lower', label: 'Lowercase', test: p => /[a-z]/.test(p) },
    { id: 'number', label: 'Number', test: p => /[0-9]/.test(p) },
    { id: 'special', label: 'Special Character', test: p => /[^A-Za-z0-9]/.test(p) },
];

function maskEmail(email) {
    if (!email || !email.includes('@')) return email;
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `${name[0]}*@${domain}`;
    return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
}

export default function ForgotPassword() {
    const navigate = useNavigate();

    // Steps: 1 = Enter Email, 2 = Verify OTP, 3 = New Password, 4 = Success
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resetToken, setResetToken] = useState('');

    const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');

    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    // Countdown Timer for OTP Step
    useEffect(() => {
        if (step !== 2) return;
        if (countdown <= 0) { setCanResend(true); return; }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [step, countdown]);

    // Auto-focus first OTP input when step 2 opens
    useEffect(() => {
        if (step === 2) {
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [step]);

    // ── STEP 1: Submit Email for Reset OTP ──
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) { setError('Please enter your registered email address.'); return; }

        try {
            setLoading(true);
            const res = await authService.forgotPassword(email.trim());
            toast.success(res.message || 'OTP sent successfully!');
            setStep(2);
            setCountdown(60);
            setCanResend(false);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to send reset code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── STEP 2: OTP Input & Verification Handlers ──
    const handleOtpChange = (index, value) => {
        if (!/^[0-9]$/.test(value) && value !== '') return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
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

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
        if (!pasted) return;
        const newOtp = [...otp];
        pasted.split('').forEach((char, i) => { if (i < 6) newOtp[i] = char; });
        setOtp(newOtp);
        const nextEmpty = newOtp.findIndex(v => v === '');
        const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
        inputRefs.current[focusIndex]?.focus();
    };

    const verifyOtpRef = useRef(false);

    const handleOtpVerify = useCallback(async (e) => {
        e?.preventDefault();
        if (loading || verifyOtpRef.current) return;

        const otpValue = otp.join('');
        if (otpValue.length < 6) { setError('Please enter the full 6-digit verification code.'); return; }

        verifyOtpRef.current = true;
        setLoading(true);
        setError('');

        try {
            const res = await authService.verifyResetOTP(email, otpValue);
            setResetToken(res.data?.resetToken || '');
            toast.success('Code verified successfully!');
            setStep(3);
        } catch (err) {
            verifyOtpRef.current = false;
            setError(err?.response?.data?.message || 'Invalid verification code. Please try again.');
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
        } finally {
            setLoading(false);
        }
    }, [otp, email, loading]);

    // Auto-submit OTP when all 6 digits are typed
    useEffect(() => {
        if (step === 2 && otp.every(d => d !== '') && !loading) {
            handleOtpVerify();
        }
    }, [step, otp, handleOtpVerify, loading]);

    const handleOtpResend = async () => {
        if (!canResend || resending) return;
        setResending(true);
        setError('');

        try {
            const res = await authService.resendResetOTP(email);
            toast.success(res.message || 'New OTP sent successfully.');
            setCountdown(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to resend code.');
        } finally {
            setResending(false);
        }
    };

    // ── STEP 3: Submit New Password ──
    const handlePasswordChange = (e) => {
        setError('');
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
    };

    const isPasswordFilled = passwordForm.password.length > 0;
    const isConfirmFilled = passwordForm.confirmPassword.length > 0;
    const isMatching = isConfirmFilled && passwordForm.password === passwordForm.confirmPassword;
    const isMismatched = isConfirmFilled && passwordForm.password !== passwordForm.confirmPassword;

    const handleNewPasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!passwordForm.password || !passwordForm.confirmPassword) {
            setError('Please enter and confirm your new password.');
            return;
        }
        if (passwordForm.password !== passwordForm.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        const failedCheck = checks.find(c => !c.test(passwordForm.password));
        if (failedCheck) {
            setError(`Password requirement not met: ${failedCheck.label}`);
            return;
        }

        try {
            setLoading(true);
            const res = await authService.resetPassword(resetToken, passwordForm.password);
            toast.success(res.message || 'Password updated successfully!');
            setStep(4);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to reset password. Please start over.');
        } finally {
            setLoading(false);
        }
    };

    // ── RENDER STEP 4: SUCCESS SCREEN ──
    if (step === 4) {
        return (
            <AuthCard title="Password reset successful" subtitle="Your password has been updated successfully.">
                <div className={fpStyles.sentWrap}>
                    <FiCheckCircle size={56} className={fpStyles.sentIcon} />
                    <p className={fpStyles.sentMsg}>You can now sign in to your Aether AI account using your new password.</p>
                    <button
                        type="button"
                        className={styles.submitBtn}
                        onClick={() => navigate('/login', { replace: true })}
                    >
                        Login
                    </button>
                </div>
            </AuthCard>
        );
    }

    // ── RENDER STEP 3: CREATE NEW PASSWORD ──
    if (step === 3) {
        return (
            <AuthCard
                title="Create a new password"
                subtitle="Choose a strong new password for your account"
                error={error}
            >
                <form onSubmit={handleNewPasswordSubmit} noValidate>
                    <div className={styles.field}>
                        <label htmlFor="fp-new-pass" className={styles.label}>New Password</label>
                        <div className={styles.inputWrap}>
                            <FiLock className={styles.inputIcon} size={16} />
                            <input
                                id="fp-new-pass"
                                className={styles.input}
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                value={passwordForm.password}
                                onChange={handlePasswordChange}
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className={fpStyles.toggleBtn}
                                onClick={() => setShowPassword(prev => !prev)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                tabIndex={-1}
                            >
                                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <div className={fpStyles.labelWithStatus}>
                            <label htmlFor="fp-confirm-pass" className={styles.label}>Confirm New Password</label>
                            {isConfirmFilled && (
                                <span className={`${fpStyles.matchBadge} ${isMatching ? fpStyles.matchSuccess : fpStyles.matchError}`}>
                                    {isMatching ? (
                                        <>
                                            <FiCheckCircle size={12} />
                                            <span>Passwords match</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiXCircle size={12} />
                                            <span>Passwords do not match</span>
                                        </>
                                    )}
                                </span>
                            )}
                        </div>
                        <div className={styles.inputWrap}>
                            <FiLock className={styles.inputIcon} size={16} />
                            <input
                                id="fp-confirm-pass"
                                className={styles.input}
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className={fpStyles.toggleBtn}
                                onClick={() => setShowConfirmPassword(prev => !prev)}
                                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Compact Password Requirements */}
                    <div className={fpStyles.requirementsContainer}>
                        <span className={fpStyles.requirementsTitle}>Password Requirements</span>
                        <div className={fpStyles.requirementsList}>
                            {checks.map(c => {
                                const passed = c.test(passwordForm.password);
                                return (
                                    <div key={c.id} className={`${fpStyles.checkItem} ${passed ? fpStyles.checkItemPassed : ''}`}>
                                        {passed ? <FiCheck size={14} className={fpStyles.iconPassed} /> : <FiCircle size={12} className={fpStyles.iconDefault} />}
                                        <span>{c.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? <span className={styles.spinner} /> : 'Update Password'}
                    </button>
                </form>
            </AuthCard>
        );
    }

    // ── RENDER STEP 2: ENTER OTP SCREEN ──
    if (step === 2) {
        return (
            <AuthCard
                title="Verify your email"
                subtitle="Enter the 6-digit OTP sent to your email"
                error={error}
            >
                <div className={fpStyles.emailBadge}>
                    <FiMail size={14} />
                    <span>{maskEmail(email)}</span>
                </div>

                <form onSubmit={handleOtpVerify} noValidate>
                    <div className={fpStyles.otpGrid}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                className={`${fpStyles.otpBox} ${digit ? fpStyles.filled : ''}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleOtpChange(index, e.target.value)}
                                onKeyDown={e => handleOtpKeyDown(index, e)}
                                onPaste={index === 0 ? handleOtpPaste : undefined}
                                autoComplete="one-time-code"
                                aria-label={`OTP digit ${index + 1}`}
                            />
                        ))}
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading || otp.join('').length < 6}>
                        {loading ? <span className={styles.spinner} /> : 'Verify OTP'}
                    </button>
                </form>

                <div className={fpStyles.resendRow}>
                    {canResend ? (
                        <button
                            type="button"
                            className={fpStyles.resendBtn}
                            onClick={handleOtpResend}
                            disabled={resending}
                        >
                            {resending ? 'Sending...' : 'Resend OTP'}
                        </button>
                    ) : (
                        <p className={fpStyles.countdown}>
                            Resend OTP in <span className={fpStyles.countdownNum}>{countdown}s</span>
                        </p>
                    )}
                </div>
            </AuthCard>
        );
    }

    // ── RENDER STEP 1: FORGOT PASSWORD EMAIL ENTRY ──
    return (
        <AuthCard
            title="Forgot password"
            subtitle="Enter your email to receive a password reset verification code"
            error={error}
            footerLinkText="Remembered it?"
            footerActionText="Back to Sign In"
            footerLinkTo="/login"
        >
            <form onSubmit={handleEmailSubmit} noValidate>
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
                    {loading ? <span className={styles.spinner} /> : 'Send Verification Code'}
                </button>
            </form>
        </AuthCard>
    );
}
