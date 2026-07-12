import { createContext, useContext, useEffect, useMemo, useState } from "react";
import authService from "../services/auth.service";

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

                const response =
                    await authService.profile(storedToken);

                setUserState(response.data);

                setItem("user", response.data);

            } catch (error) {

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

    const setUser = (value) => {

        setUserState(value);

        if (value) {
            setItem("user", value);
        } else {
            removeItem("user");
        }

    };

    const setToken = (value) => {

        setTokenState(value);

        if (value) {
            setItem("token", value);
        } else {
            removeItem("token");
        }

    };

    // Stable reference — all auth consumers only re-render when user/token/loading actually change
    const value = useMemo(() => ({
        user,
        setUser,
        token,
        setToken,
        loading
    }), [user, token, loading]); // setUser/setToken are stable setState-derived functions

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

}

export const useAuth = () => useContext(AuthContext);