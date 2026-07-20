'use client';

import { useState, useEffect } from 'react';
import { Copy, ExternalLink, Wifi } from 'lucide-react';

const CONTROL_SERVER_URL = 'http://127.0.0.1:4756';

interface TunnelStatus {
    active: boolean;
    url?: string;
    port?: number;
    startedAt?: string;
    error?: string;
}

export default function TunnelStatus() {
    const [status, setStatus] = useState<TunnelStatus>({ active: false });
    const [copied, setCopied] = useState(false);
    const [isProduction, setIsProduction] = useState(false);

    useEffect(() => {
        // Check if we're in production
        const env = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';
        setIsProduction(env === 'production');

        // Only check tunnel status in development
        if (env !== 'production') {
            checkStatus();
            const interval = setInterval(checkStatus, 10000);
            return () => clearInterval(interval);
        }
    }, []);

    const checkStatus = async () => {
        try {
            // The tunnel agent runs a local-only control server on the user's
            // own machine (see tunnel-agent/control-server.js), never a MockFlow server.
            const response = await fetch(`${CONTROL_SERVER_URL}/status`, { signal: AbortSignal.timeout(2000) });
            if (response.ok) {
                const data = await response.json();
                setStatus(data);
            } else {
                setStatus({ active: false });
            }
        } catch {
            // Tunnel agent not running or status not available
            setStatus({ active: false });
        }
    };

    const copyToClipboard = async () => {
        if (status.url) {
            await navigator.clipboard.writeText(status.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Don't render in production or if tunnel is not active
    if (isProduction || !status.active || !status.url) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl p-3 min-w-[280px]">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="relative">
                        <Wifi className="w-4 h-4 text-green-400" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                    <span className="text-xs font-semibold text-white/90">Development Tunnel</span>
                </div>

                {/* URL Display */}
                <div className="bg-black/20 rounded-md p-2 mb-2">
                    <div className="flex items-center gap-2">
                        <code className="text-xs text-blue-300 flex-1 truncate">
                            {status.url}
                        </code>
                        <button
                            onClick={copyToClipboard}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="Copy URL"
                            aria-label="Copy tunnel URL"
                        >
                            <Copy className={`w-3 h-3 ${copied ? 'text-green-400' : 'text-white/70'}`} />
                        </button>
                        <a
                            href={status.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="Open in new tab"
                            aria-label="Open tunnel URL in new tab"
                        >
                            <ExternalLink className="w-3 h-3 text-white/70" />
                        </a>
                    </div>
                </div>

                {/* Info */}
                <div className="flex items-center justify-between text-xs text-white/60">
                    <span>Port: {status.port || 3000}</span>
                    {status.startedAt && (
                        <span className="text-[10px]">
                            {new Date(status.startedAt).toLocaleTimeString()}
                        </span>
                    )}
                </div>

                {copied && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                        Copied!
                    </div>
                )}
            </div>
        </div>
    );
}
