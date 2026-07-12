import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("[ErrorBoundary caught an error]:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "100vh",
                        minHeight: "100dvh",
                        background: "#0B1120",
                        color: "#F8FAFC",
                        fontFamily: "Inter, system-ui, sans-serif",
                        padding: 24,
                        textAlign: "center"
                    }}
                >
                    <div
                        style={{
                            maxWidth: 480,
                            padding: "40px 32px",
                            borderRadius: 20,
                            background: "rgba(30, 41, 59, 0.45)",
                            border: "1px solid #334155",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)"
                        }}
                    >
                        <div
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 14,
                                background: "rgba(239, 68, 68, 0.15)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#EF4444",
                                margin: "0 auto 24px"
                            }}
                        >
                            <FiAlertTriangle size={28} />
                        </div>

                        <h1
                            style={{
                                fontSize: 22,
                                fontWeight: 800,
                                margin: "0 0 12px",
                                letterSpacing: "-0.5px"
                            }}
                        >
                            Something went wrong
                        </h1>

                        <p
                            style={{
                                fontSize: 14,
                                color: "#94A3B8",
                                lineHeight: 1.6,
                                margin: "0 0 28px"
                            }}
                        >
                            An unexpected error occurred in the application.
                            {this.state.error && (
                                <code
                                    style={{
                                        display: "block",
                                        marginTop: 12,
                                        padding: "8px 12px",
                                        background: "rgba(11, 17, 32, 0.6)",
                                        border: "1px solid #334155",
                                        borderRadius: 8,
                                        color: "#F1F5F9",
                                        fontSize: 12,
                                        fontFamily: "monospace",
                                        overflowX: "auto",
                                        textAlign: "left"
                                    }}
                                >
                                    {this.state.error.toString()}
                                </code>
                            )}
                        </p>

                        <button
                            type="button"
                            onClick={this.handleReset}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "12px 24px",
                                borderRadius: 10,
                                border: "none",
                                background: "linear-gradient(135deg, #7C3AED, #2563EB, #06B6D4)",
                                color: "#FFF",
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "transform 0.18s, box-shadow 0.18s",
                                boxShadow: "0 4px 14px rgba(124, 58, 237, 0.4)"
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow = "0 6px 20px rgba(124, 58, 237, 0.5)";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = "none";
                                e.currentTarget.style.boxShadow = "0 4px 14px rgba(124, 58, 237, 0.4)";
                            }}
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
