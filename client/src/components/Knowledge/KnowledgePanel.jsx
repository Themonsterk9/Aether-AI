import { memo } from "react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { FiFileText, FiRefreshCw, FiSettings, FiUploadCloud } from "react-icons/fi";
import { LuBrain } from "react-icons/lu";
import { HiSparkles } from "react-icons/hi2";
import { TbDatabase } from "react-icons/tb";

import useAuth from "../../hooks/useAuth";
import knowledgeService from "../../services/knowledge.service";
import ModelInfo from "./ModelInfo";
import StatCard from "./StatCard";
import SystemStatus from "./SystemStatus";
import styles from "./KnowledgePanel.module.css";

const emptyDashboard = {
    documents: { uploaded: 0, indexed: 0, processing: 0, recent: [] },
    memory: { count: 0, latestUpdatedAt: null },
    learning: { count: 0, enabled: true },
    rag: { chunks: 0, ready: false },
    models: { llm: "Loading...", embedding: "Loading..." },
    system: { api: false, database: false, ollama: false, authentication: true }
};

const timeAgo = (date) => {
    if (!date) return "No memories stored";
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
    if (minutes < 1) return "Updated just now";
    if (minutes < 60) return `Updated ${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    return `Updated ${hours}h ago`;
};

function KnowledgePanel({ onUpload, onSettings, refreshKey }) {

    const { token } = useAuth();
    const [dashboard, setDashboard] = useState(emptyDashboard);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!token) return;

        try {
            const response = await knowledgeService.getDashboard(token);
            setDashboard(response.data);
        } catch {
            // Keep the latest successful values visible when a refresh fails.
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        refresh();
        const refreshInterval = window.setInterval(refresh, 30000);
        return () => window.clearInterval(refreshInterval);
    }, [refresh, refreshKey]);

    return (
        <motion.aside className={styles.panel} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <header className={styles.title}><LuBrain /> <span>Knowledge Center</span>{loading && <small>Loading</small>}</header>

            <StatCard icon={<FiFileText />} title="Documents">
                <div className={styles.metrics}>
                    <span><strong>{dashboard.documents.uploaded}</strong> Uploaded</span>
                    <span><strong>{dashboard.documents.indexed}</strong> Indexed</span>
                    <span><strong>{dashboard.documents.processing}</strong> Processing</span>
                </div>
            </StatCard>

            <StatCard icon={<LuBrain />} title="Memory">
                <div className={styles.primaryMetric}><strong>{dashboard.memory.count}</strong><span>Memories Stored</span></div>
                <span className={styles.muted}>{timeAgo(dashboard.memory.latestUpdatedAt)}</span>
            </StatCard>

            <StatCard icon={<HiSparkles />} title="Learning">
                <div className={styles.primaryMetric}><strong>{dashboard.learning.count}</strong><span>Learned Facts</span></div>
                <span className={styles.ready}>{dashboard.learning.enabled ? "Learning Enabled" : "Learning Disabled"}</span>
            </StatCard>

            <StatCard icon={<TbDatabase />} title="RAG">
                <div className={styles.primaryMetric}><strong>{dashboard.rag.chunks.toLocaleString()}</strong><span>Document Chunks</span></div>
                <span className={dashboard.rag.ready ? styles.ready : styles.muted}>{dashboard.rag.ready ? "Vector Search Ready" : "No indexed documents"}</span>
            </StatCard>

            <StatCard icon={<LuBrain />} title="AI Model"><ModelInfo models={dashboard.models} /></StatCard>

            <StatCard icon={<TbDatabase />} title="System"><SystemStatus system={dashboard.system} /></StatCard>

            <section className={styles.recent}>
                <h3>Recent Documents</h3>
                {dashboard.documents.recent.length ? dashboard.documents.recent.map((document) => (
                    <div className={styles.recentDocument} key={document._id}><FiFileText /><span>{document.originalName}</span><small className={document.status === "completed" ? styles.ready : styles.muted}>{document.status === "completed" ? "Indexed" : document.status}</small></div>
                )) : <p>No documents uploaded yet.</p>}
            </section>

            <div className={styles.actions}>
                <button type="button" onClick={refresh}><FiRefreshCw /> Refresh</button>
                <button type="button" onClick={onUpload}><FiUploadCloud /> Upload</button>
                <button type="button" onClick={onSettings}><FiSettings /> Settings</button>
            </div>
        </motion.aside>
    );

}

export default memo(KnowledgePanel);
