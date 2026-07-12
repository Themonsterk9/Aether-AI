import { FiCheckCircle } from "react-icons/fi";

const formats = [
    { label: "Plain Text (.txt)" },
    { label: "Markdown (.md)" },
    { label: "PDF (.pdf)" },
    { label: "Microsoft Word (.docx)" }
];

export default function UploadSection() {

    return (
        <>
            <div className="uploadList">
                <div className="uploadHeading">Supported Documents</div>
                {formats.map((format) => (
                    <div className="uploadItem" key={format.label}>
                        <FiCheckCircle />
                        <span>{format.label}</span>
                    </div>
                ))}
            </div>
            <div className="uploadLimit"><span>Maximum upload size</span><strong>20 MB per file</strong></div>
        </>
    );

}
