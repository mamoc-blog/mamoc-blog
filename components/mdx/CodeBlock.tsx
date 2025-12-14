import React from 'react';

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
    children?: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, ...props }) => {
    const [copied, setCopied] = React.useState(false);
    const preRef = React.useRef<HTMLPreElement>(null);

    const handleCopy = () => {
        if (preRef.current) {
            const text = preRef.current.innerText;
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="mac-window">
            <div className="mac-window-header">
                <div className="mac-window-dots">
                    <div className="mac-dot red"></div>
                    <div className="mac-dot yellow"></div>
                    <div className="mac-dot green"></div>
                </div>
                <button
                    onClick={handleCopy}
                    className="copy-button"
                    aria-label="Copy code"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <div className="mac-window-content">
                <pre ref={preRef} {...props}>
                    {children}
                </pre>
            </div>
            <style jsx>{`
                .copy-button {
                    background: transparent;
                    border: none;
                    color: inherit;
                    opacity: 0.6;
                    cursor: pointer;
                    font-size: 0.8rem;
                    margin-left: auto;
                    padding: 0 8px;
                    transition: opacity 0.2s;
                }
                .copy-button:hover {
                    opacity: 1;
                }
                .mac-window-header {
                    display: flex;
                    align-items: center;
                }
            `}</style>
        </div>
    );
};

export default CodeBlock;
