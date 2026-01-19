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
import { Plus, Trash2, Settings2, Sparkles } from 'lucide-react';
import type { NodeData } from '@/types/nodes';

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
                <div className="bg-indigo-500/20 border border-indigo-400/30 rounded-lg p-3">
                    <p className="text-xs text-indigo-200">
                        <span className="font-bold text-indigo-300">TIP:</span> Enter full URL like <code className="bg-indigo-500/30 px-1 rounded">https://api.example.com/users</code> to call real APIs
                    </p>
                </div>
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

const ValidationConfig = ({ data, updateData }: any) => {
    const rules = data.rules || [];
    const addRule = () => updateData({ rules: [...rules, { field: '', condition: 'required', value: '', errorMessage: '' }] });
    const removeRule = (idx: number) => updateData({ rules: rules.filter((_: any, i: number) => i !== idx) });
    const updateRule = (idx: number, upd: any) => updateData({ rules: rules.map((r: any, i: number) => i === idx ? { ...r, ...upd } : r) });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className={labelStyles}>Validation Rules</Label>
                <Button variant="ghost" size="sm" onClick={addRule} className="h-7 px-2 text-xs text-violet-400 hover:bg-violet-500/10">
                    <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
            </div>
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
                    <Input value={rule.field} onChange={(e) => updateRule(idx, { field: e.target.value })} placeholder="Field name" className={inputStyles} />
                    <Select value={rule.condition} onValueChange={(v) => updateRule(idx, { condition: v })}>
                        <SelectTrigger className={inputStyles}><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                            {['required', 'minLength', 'maxLength', 'pattern', 'email', 'custom'].map(c => <SelectItem key={c} value={c} className="text-white hover:bg-zinc-700">{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
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
                    <Input value={t.target} onChange={(e) => updateTransform(idx, { target: e.target.value })} placeholder="Target field" className={inputStyles} />
                    <Input value={t.source} onChange={(e) => updateTransform(idx, { source: e.target.value })} placeholder="Source field" className={inputStyles} />
                </div>
            ))}
        </div>
    );
};

const ResponseConfig = ({ data, updateData }: any) => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label className={labelStyles}>Status Code</Label>
            <Input value={data.statusCode || 200} onChange={(e) => updateData({ statusCode: parseInt(e.target.value) || 200 })} type="number" className={inputStyles} />
        </div>
        <div className="space-y-2">
            <Label className={labelStyles}>Body Template</Label>
            <Textarea value={data.bodyTemplate || ''} onChange={(e) => updateData({ bodyTemplate: e.target.value })} className={textareaStyles} rows={6} placeholder='{"status": "success", "data": {...}}' />
        </div>
    </div>
);

const StateConfig = ({ data, updateData }: any) => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label className={labelStyles}>Operation</Label>
            <Select value={data.operation || 'set'} onValueChange={(v) => updateData({ operation: v })}>
                <SelectTrigger className={inputStyles}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                    {['set', 'get', 'delete', 'increment'].map(o => <SelectItem key={o} value={o} className="text-white hover:bg-zinc-700">{o}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label className={labelStyles}>Key</Label>
            <Input value={data.key || ''} onChange={(e) => updateData({ key: e.target.value })} placeholder="state.key" className={`${inputStyles} font-mono`} />
        </div>
        <div className="space-y-2">
            <Label className={labelStyles}>Value</Label>
            <Input value={data.value || ''} onChange={(e) => updateData({ value: e.target.value })} placeholder="value" className={inputStyles} />
        </div>
    </div>
);

const ConditionalConfig = ({ data, updateData }: any) => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label className={labelStyles}>Condition</Label>
            <Textarea value={data.condition || ''} onChange={(e) => updateData({ condition: e.target.value })} className={textareaStyles} rows={3} placeholder="request.body.amount > 100" />
            <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-lg p-2.5">
                <p className="text-[11px] text-fuchsia-300">
                    💡 Use JavaScript expressions like: request.body.age {'>='} 18
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
    </div>
);

export default NodeConfigPanel;
