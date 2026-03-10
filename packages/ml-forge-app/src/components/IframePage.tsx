import { useEffect, useState } from 'react';
import './IframePage.css';

interface IframePageProps {
    src: string;
    title: string;
}

export default function IframePage({ src, title }: Readonly<IframePageProps>) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
    }, [src]);

    return (
        <div className="iframe-wrapper" style={{ height: '100vh', width: '100vw', background: '#000', overflow: 'hidden' }}>
            {loading && (
                <div className="iframe-loader">
                    <div className="iframe-spinner" />
                    <span>Loading {title}…</span>
                </div>
            )}
            <iframe
                src={src}
                title={title}
                className="iframe-full"
                onLoad={() => setLoading(false)}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: loading ? 'none' : 'block'
                }}
            />
        </div>
    );
}
