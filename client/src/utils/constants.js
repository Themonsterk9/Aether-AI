export const APP_NAME = "Aether AI";

const getApiBaseUrl = () => {
    const rawUrl = import.meta.env.VITE_API_URL;
    if (!rawUrl) return "/api/v1";
    let url = rawUrl.trim().replace(/\/+$/, "");
    if (url.endsWith("/api/v1")) return url;
    if (url.endsWith("/api")) return `${url}/v1`;
    if (url.startsWith("http://") || url.startsWith("https://")) return `${url}/api/v1`;
    return url;
};

export const API_BASE_URL = getApiBaseUrl();

export const APP_VERSION = "1.0.0";