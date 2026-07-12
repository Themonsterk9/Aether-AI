import api from "./api";

class AuthService {

    async register(userData) {
        const response = await api.post("/auth/register", userData);
        return response.data;
    }

    async login(credentials) {
        const response = await api.post("/auth/login", credentials);
        return response.data;
    }

    async profile(token) {
        const response = await api.get("/auth/profile", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    }

    async logout(token) {

    const response = await api.post(
        "/auth/logout",
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;

}

}

export default new AuthService();