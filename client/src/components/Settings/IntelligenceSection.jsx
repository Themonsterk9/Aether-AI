import { FiCheck } from "react-icons/fi";

export default function IntelligenceSection() {

    return ["Memory", "Learning", "RAG", "Streaming"].map((feature) => (
        <div className="settingsRow" key={feature}>
            <span>{feature}</span><strong className="enabled"><FiCheck /> Enabled</strong>
        </div>
    ));

}
