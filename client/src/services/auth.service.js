import api from './api';

class AuthService {

    async register(userData) {
        const response = await api.post('/auth/register', userData);
        return response.data;
    }

    async login(credentials) {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    }

    async googleAuth(googleData) {
        const response = await api.post('/auth/google', googleData);
        return response.data;
    }

    async verifyOTP(email, otp) {
        const response = await api.post('/auth/verify-otp', { email, otp });
        return response.data;
    }

    async resendOTP(email) {
        const response = await api.post('/auth/resend-otp', { email });
        return response.data;
    }

    async forgotPassword(email) {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    }

    async verifyResetOTP(email, otp) {
        const response = await api.post('/auth/verify-reset-otp', { email, otp });
        return response.data;
    }

    async resendResetOTP(email) {
        const response = await api.post('/auth/resend-reset-otp', { email });
        return response.data;
    }

    async resetPassword(token, password) {
        const response = await api.post('/auth/reset-password', { token, password });
        return response.data;
    }

    async verifyEmailToken(token) {
        const response = await api.get(`/auth/verify-email/${token}`);
        return response.data;
    }

    async profile(token) {
        const response = await api.get('/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    async logout(token) {
        const response = await api.post('/auth/logout', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
}

export default new AuthService();