import api from "./api";

class KnowledgeService {

    async getDashboard(token) {
        const response = await api.get("/knowledge/dashboard", {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data;
    }

}

export default new KnowledgeService();
