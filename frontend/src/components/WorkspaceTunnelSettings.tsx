'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Terminal, ExternalLink, Wifi, WifiOff, CheckCircle2, Copy, Loader2, AlertCircle, ShieldCheck, ChevronDown, ArrowRight } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import useStore from '@/store/useStore';

const CONTROL_SERVER_URL = 'http://127.0.0.1:4756';
const LOCAL_URL_PATTERN = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/i;

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
 * Lets the user connect a local API so a deployed workflow's Request nodes
 * can reach it. Default path needs no account: an SSH tunnel (localhost.run)
 * the user runs themselves and pastes the URL back. The ngrok-based
 * tunnel-agent (persistent, auto-detected, but requires a free account) is
 * offered as an advanced, collapsed alternative.
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
                        <p>{status.active ? 'Local tunnel is connected' : 'Connect a local API, no account needed'}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <ConnectLocalApiDialog status={status} onStatusChange={setStatus} onClose={() => setOpen(false)} />
        </Dialog>
    );
}

function ConnectLocalApiDialog({
    status,
    onStatusChange,
    onClose,
}: {
    status: AgentStatus;
    onStatusChange: (s: AgentStatus) => void;
    onClose: () => void;
}) {
    return (
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Connect a local API</DialogTitle>
                <DialogDescription>
                    MockFlow&apos;s cloud can&apos;t reach <code className="text-xs">localhost</code> on your machine directly.
                    Expose your local API with a quick tunnel, then use the public URL in your Request nodes.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
                <SshTunnelSection />
                <AdvancedNgrokSection status={status} onStatusChange={onStatusChange} />
            </div>

            <DialogFooter>
                <Button variant="ghost" onClick={onClose}>
                    Close
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}

/** Primary, no-signup path: a one-off SSH tunnel the user runs themselves. */
function SshTunnelSection() {
    const { nodes, updateNodeData } = useStore();
    const [port, setPort] = useState('');
    const [copied, setCopied] = useState(false);
    const [pastedUrl, setPastedUrl] = useState('');
    const [targetId, setTargetId] = useState('');
    const [inserted, setInserted] = useState(false);

    const requestNodes = useMemo(
        () => nodes.filter((n) => (n.data as any)?.type === 'request'),
        [nodes]
    );
    const autoSelected = useMemo(
        () => nodes.find((n) => n.selected && (n.data as any)?.type === 'request'),
        [nodes]
    );
    const effectiveTargetId = targetId || autoSelected?.id || (requestNodes.length === 1 ? requestNodes[0].id : '');
    const targetNode = requestNodes.find((n) => n.id === effectiveTargetId);

    const command = `ssh -R 80:localhost:${port || '{port}'} localhost.run`;

    const copyCommand = () => {
        navigator.clipboard.writeText(`ssh -R 80:localhost:${port || '3000'} localhost.run`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const insertIntoNode = () => {
        if (!targetNode || !pastedUrl.trim()) return;
        const currentPath: string = (targetNode.data as any)?.path || '';
        const pastedOrigin = pastedUrl.trim().replace(/\/$/, '');
        const merged = LOCAL_URL_PATTERN.test(currentPath)
            ? currentPath.replace(LOCAL_URL_PATTERN, pastedOrigin)
            : pastedOrigin;
        updateNodeData(targetNode.id, { path: merged });
        setInserted(true);
        setTimeout(() => setInserted(false), 2500);
    };

    return (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-4">
            <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-white">No signup needed</h4>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
                Uses the SSH client already on your computer (built into macOS, Linux, and Windows 10+). No account, no install.
            </p>

            <div className="space-y-2">
                <Label className="text-xs">What port is your local API running on?</Label>
                <Input
                    value={port}
                    onChange={(e) => setPort(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 3001, 5000, 8080 (not MockFlow's own dev server)"
                    className="font-mono text-sm"
                    inputMode="numeric"
                />
            </div>

            <div className="space-y-2">
                <Label className="text-xs">Run this in a terminal</Label>
                <div className="flex items-center gap-2">
                    <pre className="flex-1 bg-muted rounded-md p-3 text-xs font-mono text-foreground overflow-x-auto">{command}</pre>
                    <Button variant="outline" size="icon" onClick={copyCommand} disabled={!port} title="Copy command">
                        {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    It prints a public URL like <code className="text-[11px]">https://abcd1234.localhost.run</code>. This tunnel
                    can&apos;t be auto-detected, so paste the URL below when you have it.
                </p>
            </div>

            <div className="space-y-2 pt-1">
                <Label className="text-xs">Paste the URL it printed</Label>
                <Input
                    value={pastedUrl}
                    onChange={(e) => setPastedUrl(e.target.value)}
                    placeholder="https://abcd1234.localhost.run"
                    className="font-mono text-sm"
                />

                {requestNodes.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Add a Request node to your workflow first, then come back here.</p>
                ) : (
                    <>
                        {!autoSelected && requestNodes.length > 1 && (
                            <Select value={effectiveTargetId} onValueChange={setTargetId}>
                                <SelectTrigger className="text-sm"><SelectValue placeholder="Which Request node?" /></SelectTrigger>
                                <SelectContent>
                                    {requestNodes.map((n) => (
                                        <SelectItem key={n.id} value={n.id}>{(n.data as any)?.label || n.id}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <Button
                            onClick={insertIntoNode}
                            disabled={!pastedUrl.trim() || !targetNode}
                            className="w-full gap-2"
                            variant="outline"
                        >
                            <ArrowRight className="w-3.5 h-3.5" />
                            {targetNode ? `Insert into "${(targetNode.data as any)?.label || 'Request'}"` : 'Select a Request node above'}
                        </Button>
                        {inserted && (
                            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Inserted into &quot;{(targetNode?.data as any)?.label || 'Request'}&quot;
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

/** Secondary, collapsed path: the persistent ngrok tunnel-agent. */
function AdvancedNgrokSection({
    status,
    onStatusChange,
}: {
    status: AgentStatus;
    onStatusChange: (s: AgentStatus) => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-t pt-3">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
                Advanced: want a persistent, auto-detected tunnel instead?
            </button>
            {open && <NgrokFlow status={status} onStatusChange={onStatusChange} />}
        </div>
    );
}

function NgrokFlow({
    status,
    onStatusChange,
}: {
    status: AgentStatus;
    onStatusChange: (s: AgentStatus) => void;
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

            // The agent restarts the tunnel itself as soon as it saves the token;
            // poll briefly so the user gets a real yes/no instead of just hoping.
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
        <div className="mt-3 space-y-3">
            <p className="text-xs text-muted-foreground">
                Runs a small agent on your machine that keeps a tunnel open and lets MockFlow detect it automatically.
                Worth it if you're testing often, but needs a free ngrok account.
            </p>

            {status.active && status.url && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" /> Tunnel connected
                    </div>
                    <div className="flex items-center gap-2">
                        <code className="text-xs flex-1 truncate bg-black/20 border border-emerald-500/20 rounded px-2 py-1.5 text-emerald-200">
                            {status.url}
                        </code>
                        <Button variant="outline" size="sm" onClick={copyUrl}>
                            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                    </div>
                    <p className="text-xs text-emerald-300/70">Paste this into your Request node&apos;s URL field instead of localhost.</p>
                </div>
            )}

            <Step number={1} title="Get a free ngrok token" done={false}>
                <p className="text-sm text-muted-foreground mb-2">Required: ngrok rejects unauthenticated tunnels.</p>
                <a
                    href="https://dashboard.ngrok.com/get-started/your-authtoken"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1 font-medium"
                >
                    Get your token at dashboard.ngrok.com <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </Step>

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
                            <WifiOff className="w-3.5 h-3.5" /> Not detected yet, run the command above
                        </span>
                    )}
                </div>
            </Step>

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
                    <p className="text-xs text-muted-foreground mt-2">Start the agent first (step 2). This talks directly to it on your machine.</p>
                )}

                {validate === 'checking' && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving and connecting…
                    </p>
                )}
                {validate === 'connected' && (
                    <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected. Your tunnel URL is shown above.
                    </p>
                )}
                {validate === 'saved-not-live' && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Token saved and it&apos;s still connecting. Give it a few more seconds, or click Connect again.
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
                    This talks directly to the agent on <code className="text-[11px]">127.0.0.1</code>, your own machine.
                    Your token is written to a local <code className="text-[11px]">.env</code> file and never sent to MockFlow&apos;s servers.
                </p>
            </div>
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
