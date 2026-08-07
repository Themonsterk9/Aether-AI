import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiUser, 
    FiMail, 
    FiLock, 
    FiCheckCircle, 
    FiXCircle, 
    FiEye, 
    FiEyeOff, 
    FiCheck, 
    FiCircle 
} from 'react-icons/fi';

import authService from '../../services/auth.service';
import AuthCard from '../../components/Auth/AuthCard';
import styles from '../../components/Auth/AuthCard.module.css';
import regStyles from './Register.module.css';

const checks = [
    { id: 'length', label: '8+ Characters', test: p => p.length >= 8 },
    { id: 'upper', label: 'Uppercase', test: p => /[A-Z]/.test(p) },
    { id: 'lower', label: 'Lowercase', test: p => /[a-z]/.test(p) },
    { id: 'number', label: 'Number', test: p => /[0-9]/.test(p) },
    { id: 'special', label: 'Special Character', test: p => /[^A-Za-z0-9]/.test(p) },
];

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setError('');
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const isPasswordFilled = form.password.length > 0;
    const isConfirmFilled = form.confirmPassword.length > 0;
    const isMatching = isConfirmFilled && form.password === form.confirmPassword;
    const isMismatched = isConfirmFilled && form.password !== form.confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
            setError('All fields are required.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        const failedCheck = checks.find(c => !c.test(form.password));
        if (failedCheck) {
            setError(`Password requirement not met: ${failedCheck.label}`);
            return;
        }

        try {
            setLoading(true);
            const { confirmPassword, ...registerData } = form;
            const response = await authService.register(registerData);
            navigate('/otp', { state: { email: form.email, isRegistration: true } });
        } catch (err) {
            setError(err?.response?.data?.message || 'Registration failed. Please try again.');
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
                {/* 1. Full Name */}
                <div className={styles.field}>
                    <label htmlFor="reg-name" className={styles.label}>Full Name</label>
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
                        />
                    </div>
                </div>

                {/* 2. Email Address */}
                <div className={styles.field}>
                    <label htmlFor="reg-email" className={styles.label}>Email Address</label>
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
                        />
                    </div>
                </div>

                {/* 3. Password */}
                <div className={styles.field}>
                    <label htmlFor="reg-password" className={styles.label}>Password</label>
                    <div className={styles.inputWrap}>
                        <FiLock className={styles.inputIcon} size={16} />
                        <input
                            id="reg-password"
                            className={styles.input}
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            required
                        />
                        <button
                            type="button"
                            className={regStyles.toggleBtn}
                            onClick={() => setShowPassword(prev => !prev)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            tabIndex={-1}
                        >
                            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                    </div>
                </div>

                {/* 4. Confirm Password */}
                <div className={styles.field}>
                    <div className={regStyles.labelWithStatus}>
                        <label htmlFor="reg-confirm" className={styles.label}>Confirm Password</label>
                        {isConfirmFilled && (
                            <span 
                                className={`${regStyles.matchBadge} ${isMatching ? regStyles.matchSuccess : regStyles.matchError}`}
                                aria-live="polite"
                            >
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
                            id="reg-confirm"
                            className={`${styles.input} ${isMismatched ? regStyles.inputError : ''} ${isMatching ? regStyles.inputSuccess : ''}`}
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="••••••••"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                            required
                        />
                        <button
                            type="button"
                            className={regStyles.toggleBtn}
                            onClick={() => setShowConfirmPassword(prev => !prev)}
                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                    </div>
                </div>

                {/* 5. Compact Vertical Password Requirements */}
                <div className={regStyles.requirementsContainer} aria-live="polite">
                    <span className={regStyles.requirementsTitle}>Password Requirements</span>
                    <div className={regStyles.requirementsList}>
                        {checks.map(c => {
                            const passed = c.test(form.password);
                            return (
                                <div 
                                    key={c.id} 
                                    className={`${regStyles.checkItem} ${passed ? regStyles.checkItemPassed : ''}`}
                                >
                                    {passed ? (
                                        <FiCheck size={14} className={regStyles.iconPassed} />
                                    ) : (
                                        <FiCircle size={12} className={regStyles.iconDefault} />
                                    )}
                                    <span>{c.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 6. Create Account Submit Button */}
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? <span className={styles.spinner} /> : 'Create Account'}
                </button>
            </form>
        </AuthCard>
    );
}