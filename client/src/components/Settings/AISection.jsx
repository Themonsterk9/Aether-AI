import { motion } from "framer-motion";
import AetherLogo from "../Common/AetherLogo";
import { FiFileText, FiShield, FiZap } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";

export default function AISection() {
    const { documentMode, updateDocumentMode } = useAuth();

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="settingsRow" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Primary LLM</span>
                <strong><AetherLogo size={16} animated={false} /> gemini-flash-latest</strong>
            </div>
            <div className="settingsRow" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Embedding Model</span>
                <strong>gemini-embedding-2</strong>
            </div>

            <div style={{ marginTop: "8px" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FiFileText /> Document Mode
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <motion.button
                        type="button"
                        onClick={() => updateDocumentMode("automatic")}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                            padding: "12px 14px",
                            borderRadius: "12px",
                            border: documentMode === "automatic" ? "1px solid var(--primary)" : "1px solid var(--border)",
                            background: documentMode === "automatic" ? "rgba(139, 92, 246, 0.2)" : "var(--surface)",
                            color: documentMode === "automatic" ? "var(--text-primary)" : "var(--text-secondary)",
                            fontSize: "12px",
                            fontWeight: "600",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                            cursor: "pointer",
                            boxShadow: documentMode === "automatic" ? "0 0 16px rgba(139, 92, 246, 0.25)" : "none",
                            transition: "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease"
                        }}
                    >
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><FiZap style={{ color: documentMode === "automatic" ? "var(--accent)" : "inherit" }} /> Automatic</span>
                        <span style={{ fontSize: "10px", fontWeight: "400", opacity: 0.8 }}>Docs first, fallback to Gemini</span>
                    </motion.button>

                    <motion.button
                        type="button"
                        onClick={() => updateDocumentMode("strict")}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                            padding: "12px 14px",
                            borderRadius: "12px",
                            border: documentMode === "strict" ? "1px solid var(--primary)" : "1px solid var(--border)",
                            background: documentMode === "strict" ? "rgba(139, 92, 246, 0.2)" : "var(--surface)",
                            color: documentMode === "strict" ? "var(--text-primary)" : "var(--text-secondary)",
                            fontSize: "12px",
                            fontWeight: "600",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                            cursor: "pointer",
                            boxShadow: documentMode === "strict" ? "0 0 16px rgba(139, 92, 246, 0.25)" : "none",
                            transition: "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease"
                        }}
                    >
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><FiShield style={{ color: documentMode === "strict" ? "var(--accent)" : "inherit" }} /> Strict</span>
                        <span style={{ fontSize: "10px", fontWeight: "400", opacity: 0.8 }}>Answer ONLY from docs</span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
