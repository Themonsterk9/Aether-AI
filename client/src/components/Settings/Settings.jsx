import styles from "./Settings.module.css";

export default function Settings({

    onClose

}){

    return(

        <div
            className={styles.overlay}
            onClick={onClose}
        >

            <div
                className={styles.panel}
                onClick={(e)=>e.stopPropagation()}
            >

                <div className={styles.title}>

                    ⚙️ Settings

                </div>

                <div className={styles.section}>

                    <h3>🎨 Appearance</h3>

                    <div className={styles.card}>

                        Dark Theme

                    </div>

                </div>

                <div className={styles.section}>

                    <h3>🤖 AI</h3>

                    <div className={styles.card}>

                        <div className={styles.row}>

                            <span>Model</span>

                            <span>llama3.2</span>

                        </div>

                        <div className={styles.row}>

                            <span>Temperature</span>

                            <span>0.7</span>

                        </div>

                        <div className={styles.row}>

                            <span>Max Tokens</span>

                            <span>4096</span>

                        </div>

                    </div>

                </div>

                <div className={styles.section}>

                    <h3>🧠 Intelligence</h3>

                    <div className={styles.card}>

                        <div>✔ Memory</div>

                        <div>✔ Learning</div>

                        <div>✔ RAG</div>

                        <div>✔ Streaming</div>

                    </div>

                </div>

                <div className={styles.section}>

                    <h3>📄 Documents</h3>

                    <div className={styles.card}>

                        <div>.txt</div>

                        <div>.md</div>

                        <div>.pdf</div>

                        <div>.docx</div>

                        <br/>

                        <strong>

                            Maximum upload size

                        </strong>

                        <br/>

                        20 MB per file

                    </div>

                </div>

                <div className={styles.section}>

                    <h3>ℹ About</h3>

                    <div className={styles.card}>

                        Version 1.0.0

                        <br/>

                        Local AI

                        <br/>

                        Ollama

                    </div>

                </div>

            </div>

        </div>

    );

}