'use client';

import React, { useEffect, useState } from 'react';
import useStore from '@/store/useStore';
import { CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Settings2, Sparkles, Terminal, Copy, Check, Zap } from 'lucide-react';
import type { NodeData } from '@/types/nodes';
import { FAKE_TOKENS } from '@/lib/fakeData';

const NodeConfigPanel = () => {
    const { nodes, setNodes } = useStore();
    const selectedNode = nodes.find((n) => n.selected);
    const [nodeData, setNodeData] = useState<NodeData | null>(null);

    useEffect(() => {
        if (selectedNode) {
            setNodeData(selectedNode.data as NodeData);
        } else {
            setNodeData(null);
        }
    }, [selectedNode]);

    const updateNodeData = (updates: Partial<NodeData>) => {
        if (!selectedNode) return;
        const updatedData = { ...nodeData, ...updates };
        setNodeData(updatedData as NodeData);
        setNodes(nodes.map((n) => n.id === selectedNode.id ? { ...n, data: updatedData } : n));
    };

    if (!selectedNode || !nodeData) {
        return (
            <div className="w-80 bg-zinc-900/80 backdrop-blur-2xl border-l border-white/[0.08] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center mb-5">
                    <Settings2 className="w-7 h-7 text-violet-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">No Selection</h3>
                <p className="text-sm text-zinc-500">Click a node to configure</p>
            </div>
        );
    }

    return (
        <div className="w-80 bg-zinc-900/80 backdrop-blur-2xl border-l border-white/[0.08] flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <div>
                        <h2 className="font-semibold text-sm text-white">Configure</h2>
                        <p className="text-xs text-zinc-500 capitalize">{nodeData.type} Node</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNodes(nodes.filter((n) => n.id !== selectedNode.id))}
                    className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <CardContent className="p-5 space-y-5">
                    <div className="space-y-2">
                        <Label className={labelStyles}>Label</Label>
                        <Input
                            value={nodeData.label}
                            onChange={(e) => updateNodeData({ label: e.target.value })}
                            className={inputStyles}
                            placeholder="Enter node label"
                        />
                    </div>

                    <Separator className="bg-white/[0.08]" />

                    {nodeData.type === 'request' && <RequestConfig data={nodeData} updateData={updateNodeData} />}
                    {nodeData.type === 'validation' && <ValidationConfig data={nodeData} updateData={updateNodeData} />}
                    {nodeData.type === 'transformation' && <TransformationConfig data={nodeData} updateData={updateNodeData} />}
                    {nodeData.type === 'response' && <ResponseConfig data={nodeData} updateData={updateNodeData} />}
                    {nodeData.type === 'state' && <StateConfig data={nodeData} updateData={updateNodeData} />}
                    {nodeData.type === 'conditional' && <ConditionalConfig data={nodeData} updateData={updateNodeData} />}
                </CardContent>
            </ScrollArea>
        </div>
    );
};

const inputStyles = "h-10 text-sm bg-zinc-800/50 border-zinc-700/50 text-white placeholder-zinc-500 focus:border-violet-500/50 focus:ring-violet-500/20 rounded-lg";
const textareaStyles = "bg-zinc-800/50 border-zinc-700/50 text-white placeholder-zinc-500 focus:border-violet-500/50 focus:ring-violet-500/20 font-mono text-xs rounded-lg";
const labelStyles = "text-xs text-zinc-400 font-medium";

const RequestConfig = ({ data, updateData }: any) => {
    const method = data.method || 'GET';
    const noBody = method === 'GET' || method === 'DELETE';
    const isLocalhost = /^(https?:\/\/)?(localhost|127\.0\.0\.1)/i.test(data.path || '');
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className={labelStyles}>Method</Label>
                    <span className="text-[10px] text-zinc-500">HTTP verb</span>
                </div>
                <Select value={method} onValueChange={(v) => updateData({ method: v })}>
                    <SelectTrigger className={inputStyles}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                        {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <SelectItem key={m} value={m} className="text-white hover:bg-zinc-700">{m}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className={labelStyles}>URL / Path</Label>
                    <span className="text-[10px] text-zinc-500">Full URL or /path</span>
                </div>
                <Input
                    value={data.path || ''}
                    onChange={(e) => updateData({ path: e.target.value })}
                    placeholder="https://api.example.com/users or /api/users"
                    className={`${inputStyles} font-mono`}
                />
                {isLocalhost ? (
                    <LocalhostHint />
                ) : (
                    <div className="bg-indigo-500/20 border border-indigo-400/30 rounded-lg p-3">
                        <p className="text-xs text-indigo-200">
                            <span className="font-bold text-indigo-300">TIP:</span> Enter full URL like <code className="bg-indigo-500/30 px-1 rounded">https://api.example.com/users</code> to call real APIs
                        </p>
                    </div>
                )}
            </div>
            {!noBody && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className={labelStyles}>Body Schema</Label>
                        <span className="text-[10px] text-zinc-500">JSON format</span>
                    </div>
                    <Textarea
                        value={data.bodySchema || ''}
                        onChange={(e) => updateData({ bodySchema: e.target.value })}
                        className={textareaStyles}
                        rows={5}
                        placeholder='{"name": "John", "email": "john@example.com"}'
                    />
                </div>
            )}
        </div>
    );
};

/**
 * Shown when a Request node's URL points at localhost/127.0.0.1. The cloud
 * can't reach it directly, so this points the user at the "Local APIs"
 * dialog in the toolbar (see WorkspaceTunnelSettings), which is the single
 * source of truth for setup steps.
 */
const LocalhostHint = () => {
    return (
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-3 space-y-1.5">
            <p className="text-xs text-amber-200">
                <span className="font-bold text-amber-300">Heads up:</span> this URL points at your own computer, and MockFlow&apos;s
                cloud can&apos;t reach it directly.
            </p>
            <p className="text-xs text-amber-200/80 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Click <span className="font-medium text-amber-100">Local APIs</span> in the toolbar to connect it. No signup needed.
            </p>
        </div>
    );
};

const CONDITION_HELP: Record<string, string> = {
    required: 'Fails if the field is missing, null, or empty',
    type: 'Fails unless typeof field matches Value exactly (e.g. "string", "number", "boolean")',
    regex: 'Fails unless the field matches the pattern in Value (e.g. ^[^@]+@[^@]+$)',
    min: 'Fails if the field is a number less than Value',
    max: 'Fails if the field is a number greater than Value',
};

const ValidationConfig = ({ data, updateData }: any) => {
    const rules = data.rules || [];
    const addRule = () => updateData({ rules: [...rules, { field: '', condition: 'required', value: '', errorMessage: '' }] });
    const removeRule = (idx: number) => updateData({ rules: rules.filter((_: any, i: number) => i !== idx) });
    const updateRule = (idx: number, upd: any) => updateData({ rules: rules.map((r: any, i: number) => i === idx ? { ...r, ...upd } : r) });
    const needsValue = (condition: string) => ['type', 'regex', 'min', 'max'].includes(condition);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className={labelStyles}>Validation Rules</Label>
                <Button variant="ghost" size="sm" onClick={addRule} className="h-7 px-2 text-xs text-violet-400 hover:bg-violet-500/10">
                    <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
            </div>
            <p className="text-xs text-zinc-500">
                Checked in order against the request body. The first failing rule returns a 400 with its error message.
            </p>
            {rules.length === 0 && (
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 text-center">
                    <p className="text-xs text-zinc-500">No rules yet. Add one to validate data.</p>
                </div>
            )}
            {rules.map((rule: any, idx: number) => (
                <div key={idx} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-violet-400">Rule {idx + 1}</span>
                        <Button variant="ghost" size="icon" onClick={() => removeRule(idx)} className="h-6 w-6 text-zinc-500 hover:text-red-400 hover:bg-red-500/10">
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Field name in request body</span>
                        <Input value={rule.field} onChange={(e) => updateRule(idx, { field: e.target.value })} placeholder="e.g. email" className={inputStyles} />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Condition</span>
                        <Select value={rule.condition} onValueChange={(v) => updateRule(idx, { condition: v })}>
                            <SelectTrigger className={inputStyles}><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                                {['required', 'type', 'regex', 'min', 'max'].map(c => <SelectItem key={c} value={c} className="text-white hover:bg-zinc-700">{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <p className="text-[11px] text-zinc-500">{CONDITION_HELP[rule.condition] || ''}</p>
                    </div>
                    {needsValue(rule.condition) && (
                        <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Value</span>
                            <Input
                                value={rule.value || ''}
                                onChange={(e) => updateRule(idx, { value: e.target.value })}
                                placeholder={rule.condition === 'regex' ? '^[^@]+@[^@]+\\.[^@]+$' : rule.condition === 'type' ? 'string' : '0'}
                                className={`${inputStyles} font-mono`}
                            />
                        </div>
                    )}
                    <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Error message (optional)</span>
                        <Input
                            value={rule.errorMessage || ''}
                            onChange={(e) => updateRule(idx, { errorMessage: e.target.value })}
                            placeholder="Shown in the 400 response if this rule fails"
                            className={inputStyles}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

const TransformationConfig = ({ data, updateData }: any) => {
    const transformations = data.transformations || [];
    const addTransform = () => updateData({ transformations: [...transformations, { target: '', source: '', transform: '' }] });
    const removeTransform = (idx: number) => updateData({ transformations: transformations.filter((_: any, i: number) => i !== idx) });
    const updateTransform = (idx: number, upd: any) => updateData({ transformations: transformations.map((t: any, i: number) => i === idx ? { ...t, ...upd } : t) });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className={labelStyles}>Transformations</Label>
                <Button variant="ghost" size="sm" onClick={addTransform} className="h-7 px-2 text-xs text-violet-400 hover:bg-violet-500/10">
                    <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2.5">
                <p className="text-[11px] text-orange-300">
                    Copies a value from <strong>Source</strong> into <strong>Target</strong>, so later nodes
                    (like Response) can read it as <code className="bg-black/20 px-1 rounded">{'{{'}variables.target{'}}'}</code>.
                </p>
            </div>
            {transformations.length === 0 && (
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 text-center">
                    <p className="text-xs text-zinc-500">No transformations. Add one to modify data.</p>
                </div>
            )}
            {transformations.map((t: any, idx: number) => (
                <div key={idx} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-orange-400">Transform {idx + 1}</span>
                        <Button variant="ghost" size="icon" onClick={() => removeTransform(idx)} className="h-6 w-6 text-zinc-500 hover:text-red-400 hover:bg-red-500/10">
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Source: where the value comes from</span>
                        <Input value={t.source} onChange={(e) => updateTransform(idx, { source: e.target.value })} placeholder="request.body.name" className={`${inputStyles} font-mono`} />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Target: the name to store it under</span>
                        <Input value={t.target} onChange={(e) => updateTransform(idx, { target: e.target.value })} placeholder="user.name" className={`${inputStyles} font-mono`} />
                    </div>
                </div>
            ))}
        </div>
    );
};

const ResponseConfig = ({ data, updateData }: any) => {
    const chaos = data.chaos || {};
    const updateChaos = (updates: any) => updateData({ chaos: { ...chaos, ...updates } });

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className={labelStyles}>Status Code</Label>
                <Input value={data.statusCode || 200} onChange={(e) => updateData({ statusCode: parseInt(e.target.value) || 200 })} type="number" className={inputStyles} />
            </div>
            <div className="space-y-2">
                <Label className={labelStyles}>Body Template</Label>
                <Textarea value={data.bodyTemplate || ''} onChange={(e) => updateData({ bodyTemplate: e.target.value })} className={textareaStyles} rows={6} placeholder='{"status": "success", "data": {...}}' />
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 space-y-1">
                    <p className="text-[11px] text-emerald-300">
                        Must be valid JSON. Insert dynamic values with <code className="bg-black/20 px-1 rounded">{'{{'}path{'}}'}</code>:
                    </p>
                    <ul className="text-[11px] text-emerald-300/80 space-y-0.5 pl-3 list-disc">
                        <li><code className="bg-black/20 px-1 rounded">{'{{'}request.body.name{'}}'}</code>: data from the incoming request</li>
                        <li><code className="bg-black/20 px-1 rounded">{'{{'}variables.user{'}}'}</code>: a value set by a Transformation node</li>
                        <li><code className="bg-black/20 px-1 rounded">{'{{'}state.count{'}}'}</code>: a value set by a State node</li>
                        <li><code className="bg-black/20 px-1 rounded">{'{{'}fake.email{'}}'}</code>: realistic random data, a fresh value every call</li>
                    </ul>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className={labelStyles}>Fake data tokens</Label>
                    <span className="text-[10px] text-zinc-500">Click to copy</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {FAKE_TOKENS.map((token) => (
                        <FakeTokenChip key={token} token={token} />
                    ))}
                </div>
            </div>

            <Separator className="bg-white/[0.08]" />

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-fuchsia-400" />
                        <Label className={labelStyles}>Chaos mode</Label>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={!!chaos.enabled}
                        onClick={() => updateChaos({ enabled: !chaos.enabled })}
                        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${chaos.enabled ? 'bg-fuchsia-500' : 'bg-zinc-700'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${chaos.enabled ? 'translate-x-4' : ''}`} />
                    </button>
                </div>
                <p className="text-[11px] text-zinc-500">
                    Randomly slow down or fail this response, to test how your frontend handles a flaky real-world API.
                </p>

                {chaos.enabled && (
                    <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-xl p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Latency min (ms)</span>
                                <Input
                                    type="number"
                                    min={0}
                                    max={5000}
                                    value={chaos.latencyMinMs ?? 0}
                                    onChange={(e) => updateChaos({ latencyMinMs: Math.max(0, Math.min(5000, parseInt(e.target.value) || 0)) })}
                                    className={inputStyles}
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Latency max (ms)</span>
                                <Input
                                    type="number"
                                    min={0}
                                    max={5000}
                                    value={chaos.latencyMaxMs ?? 0}
                                    onChange={(e) => updateChaos({ latencyMaxMs: Math.max(0, Math.min(5000, parseInt(e.target.value) || 0)) })}
                                    className={inputStyles}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Error rate (% of requests)</span>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                value={chaos.errorRate ?? 0}
                                onChange={(e) => updateChaos({ errorRate: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                                className={inputStyles}
                            />
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Error status codes (comma-separated)</span>
                            <Input
                                value={(chaos.errorStatusCodes || [500]).join(', ')}
                                onChange={(e) => updateChaos({
                                    errorStatusCodes: e.target.value
                                        .split(',')
                                        .map((v: string) => parseInt(v.trim()))
                                        .filter((n: number) => !isNaN(n)),
                                })}
                                placeholder="500, 502, 503"
                                className={`${inputStyles} font-mono`}
                            />
                        </div>
                        <p className="text-[10px] text-fuchsia-300/70">
                            Latency is capped at 5s. On a failed roll, the body above is replaced with a simulated error.
                            Your real template is untouched and still used the rest of the time.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const FakeTokenChip = ({ token }: { token: string }) => {
    const [copied, setCopied] = useState(false);
    const value = `{{fake.${token}}}`;

    const copy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <button
            type="button"
            onClick={copy}
            title={`Copy ${value}`}
            className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-md bg-zinc-800/70 border border-zinc-700/60 text-zinc-300 hover:border-violet-500/50 hover:text-white transition-colors"
        >
            {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
            fake.{token}
        </button>
    );
};

const StateConfig = ({ data, updateData }: any) => {
    const operation = data.operation || 'set';
    return (
        <div className="space-y-4">
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2.5">
                <p className="text-[11px] text-cyan-300">
                    State persists <strong>across separate requests</strong> to this workflow (e.g. a POST that saves
                    data, and a later GET that reads it back), unlike Transformation, which only lasts one request.
                </p>
            </div>
            <div className="space-y-2">
                <Label className={labelStyles}>Operation</Label>
                <Select value={operation} onValueChange={(v) => updateData({ operation: v })}>
                    <SelectTrigger className={inputStyles}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                        {['get', 'set'].map(o => <SelectItem key={o} value={o} className="text-white hover:bg-zinc-700">{o}</SelectItem>)}
                    </SelectContent>
                </Select>
                <p className="text-[11px] text-zinc-500">
                    {operation === 'get'
                        ? 'Loads the value under Key into variables.<key> for later nodes to use'
                        : 'Saves Value under Key, replacing whatever was there before'}
                </p>
            </div>
            <div className="space-y-2">
                <Label className={labelStyles}>Key</Label>
                <Input value={data.key || ''} onChange={(e) => updateData({ key: e.target.value })} placeholder="profile" className={`${inputStyles} font-mono`} />
                <p className="text-[11px] text-zinc-500">A short name for this piece of data, e.g. &quot;profile&quot; or &quot;counter&quot;.</p>
            </div>
            {operation === 'set' && (
                <div className="space-y-2">
                    <Label className={labelStyles}>Value</Label>
                    <Input value={data.value || ''} onChange={(e) => updateData({ value: e.target.value })} placeholder="{{request.body}}" className={`${inputStyles} font-mono`} />
                    <p className="text-[11px] text-zinc-500">
                        Supports <code className="bg-black/20 px-1 rounded">{'{{'}path{'}}'}</code> templating, e.g.{' '}
                        <code className="bg-black/20 px-1 rounded">{'{{'}request.body{'}}'}</code> to store the whole request body.
                    </p>
                </div>
            )}
        </div>
    );
};

const ConditionalConfig = ({ data, updateData }: any) => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label className={labelStyles}>Condition</Label>
            <Textarea value={data.condition || ''} onChange={(e) => updateData({ condition: e.target.value })} className={textareaStyles} rows={3} placeholder="request.body.age >= 18" />
            <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-lg p-2.5 space-y-1.5">
                <p className="text-[11px] text-fuchsia-300">
                    A simple expression, evaluated safely (not full JavaScript, so no function calls like{' '}
                    <code className="bg-black/20 px-1 rounded">.includes()</code>).
                </p>
                <p className="text-[11px] text-fuchsia-300/80">
                    Supports: <code className="bg-black/20 px-1 rounded">== != &gt; &lt; &gt;= &lt;= && || !</code> and{' '}
                    <code className="bg-black/20 px-1 rounded">request.</code>, <code className="bg-black/20 px-1 rounded">state.</code>,{' '}
                    <code className="bg-black/20 px-1 rounded">variables.</code> paths.
                </p>
                <p className="text-[11px] text-fuchsia-300/80">
                    e.g. <code className="bg-black/20 px-1 rounded">request.body.age {'>='} 18 && state.approved == true</code>
                </p>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
                <Label className={labelStyles}>True Label</Label>
                <Input value={data.trueLabel || 'Yes'} onChange={(e) => updateData({ trueLabel: e.target.value })} className={inputStyles} />
            </div>
            <div className="space-y-2">
                <Label className={labelStyles}>False Label</Label>
                <Input value={data.falseLabel || 'No'} onChange={(e) => updateData({ falseLabel: e.target.value })} className={inputStyles} />
            </div>
        </div>
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-2.5">
            <p className="text-[11px] text-zinc-400">
                Connect this node&apos;s two outgoing handles to different next steps. The bottom-left handle fires on{' '}
                <span className="text-emerald-400">true</span>, bottom-right on <span className="text-red-400">false</span>.
            </p>
        </div>
    </div>
);

export default NodeConfigPanel;
