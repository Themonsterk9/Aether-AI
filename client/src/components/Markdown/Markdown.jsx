import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Memoized Markdown renderer.
 * Only re-renders when `children` (the message content string) changes.
 */
function Markdown({ children }) {

    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {children}
        </ReactMarkdown>
    );

}

export default memo(Markdown);
