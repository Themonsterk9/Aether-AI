import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import App from "./App";
import "./styles/globals.css";

import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import ErrorBoundary from "./components/Common/ErrorBoundary";

// Global Unhandled Promise Rejection Handler
window.addEventListener("unhandledrejection", (event) => {
    console.error("Global Unhandled Rejection caught:", event.reason);
    
    // Extract a user-friendly message
    let errorMessage = "An unexpected network or application error occurred.";
    if (event.reason) {
        if (typeof event.reason === "string") {
            errorMessage = event.reason;
        } else if (event.reason.message) {
            errorMessage = event.reason.message;
        } else if (event.reason.response?.data?.message) {
            errorMessage = event.reason.response.data.message;
        }
    }
    
    // Avoid double-toasting common expected backend response messages by filtering if needed,
    // or display a standard error toast
    toast.error(`System Notice: ${errorMessage}`);
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AppProvider>
                <AuthProvider>
                    <ChatProvider>
                        <ErrorBoundary>
                            <App />
                        </ErrorBoundary>
                        <ToastContainer
                            position="bottom-right"
                            theme="dark"
                            autoClose={3500}
                        />
                    </ChatProvider>
                </AuthProvider>
            </AppProvider>
        </BrowserRouter>
    </React.StrictMode>
);
