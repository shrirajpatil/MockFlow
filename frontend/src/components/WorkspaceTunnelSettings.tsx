'use client';

import { useState, useEffect, useCallback } from 'react';
import { Terminal, ExternalLink, Wifi, WifiOff, CheckCircle2, Copy, Loader2, AlertCircle, ShieldCheck, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const CONTROL_SERVER_URL = 'http://127.0.0.1:4756';

interface AgentStatus {
    reachable: boolean;
    active: boolean;
    url?: string;
    error?: string;
}

type ValidateState = 'idle' | 'checking' | 'connected' | 'saved-not-live' | 'unreachable';

async function fetchStatus(): Promise<AgentStatus> {
    try {
        const res = await fetch(`${CONTROL_SERVER_URL}/status`, { signal: AbortSignal.timeout(2000) });
        if (!res.ok) throw new Error();
        const data = await res.json();
        return { reachable: true, active: !!data.active, url: data.url, error: data.error };
    } catch {
        return { reachable: false, active: false };
    }
}

/**
 * Lets the user connect a local tunnel so MockFlow's cloud proxy can reach
 * APIs on their machine. The ngrok token is sent directly to the tunnel-agent
 * CLI running locally (127.0.0.1:4756 — see tunnel-agent/control-server.js)
 * and written to a local .env file. It never touches MockFlow's servers.
 */
export default function WorkspaceTunnelSettings() {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<AgentStatus>({ reachable: false, active: false });

    // Poll lightly whenever the dialog (or its trigger) is mounted, so the
    // toolbar pill reflects reality without the user opening anything.
    useEffect(() => {
        fetchStatus().then(setStatus);
        const interval = setInterval(() => fetchStatus().then(setStatus), 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                {status.active ? (
                                    <Wifi className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <Terminal className="w-4 h-4" />
                                )}
                                <span className="text-xs">{status.active ? 'Tunnel Live' : 'Local APIs'}</span>
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{status.active ? 'Local tunnel is connected' : 'Connect a local API tunnel'}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <ConnectTunnelDialog status={status} onStatusChange={setStatus} onClose={() => setOpen(false)} />
        </Dialog>
    );
}

function ConnectTunnelDialog({
    status,
    onStatusChange,
    onClose,
}: {
    status: AgentStatus;
    onStatusChange: (s: AgentStatus) => void;
    onClose: () => void;
}) {
    const [token, setToken] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [validate, setValidate] = useState<ValidateState>('idle');
    const [copied, setCopied] = useState(false);

    const refreshStatus = useCallback(async () => {
        const s = await fetchStatus();
        onStatusChange(s);
        return s;
    }, [onStatusChange]);

    // Re-check when the dialog opens
    useEffect(() => {
        refreshStatus();
    }, [refreshStatus]);

    const handleSaveAndValidate = async () => {
        if (!token.trim()) return;
        setSaving(true);
        setSaveError(null);
        setValidate('checking');

        try {
            const res = await fetch(`${CONTROL_SERVER_URL}/configure`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ngrokToken: token.trim() }),
                signal: AbortSignal.timeout(3000),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || 'Agent rejected the token');
            }
            setToken('');

            // The agent needs a restart to pick up a fresh token; poll briefly
            // for the tunnel to come alive so the user gets a real yes/no.
            let lastStatus: AgentStatus = { reachable: true, active: false };
            for (let i = 0; i < 8; i++) {
                await new Promise((r) => setTimeout(r, 1000));
                lastStatus = await refreshStatus();
                if (lastStatus.active) break;
            }
            setValidate(lastStatus.active ? 'connected' : 'saved-not-live');
        } catch (err: any) {
            setSaveError(err.message || 'Could not reach the tunnel agent');
            setValidate('unreachable');
        } finally {
            setSaving(false);
        }
    };

    const copyUrl = () => {
        if (!status.url) return;
        navigator.clipboard.writeText(status.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
                <DialogTitle>Connect a local tunnel</DialogTitle>
                <DialogDescription>
                    MockFlow&apos;s cloud proxy can&apos;t reach <code className="text-xs">localhost</code> on your machine.
                    Expose your local API with a tunnel, then use the public URL in your Request nodes.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
                {/* Already connected — show the URL front and center */}
                {status.active && status.url && (
                    <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Tunnel connected
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="text-xs flex-1 truncate bg-white border border-emerald-200 rounded px-2 py-1.5 text-emerald-900">
                                {status.url}
                            </code>
                            <Button variant="outline" size="sm" onClick={copyUrl}>
                                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </Button>
                        </div>
                        <p className="text-xs text-emerald-700/80">Paste this into your Request node&apos;s URL field instead of localhost.</p>
                    </div>
                )}

                {/* Step 1 */}
                <Step number={1} title="Get a free ngrok token" done={false}>
                    <p className="text-sm text-muted-foreground mb-2">Required — ngrok rejects unauthenticated tunnels.</p>
                    <a
                        href="https://dashboard.ngrok.com/get-started/your-authtoken"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1 font-medium"
                    >
                        Get your token at dashboard.ngrok.com <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <NoSignupFallback />
                </Step>

                {/* Step 2 */}
                <Step number={2} title="Run the tunnel agent" done={status.reachable}>
                    <pre className="bg-muted rounded-md p-3 text-xs font-mono text-foreground overflow-x-auto">
cd tunnel-agent{'\n'}npm install{'\n'}npm start
                    </pre>
                    <div className="flex items-center gap-1.5 text-xs mt-2">
                        {status.reachable ? (
                            <span className="text-emerald-600 flex items-center gap-1 font-medium">
                                <Wifi className="w-3.5 h-3.5" /> Agent detected on your machine
                            </span>
                        ) : (
                            <span className="text-muted-foreground flex items-center gap-1">
                                <WifiOff className="w-3.5 h-3.5" /> Not detected yet — run the command above
                            </span>
                        )}
                    </div>
                </Step>

                {/* Step 3 */}
                <Step number={3} title="Paste your token" done={status.active}>
                    <div className="flex gap-2">
                        <Input
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste your ngrok token"
                            className="font-mono text-sm"
                            disabled={!status.reachable || saving}
                        />
                        <Button onClick={handleSaveAndValidate} disabled={!status.reachable || !token.trim() || saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect'}
                        </Button>
                    </div>

                    {!status.reachable && (
                        <p className="text-xs text-muted-foreground mt-2">Start the agent first (step 2) — this talks directly to it on your machine.</p>
                    )}

                    {validate === 'checking' && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving and validating the connection…
                        </p>
                    )}
                    {validate === 'connected' && (
                        <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Connected — your tunnel URL is shown above.
                        </p>
                    )}
                    {validate === 'saved-not-live' && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Token saved, but the tunnel isn&apos;t live yet. Restart the agent (Ctrl+C, then <code>npm start</code>) to apply it.
                        </p>
                    )}
                    {validate === 'unreachable' && saveError && (
                        <p className="text-xs text-destructive mt-2 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" /> {saveError}
                        </p>
                    )}
                </Step>

                <div className="rounded-lg border bg-muted/50 p-3 flex gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                        This talks directly to the agent on <code className="text-[11px]">127.0.0.1</code> — your own machine.
                        Your token is written to a local <code className="text-[11px]">.env</code> file and never sent to MockFlow&apos;s servers.
                    </p>
                </div>
            </div>

            <DialogFooter>
                <Button variant="ghost" onClick={onClose}>
                    Close
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}

/**
 * SSH-based tunnels (localhost.run, Pinggy) need no signup and no token —
 * they trade that convenience for no official SDK, so MockFlow can't drive
 * or validate them automatically. Offered as a manual fallback: run the
 * command, paste the URL it prints straight into a Request node.
 */
function NoSignupFallback() {
    const [open, setOpen] = useState(false);
    return (
        <div className="mt-3 border-t pt-3">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
                Don&apos;t want to sign up? Use a no-signup tunnel instead
            </button>
            {open && (
                <div className="mt-3 space-y-3">
                    <p className="text-xs text-muted-foreground">
                        These use SSH instead of ngrok — no account needed. Requires an SSH client
                        (built into macOS, Linux, and Windows 10+). Skip Steps 2–3 below if you use this.
                    </p>
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-foreground">Option A — localhost.run</p>
                        <pre className="bg-muted rounded-md p-2.5 text-xs font-mono overflow-x-auto">ssh -R 80:localhost:3000 localhost.run</pre>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-foreground">Option B — Pinggy</p>
                        <pre className="bg-muted rounded-md p-2.5 text-xs font-mono overflow-x-auto">ssh -p 443 -R0:localhost:3000 a.pinggy.io</pre>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Either command prints a public URL in the terminal — copy it and paste it into your
                        Request node&apos;s URL field instead of localhost. MockFlow can&apos;t auto-detect or
                        validate these tunnels (no SDK), so there&apos;s no status indicator for this path.
                    </p>
                </div>
            )}
        </div>
    );
}

function Step({ number, title, done, children }: { number: number; title: string; done: boolean; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
                <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 ${
                        done ? 'bg-emerald-500 text-white' : 'bg-primary/10 text-primary'
                    }`}
                >
                    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : number}
                </div>
                <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            </div>
            {children}
        </div>
    );
}
