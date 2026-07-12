import api from "./api";

class DocumentService {

    async getDocuments(token) {
        const response = await api.get("/documents", {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data;
    }

    async uploadDocument(file, token, onUploadProgress) {
        const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
        const mimeMap = {
            ".txt": "text/plain",
            ".md": "text/markdown",
            ".pdf": "application/pdf",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        };
        const correctedType = mimeMap[ext] || file.type;
        const correctedFile = new File([file], file.name, { type: correctedType });

        const formData = new FormData();
        formData.append("document", correctedFile);

        const response = await api.post("/documents/upload", formData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            },
            onUploadProgress
        });

        return response.data;
    }

    async deleteDocument(documentId, token) {
        const response = await api.delete(`/documents/${documentId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data;
    }

}

export default new DocumentService();
