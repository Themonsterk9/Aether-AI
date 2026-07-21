import { motion } from "framer-motion";

export default function AetherLogo({ size = 36, className = "", style = {}, animated = true, "aria-hidden": ariaHidden = true }) {
    const Component = animated ? motion.svg : "svg";
    const motionProps = animated
        ? {
            whileHover: { scale: 1.05 },
            transition: { duration: 0.2, ease: "easeOut" }
        }
        : {};

    return (
        <Component
            width={size}
            height={size}
            viewBox="-14 -14 128 128"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{
                display: "inline-block",
                verticalAlign: "middle",
                overflow: "visible",
                flexShrink: 0,
                filter: "drop-shadow(0 0 12px rgba(139, 92, 246, 0.5))",
                cursor: animated ? "pointer" : "default",
                ...style
            }}
            aria-label={ariaHidden ? undefined : "Aether AI"}
            aria-hidden={ariaHidden}
            {...motionProps}
        >
            <defs>
                {/* Main 3-Stop Purple Gradient */}
                <linearGradient id="aetherMainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6D28D9" />
                </linearGradient>

                {/* Secondary Accent Gradient */}
                <linearGradient id="aetherAccentGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#7E22CE" />
                </linearGradient>

                {/* Dark Glass Center Radial Gradient */}
                <radialGradient id="aetherDarkCenter" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0B0F19" />
                    <stop offset="70%" stopColor="#1E1B4B" />
                    <stop offset="100%" stopColor="#090A0F" />
                </radialGradient>
            </defs>

            {/* 8-Point Outer Glowing Star / Flower Silhouette */}
            <g transform="translate(0, 0)">
                {/* 8 Rotated Smooth Flower Petals */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
                    <path
                        key={angle}
                        d="M 50 6 C 59 18, 59 34, 50 48 C 41 34, 41 18, 50 6 Z"
                        fill="url(#aetherMainGrad)"
                        opacity={index % 2 === 0 ? "0.95" : "0.75"}
                        transform={`rotate(${angle} 50 50)`}
                    />
                ))}

                {/* 8 Interspersed Accent Petals for Depth */}
                {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle) => (
                    <path
                        key={angle}
                        d="M 50 12 C 56 22, 56 36, 50 46 C 44 36, 44 22, 50 12 Z"
                        fill="url(#aetherAccentGrad)"
                        opacity="0.55"
                        transform={`rotate(${angle} 50 50)`}
                    />
                ))}

                {/* Glassmorphic Outer Ring */}
                <circle
                    cx="50"
                    cy="50"
                    r="22"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="1.2"
                />

                {/* Dark Glass Center Circle */}
                <circle
                    cx="50"
                    cy="50"
                    r="18"
                    fill="url(#aetherDarkCenter)"
                    stroke="rgba(168, 85, 247, 0.7)"
                    strokeWidth="1.5"
                />

                {/* Center Glowing Sparkle Core */}
                <path
                    d="M 50 38 Q 50 50 62 50 Q 50 50 50 62 Q 50 50 38 50 Q 50 50 50 38 Z"
                    fill="#FFFFFF"
                    opacity="0.95"
                />
                <circle cx="50" cy="50" r="3" fill="#A855F7" />
            </g>
        </Component>
    );
}
