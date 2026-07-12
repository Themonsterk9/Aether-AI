import { RiRobot2Line } from "react-icons/ri";

export default function AISection() {

    return (
        <>
            <div className="settingsRow"><span>Model</span><strong><RiRobot2Line /> llama3.2</strong></div>
            <div className="settingsRow"><span>Embedding</span><strong>nomic-embed-text</strong></div>
            <div className="settingsRow"><span>Temperature</span><strong>0.7</strong></div>
            <div className="settingsRow"><span>Max Tokens</span><strong>4096</strong></div>
        </>
    );

}
