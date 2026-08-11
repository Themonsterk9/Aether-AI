import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import styles from "./GoogleAuthButton.module.css";

export default function GoogleAuthButton({ label = "Continue with Google", onError }) {
    const navigate = useNavigate();
    const { setUser, setToken } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleGoogleSuccess = async (tokenResponse) => {
        try {
            setLoading(true);
            const response = await authService.googleAuth({
                accessToken: tokenResponse.access_token,
                credential: tokenResponse.credential
            });

            if (response.data?.token) {
                setToken(response.data.token);
                setUser(response.data.user);
                toast.success(response.message || "Signed in with Google!");
                navigate("/chat", { replace: true });
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Google sign-in failed.";
            if (onError) onError(msg);
            else toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // Google OAuth login hook with official account-chooser selection prompt
    const loginWithGoogle = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: (error) => {
            console.error("Google Auth Error:", error);
            const msg = "Google authentication failed or was cancelled.";
            if (onError) onError(msg);
            else toast.error(msg);
        },
        prompt: "select_account"
    });

    const handleClick = () => {
        if (loading) return;

        // Check if VITE_GOOGLE_CLIENT_ID is configured or if dummy key
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId || clientId.includes("dummy")) {
            toast.info("Google OAuth: Set VITE_GOOGLE_CLIENT_ID in environment variables to enable live Google Sign-In.");
            return;
        }

        try {
            loginWithGoogle();
        } catch (err) {
            console.error("Google Login trigger error:", err);
            toast.error("Unable to launch Google authentication chooser.");
        }
    };

    return (
        <div className={styles.container}>
            <button
                type="button"
                className={styles.googleBtn}
                onClick={handleClick}
                disabled={loading}
                aria-label={label}
            >
                {loading ? (
                    <span className={styles.spinner} />
                ) : (
                    <>
                        <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                        </svg>
                        <span>{label}</span>
                    </>
                )}
            </button>

            <div className={styles.divider}>
                <div className={styles.dividerLine} />
                <span>or continue with email</span>
                <div className={styles.dividerLine} />
            </div>
        </div>
    );
}
