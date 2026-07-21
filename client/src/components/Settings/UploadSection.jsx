import { FiCheckCircle } from "react-icons/fi";

const formats = [
    { label: "PDF Documents (.pdf)" },
    { label: "Microsoft Word (.docx)" },
    { label: "Plain Text (.txt)" },
    { label: "Markdown (.md)" },
    { label: "Comma Separated Values (.csv)" },
    { label: "JavaScript Object Notation (.json)" }
];

export default function UploadSection() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="uploadList">
                <div className="uploadHeading" style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "8px" }}>
                    Supported Documents
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {formats.map((format) => (
                        <div
                            className="uploadItem"
                            key={format.label}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "12px",
                                color: "var(--text-secondary)",
                                background: "rgba(255, 255, 255, 0.03)",
                                padding: "6px 10px",
                                borderRadius: "8px"
                            }}
                        >
                            <FiCheckCircle style={{ color: "var(--success)" }} />
                            <span>{format.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="uploadLimit" style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                <span>Maximum file size: </span>
                <strong style={{ color: "var(--text-primary)" }}>20 MB per file</strong>
            </div>
        </div>
    );
}
