import { FiMoon } from "react-icons/fi";

export default function AppearanceSection() {

    return (
        <>
            <div className="settingsRow"><span>Theme</span><strong><FiMoon /> Dark</strong></div>
            <div className="settingsRow"><span>Accent</span><strong><i className="accentPreview" /> Purple Blue</strong></div>
            <div className="settingsRow"><span>Font Size</span><strong className="future">Coming soon</strong></div>
        </>
    );

}
