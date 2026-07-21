'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, Copy, CheckCircle2, ArrowLeft, Rocket } from 'lucide-react';
import { supabase, Workflow } from '@/lib/supabase';
import { deriveEndpointDoc, EndpointDoc } from '@/lib/docs';

export default function SharePage() {
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [trying, setTrying] = useState(false);
    const [tryResult, setTryResult] = useState<string | null>(null);

    // Read ?id= manually (rather than useSearchParams) so this static-export
    // page doesn't need a Suspense boundary — same approach as the editor's
    // ?id= handling in Toolbar.tsx.
    useEffect(() => {
        const id = new URLSearchParams(window.location.search).get('id');
        if (!id) {
            setLoading(false);
            return;
        }
        (async () => {
            const { data } = await supabase.from('workflows').select('*').eq('id', id).single();
            setWorkflow(data || null);
            setLoading(false);
        })();
    }, []);

    const doc: EndpointDoc | null = workflow ? deriveEndpointDoc(workflow.nodes || []) : null;
    const endpointUrl = workflow && doc ? `${typeof window !== 'undefined' ? window.location.origin : ''}/api/${workflow.workspace}${doc.path}` : '';

    const copyUrl = () => {
        navigator.clipboard.writeText(endpointUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const curlSnippet = () => {
        if (!doc) return '';
        if (!doc.hasBody) return `curl -X ${doc.method} "${endpointUrl}"`;
        const body: Record<string, any> = {};
        for (const field of doc.requiredBodyFields) body[field] = '...';
        return `curl -X ${doc.method} "${endpointUrl}" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(body)}'`;
    };

    const tryIt = async () => {
        setTrying(true);
        setTryResult(null);
        try {
            const body: Record<string, any> = {};
            if (doc) for (const field of doc.requiredBodyFields) body[field] = 'example';
            const response = await fetch(endpointUrl, {
                method: doc?.method || 'GET',
                headers: { 'Content-Type': 'application/json' },
                body: doc?.hasBody ? JSON.stringify(body) : undefined,
            });
            const text = await response.text();
            let pretty = text;
            try {
                pretty = JSON.stringify(JSON.parse(text), null, 2);
            } catch { /* keep raw */ }
            setTryResult(`HTTP ${response.status}\n\n${pretty}`);
        } catch (error: any) {
            setTryResult(`Request failed: ${error.message}`);
        } finally {
            setTrying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400" />
            </div>
        );
    }

    if (!workflow || !doc || !workflow.deployed) {
        return (
            <div className="min-h-screen bg-[#0b0b0d] text-white flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                        <Zap className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-lg font-semibold mb-2">Not available</h1>
                    <p className="text-white/40 text-sm mb-6">
                        This mock either doesn&apos;t exist or hasn&apos;t been deployed. Share links only work for deployed endpoints.
                    </p>
                    <Link href="/">
                        <Button className="bg-indigo-500 hover:bg-indigo-400 text-[#0b0b0d] border-0">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go to MockFlow
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0b0d] text-white">
            <div className="hairline-b border-b bg-[#0b0b0d]/90 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-[#0b0b0d]" />
                        </div>
                        <span className="font-semibold text-sm tracking-tight">MockFlow</span>
                    </Link>
                    <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                        <Rocket className="w-3 h-3" />
                        Live mock API
                    </span>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{workflow.name}</h1>
                    {workflow.description && <p className="text-white/50 mt-2 text-sm leading-relaxed">{workflow.description}</p>}
                </div>

                <div className="surface-card rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 font-bold text-xs border border-blue-500/20">
                            {doc.method}
                        </span>
                        <code className="text-sm text-white/70 font-mono truncate">{doc.path}</code>
                    </div>

                    <div className="flex gap-2">
                        <input readOnly value={endpointUrl} className="flex-1 min-w-0 bg-black/20 border border-white/10 rounded-md px-3 py-2 text-xs font-mono text-white/60" />
                        <Button variant="outline" size="icon" onClick={copyUrl}>
                            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>

                    {(doc.pathParams.length > 0 || doc.queryParams.length > 0) && (
                        <div className="space-y-2 pt-2 hairline-t border-t">
                            {doc.pathParams.length > 0 && (
                                <div className="text-xs">
                                    <span className="text-white/35 uppercase tracking-wide font-semibold">Path params: </span>
                                    <span className="font-mono text-white/60">{doc.pathParams.map(p => p.key).join(', ')}</span>
                                </div>
                            )}
                            {doc.queryParams.length > 0 && (
                                <div className="text-xs">
                                    <span className="text-white/35 uppercase tracking-wide font-semibold">Query params: </span>
                                    <span className="font-mono text-white/60">
                                        {doc.queryParams.map(p => `${p.key}${p.required ? '' : '?'}`).join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {doc.requiredBodyFields.length > 0 && (
                        <div className="text-xs pt-2 hairline-t border-t">
                            <span className="text-white/35 uppercase tracking-wide font-semibold">Required body fields: </span>
                            <span className="font-mono text-white/60">{doc.requiredBodyFields.join(', ')}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <h2 className="text-xs uppercase tracking-wide text-white/35 font-semibold">Try it</h2>
                    <pre className="bg-zinc-950 border border-white/10 text-zinc-100 p-3 rounded-md text-xs overflow-x-auto">{curlSnippet()}</pre>
                    <Button onClick={tryIt} disabled={trying} className="bg-emerald-500 hover:bg-emerald-400 text-[#0b0b0d] border-0">
                        {trying ? 'Calling endpoint...' : 'Try it now'}
                    </Button>
                    {tryResult && (
                        <pre className="bg-black/20 border border-white/10 p-3 rounded-md text-xs overflow-auto max-h-[240px] whitespace-pre-wrap mt-2">{tryResult}</pre>
                    )}
                </div>

                <div className="space-y-2">
                    <h2 className="text-xs uppercase tracking-wide text-white/35 font-semibold">Example response ({doc.responseStatusCode})</h2>
                    <pre className="bg-black/20 border border-white/10 p-3 rounded-md text-xs overflow-auto whitespace-pre-wrap">
                        {typeof doc.responseExample === 'string' ? doc.responseExample : JSON.stringify(doc.responseExample, null, 2)}
                    </pre>
                </div>

                <p className="text-center text-xs text-white/25 pt-6">
                    Built with <Link href="/" className="text-indigo-400 hover:text-indigo-300">MockFlow</Link> — visual mock API builder.
                </p>
            </div>
        </div>
    );
}
