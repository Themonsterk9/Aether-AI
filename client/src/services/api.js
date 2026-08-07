import axios from "axios";
import { toast } from "react-toastify";

// Diagnostic log for production verification
console.log("[Aether AI Client] VITE_API_URL:", import.meta.env.VITE_API_URL);

/**
 * Resolves and normalizes the backend API base URL.
 * Handles cases where VITE_API_URL is:
 * - undefined -> "/api/v1"
 * - "https://domain.com" -> "https://domain.com/api/v1"
 * - "https://domain.com/" -> "https://domain.com/api/v1"
 * - "https://domain.com/api" -> "https://domain.com/api/v1"
 * - "https://domain.com/api/v1" -> "https://domain.com/api/v1"
 */
const resolveBaseURL = () => {
    const rawUrl = import.meta.env.VITE_API_URL;
    if (!rawUrl) return "/api/v1";

    let url = rawUrl.trim().replace(/\/+$/, "");

    if (url.endsWith("/api/v1")) return url;
    if (url.endsWith("/api")) return `${url}/v1`;
    
    // If raw host string (e.g. https://aether-ai.onrender.com)
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return `${url}/api/v1`;
    }

    return url;
};

const api = axios.create({
    baseURL: resolveBaseURL(),
    timeout: 30000, // 30 seconds network timeout
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

// Response Interceptor for centralized production-grade error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 1. Connection Refused / Server Down (Network Error)
        if (!error.response) {
            console.error("Network Error / Connection Refused:", error);
            toast.error("Network Error: Cannot connect to the server. Please check if the backend is running.");
            return Promise.reject(new Error("Network connection failed."));
        }

        const { status, data } = error.response;
        const msg = data?.message || "An unexpected error occurred.";

        // 2. Session Expired / Unauthorized (401)
        if (status === 401) {
            console.warn("Session Expired:", msg);
            toast.warn(`Session Expired: ${msg}`);
            
            // Clear storage and redirect
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            
            if (
                !window.location.pathname.includes("/login") && 
                !window.location.pathname.includes("/register") && 
                window.location.pathname !== "/"
            ) {
                window.location.href = "/login";
            }
        }
        
        // 3. Payload Too Large / Oversized Upload (413)
        else if (status === 413) {
            toast.error("Upload Failure: File size exceeds the maximum limit (20 MB).");
        }
        
        // 4. Internal Server Error (500)
        else if (status === 500) {
            console.error("Server Error:", error);
            const lowerMsg = msg.toLowerCase();
            
            if (lowerMsg.includes("gemini") || lowerMsg.includes("api key") || lowerMsg.includes("quota")) {
                toast.error("AI Error: Gemini API is unreachable or invalid key. Please check backend environment variables.");
            } else if (lowerMsg.includes("mongo") || lowerMsg.includes("database") || lowerMsg.includes("connection")) {
                toast.error("Database Error: MongoDB connection was interrupted or is unavailable.");
            } else {
                toast.error(`System Error: ${msg}`);
            }
        }
        
        // 5. General Bad Requests and Validation Failures
        else {
            toast.error(msg);
        }

        return Promise.reject(error);
    }
);

export default api;