import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
    baseURL: "http://localhost:5002/api/v1",
    timeout: 30000, // 30 seconds network timeout
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
            
            if (lowerMsg.includes("ollama") || lowerMsg.includes("llama")) {
                toast.error("AI Error: Ollama instance is unreachable. Please make sure Ollama is running.");
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