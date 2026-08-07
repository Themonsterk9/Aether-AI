import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home/Home"));
const Chat = lazy(() => import("./pages/Chat/Chat"));
const Login = lazy(() => import("./pages/Login/Login"));
const Register = lazy(() => import("./pages/Register/Register"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Settings = lazy(() => import("./pages/Settings/Settings"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const OTP = lazy(() => import('./pages/OTP/OTP'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword/ResetPassword'));

// Loading Screen
function PageLoader() {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100dvh",
                background: "var(--bg, #0d0f14)"
            }}
        >
            <div
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "3px solid rgba(99,102,241,.2)",
                    borderTopColor: "var(--accent,#6366f1)",
                    animation: "spin .75s linear infinite"
                }}
            />

            <style>{`
                @keyframes spin{
                    to{
                        transform:rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}

export default function App() {

    const location = useLocation();

    return (
        <Suspense fallback={<PageLoader />}>

            <AnimatePresence mode="wait" initial={false}>

                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                >

                    <Routes location={location}>

                        {/* Public Pages */}

                        <Route
                            path="/"
                            element={<Home />}
                        />

                        <Route
                            path="/login"
                            element={<Login />}
                        />

                        <Route
                            path="/register"
                            element={<Register />}
                        />

                        <Route path="/otp" element={<OTP />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

                        {/* Protected Pages */}

                        <Route
                            path="/chat"
                            element={
                                <ProtectedRoute>
                                    <MainLayout>
                                        <Chat />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <MainLayout>
                                        <Profile />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <MainLayout>
                                        <Settings />
                                    </MainLayout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="*"
                            element={<NotFound />}
                        />

                    </Routes>

                </motion.div>

            </AnimatePresence>

        </Suspense>
    );
}