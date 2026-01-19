'use client';

import { useState, useEffect } from 'react';
import { Settings, Wifi, WifiOff, ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface TunnelConfig {
    ngrokToken?: string;
    enabled: boolean;
}

export default function WorkspaceTunnelSettings() {
    const [open, setOpen] = useState(false);
    const [config, setConfig] = useState<TunnelConfig>({ enabled: false });
    const [ngrokToken, setNgrokToken] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load tunnel config from localStorage
        const stored = localStorage.getItem('mockflow_tunnel_config');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setConfig(parsed);
                setNgrokToken(parsed.ngrokToken || '');
            } catch (e) {
                console.error('Failed to parse tunnel config:', e);
            }
        }
    }, []);

    const handleSave = () => {
        const newConfig: TunnelConfig = {
            ngrokToken: ngrokToken.trim() || undefined,
            enabled: !!ngrokToken.trim(),
        };

        localStorage.setItem('mockflow_tunnel_config', JSON.stringify(newConfig));
        setConfig(newConfig);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            setOpen(false);
        }, 1500);
    };

    const handleClear = () => {
        setNgrokToken('');
        const newConfig: TunnelConfig = { enabled: false };
        localStorage.setItem('mockflow_tunnel_config', JSON.stringify(newConfig));
        setConfig(newConfig);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                            >
                                {config.enabled ? (
                                    <Wifi className="w-4 h-4 text-green-500" />
                                ) : (
                                    <WifiOff className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-xs">
                                    {config.enabled ? 'Tunnel Active' : 'Tunnel'}
                                </span>
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Configure tunnel for local API testing</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Local API Tunnel Configuration</DialogTitle>
                    <DialogDescription>
                        Connect your local APIs (localhost) to MockFlow for testing
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Info Box */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex gap-3">
                            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="space-y-2 text-sm">
                                <p className="text-blue-100">
                                    <strong>Why do I need this?</strong>
                                </p>
                                <p className="text-blue-200/80">
                                    When testing workflows with local APIs (e.g., <code className="bg-black/20 px-1 rounded">http://localhost:3001</code>),
                                    MockFlow needs a tunnel to reach your machine. This uses ngrok to create a secure connection.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ngrok Token Input */}
                    <div className="space-y-2">
                        <Label htmlFor="ngrok-token">
                            ngrok Auth Token (Optional)
                        </Label>
                        <Input
                            id="ngrok-token"
                            type="password"
                            placeholder="Enter your ngrok auth token..."
                            value={ngrokToken}
                            onChange={(e) => setNgrokToken(e.target.value)}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            Get your free token from{' '}
                            <a
                                href="https://dashboard.ngrok.com/get-started/your-authtoken"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline inline-flex items-center gap-1"
                            >
                                ngrok.com/dashboard
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </p>
                    </div>

                    {/* How it Works */}
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <h4 className="text-sm font-semibold mb-2">How it works:</h4>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                            <li>Sign up for a free ngrok account</li>
                            <li>Copy your auth token from the dashboard</li>
                            <li>Paste it here and save</li>
                            <li>MockFlow will automatically tunnel to your local APIs</li>
                        </ol>
                    </div>

                    {/* Security Note */}
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                        <p className="text-xs text-yellow-200/80">
                            <strong>🔒 Security:</strong> Your token is stored locally in your browser and never sent to MockFlow servers.
                            It's only used to create temporary tunnels for your requests.
                        </p>
                    </div>

                    {/* Status */}
                    {config.enabled && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                                <Wifi className="w-4 h-4 text-green-400" />
                                <span className="text-sm text-green-200">
                                    Tunnel configuration active
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    {config.enabled && (
                        <Button
                            variant="outline"
                            onClick={handleClear}
                            className="mr-auto"
                        >
                            Clear Token
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saved}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    >
                        {saved ? '✓ Saved!' : 'Save Configuration'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
