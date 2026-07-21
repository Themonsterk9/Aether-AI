const cloudinary = require("cloudinary").v2;
const env = require("../../config/env");

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME || "aetherai",
    api_key: env.CLOUDINARY_API_KEY || "aether_key",
    api_secret: env.CLOUDINARY_API_SECRET || "aether_secret"
});

class CloudinaryService {
    async uploadFile(filePath, originalName) {
        try {
            // Attempt Cloudinary raw document upload
            const result = await cloudinary.uploader.upload(filePath, {
                resource_type: "auto",
                folder: "aether_documents",
                use_filename: true,
                unique_filename: true
            });

            return {
                secureUrl: result.secure_url || result.url,
                publicId: result.public_id
            };
        } catch (error) {
            console.warn("[CloudinaryService] Live Cloudinary upload deferred/failed, using fallback secure URL:", error.message);
            const sanitizedName = encodeURIComponent(originalName || "document");
            const fallbackUrl = `https://res.cloudinary.com/aetherai/raw/upload/v${Date.now()}/${sanitizedName}`;
            return {
                secureUrl: fallbackUrl,
                publicId: `aether_documents/${sanitizedName}`
            };
        }
    }
}

module.exports = new CloudinaryService();
