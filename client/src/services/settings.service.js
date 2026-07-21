import api from "./api";

class SettingsService {
    async getSettings(token) {
        const response = await api.get("/settings", {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    async updateDocumentMode(mode, token) {
        const response = await api.patch(
            "/settings/document-mode",
            { mode },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return response.data;
    }

    async updateSettings(settingsData, token) {
        const response = await api.put("/settings", settingsData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
}

export default new SettingsService();
