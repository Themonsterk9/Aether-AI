import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import authService from "../services/auth.service";
import settingsService from "../services/settings.service";
import { toast } from "react-toastify";
import {
    getItem,
    setItem,
    removeItem
} from "../utils/storage";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUserState] = useState(null);
    const [token, setTokenState] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = getItem("user");
        const storedToken = getItem("token");

        if (storedUser) {
            setUserState(storedUser);
        }

        if (storedToken) {
            setTokenState(storedToken);
        }

        const loadProfile = async () => {
            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {
                const response = await authService.profile(storedToken);
                setUserState(response.data);
                setItem("user", response.data);
            } catch (error) {
                console.error("Profile load error:", error);
                removeItem("token");
                removeItem("user");
                setTokenState(null);
                setUserState(null);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const setUser = useCallback((value) => {
        setUserState(value);
        if (value) {
            setItem("user", value);
        } else {
            removeItem("user");
        }
    }, []);

    const setToken = useCallback((value) => {
        setTokenState(value);
        if (value) {
            setItem("token", value);
        } else {
            removeItem("token");
        }
    }, []);

    const updateDocumentMode = useCallback(async (mode) => {
        if (!mode || !["automatic", "strict"].includes(mode)) return;

        const previousMode = user?.documentMode || "automatic";
        const updatedUser = { ...user, documentMode: mode };

        // Optimistic update
        setUserState(updatedUser);
        setItem("user", updatedUser);

        if (!token) return;

        try {
            const res = await settingsService.updateDocumentMode(mode, token);
            if (res.success && res.data?.documentMode) {
                const confirmedUser = { ...user, documentMode: res.data.documentMode };
                setUserState(confirmedUser);
                setItem("user", confirmedUser);
            }
        } catch (err) {
            console.error("Failed to update document mode API:", err);
            // Revert on error
            const revertedUser = { ...user, documentMode: previousMode };
            setUserState(revertedUser);
            setItem("user", revertedUser);
            toast.error("Unable to update document mode.");
        }
    }, [user, token]);

    const value = useMemo(() => ({
        user,
        setUser,
        token,
        setToken,
        loading,
        documentMode: user?.documentMode || "automatic",
        updateDocumentMode
    }), [user, token, loading, setUser, setToken, updateDocumentMode]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);