import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AetherLogo from "../../components/Common/AetherLogo";
import { LuBrain } from "react-icons/lu";
import { TbDatabase } from "react-icons/tb";
import { HiSparkles } from "react-icons/hi2";
import { FiArrowRight } from "react-icons/fi";

import styles from "./Home.module.css";

const features = [
    {
        icon: <LuBrain size={28} />,
        title: "Long-Term Memory",
        desc: "Aether AI remembers your conversations and learns from them over time. No more repeating yourself."
    },
    {
        icon: <TbDatabase size={28} />,
        title: "RAG Search",
        desc: "Upload your documents and let Aether AI answer questions using your own knowledge base."
    },
    {
        icon: <HiSparkles size={28} />,
        title: "Learning Engine",
        desc: "The AI continuously refines its understanding of your preferences and writing style."
    }
];

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
};

export default function Home() {
    return (
        <div className={styles.page}>
            {/* Ambient background glows */}
            <div className={styles.glowBg}>
                <motion.div
                    className={styles.glow1}
                    animate={{
                        scale: [1, 1.15, 1],
                        x: [0, 20, 0],
                        y: [0, -30, 0]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className={styles.glow2}
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, -30, 0],
                        y: [0, 20, 0]
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* ── Navbar ───────────────────────────────── */}
            <nav className={styles.nav}>
                <div className={styles.navInner}>
                    <Link to="/" className={styles.navLogo}>
                        <AetherLogo size={32} />
                        <div className={styles.navBrandText}>
                            <span className={styles.navBrand}>Aether AI</span>
                            <span className={styles.navSub}>Local AI Assistant</span>
                        </div>
                    </Link>
                    <div className={styles.navActions}>
                        <Link to="/login" className={styles.navBtnOutline}>Sign In</Link>
                        <Link to="/register" className={styles.navBtnFilled}>
                            Get Started &nbsp;<FiArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ─────────────────────────────────── */}
            <div className={styles.hero}>
                <motion.div
                    className={styles.heroContent}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className={styles.heroBadge} variants={itemVariants}>
                        <HiSparkles size={14} /> Powered by Google Gemini · Cloud Architecture
                    </motion.div>

                    <motion.h1 className={styles.heroHeading} variants={itemVariants}>
                        Your AI Assistant,{" "}
                        <span className={styles.gradient}>Powered by Gemini</span>
                    </motion.h1>

                    <motion.p className={styles.heroSub} variants={itemVariants}>
                        Chat with a powerful AI assistant that handles long-term memory, continuous learning, and intelligent document indexing.
                    </motion.p>

                    {/* Capabilities bullets */}
                    <motion.div className={styles.bullets} variants={itemVariants}>
                        <span>✓ Memory</span>
                        <span>✓ Learning</span>
                        <span>✓ RAG</span>
                        <span>✓ Streaming</span>
                        <span>✓ Document Processing</span>
                    </motion.div>

                    <motion.div className={styles.heroCtas} variants={itemVariants}>
                        <Link to="/login" className={styles.ctaSecondary}>
                            Sign In
                        </Link>
                        <Link to="/register" className={styles.ctaPrimary}>
                            Get Started &nbsp;<FiArrowRight size={16} />
                        </Link>
                    </motion.div>
                </motion.div>
            </div>

            {/* ── Features ─────────────────────────────── */}
            <section id="features" className={styles.features}>
                <h2 className={styles.featuresHeading}>
                    Everything you need
                </h2>

                <div className={styles.cards}>
                    {features.map(({ icon, title, desc }) => (
                        <div className={styles.card} key={title}>
                            <div className={styles.cardIcon}>{icon}</div>
                            <h3 className={styles.cardTitle}>{title}</h3>
                            <p className={styles.cardDesc}>{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Footer ───────────────────────────────── */}
            <footer className={styles.footer}>
                <span>Powered by Gemini</span>
                <span className={styles.footerDot}>·</span>
                <span>Open Source</span>
                <span className={styles.footerDot}>·</span>
                <span>Privacy First</span>
            </footer>
        </div>
    );
}