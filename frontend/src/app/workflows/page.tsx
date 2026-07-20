'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileJson, Clock, Rocket, Trash2, Edit, Copy, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getOrCreateWorkspace, shortLabel } from '@/lib/workspace';
import { useToast } from '@/hooks/use-toast';

interface Workflow {
    id: string;
    name: string;
    description: string;
    workspace: string;
    deployed: boolean;
    nodes: any[];
    edges: any[];
    created_at: string;
    updated_at: string;
}

/** Derive the primary endpoint (method + path) from the workflow's Request node */
function getEndpoint(workflow: Workflow): { method: string; path: string } {
    const requestNode = (workflow.nodes || []).find(
        (n: any) => (n.data?.type || n.type) === 'request'
    );
    return {
        method: requestNode?.data?.method || 'GET',
        path: requestNode?.data?.path || '/',
    };
}

export default function WorkflowsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [workspace, setWorkspace] = useState<string | null>(null);

    useEffect(() => {
        const ws = getOrCreateWorkspace();
        setWorkspace(ws);
        loadWorkflows(ws);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadWorkflows = async (ws: string) => {
        try {
            // Workspaces are unauthenticated namespaces — always scope queries
            const { data, error } = await supabase
                .from('workflows')
                .select('*')
                .eq('workspace', ws)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setWorkflows(data || []);
        } catch (error: any) {
            toast({
                title: 'Error loading workflows',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const deleteWorkflow = async (id: string) => {
        if (!confirm('Are you sure you want to delete this workflow?')) return;

        try {
            const { error } = await supabase
                .from('workflows')
                .delete()
                .eq('id', id)
                .eq('workspace', workspace!);

            if (error) throw error;

            toast({
                title: 'Workflow deleted',
                description: 'The workflow has been removed',
            });

            if (workspace) loadWorkflows(workspace);
        } catch (error: any) {
            toast({
                title: 'Error deleting workflow',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const duplicateWorkflow = async (workflow: Workflow) => {
        try {
            const { error } = await supabase
                .from('workflows')
                .insert({
                    name: `${workflow.name} (Copy)`,
                    description: workflow.description,
                    workspace: workflow.workspace,
                    nodes: workflow.nodes,
                    edges: workflow.edges,
                    version: '1.0',
                });

            if (error) throw error;

            toast({
                title: 'Workflow duplicated',
                description: 'A copy has been created',
            });

            if (workspace) loadWorkflows(workspace);
        } catch (error: any) {
            toast({
                title: 'Error duplicating workflow',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0b0d] text-white">
            {/* Header */}
            <div className="hairline-b border-b bg-[#0b0b0d]/90 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors mb-3">
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Back to home
                            </Link>
                            <h1 className="text-2xl font-semibold text-white tracking-tight">
                                My Workflows
                            </h1>
                            <p className="text-white/40 mt-1 text-sm">
                                {workspace ? (
                                    <>Workspace: <span className="font-mono text-white/60">{shortLabel(workspace)}...</span></>
                                ) : (
                                    'Manage and organize your API workflows'
                                )}
                            </p>
                        </div>
                        <Button
                            onClick={() => router.push('/editor')}
                            className="bg-violet-500 hover:bg-violet-400 text-[#0b0b0d] border-0"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Workflow
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
                    </div>
                ) : !workspace ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
                            <FileJson className="w-8 h-8 text-violet-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No workspace set</h3>
                        <p className="text-white/40 mb-6 text-sm">Open the editor to set up your workspace first</p>
                        <Button
                            onClick={() => router.push('/editor')}
                            className="bg-violet-500 hover:bg-violet-400 text-[#0b0b0d] border-0"
                        >
                            Open Editor
                        </Button>
                    </div>
                ) : workflows.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
                            <FileJson className="w-8 h-8 text-violet-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No workflows yet</h3>
                        <p className="text-white/40 mb-6 text-sm">Create your first workflow to get started</p>
                        <Button
                            onClick={() => router.push('/editor')}
                            className="bg-violet-500 hover:bg-violet-400 text-[#0b0b0d] border-0"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Workflow
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workflows.map((workflow) => {
                            const endpoint = getEndpoint(workflow);
                            return (
                                <Card
                                    key={workflow.id}
                                    className="group surface-card"
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-base flex items-center gap-2 text-white">
                                                    {workflow.name}
                                                    {workflow.deployed && (
                                                        <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                            <Rocket className="w-3 h-3 inline mr-1" />
                                                            Deployed
                                                        </span>
                                                    )}
                                                </CardTitle>
                                                <CardDescription className="mt-1 line-clamp-2 text-white/40">
                                                    {workflow.description || 'No description'}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-white/50">
                                                <span className="px-2 py-1 rounded surface-raised text-violet-300 font-mono text-xs">
                                                    {endpoint.method}
                                                </span>
                                                <span className="font-mono text-xs text-white/35 truncate">
                                                    {endpoint.path}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-white/35">
                                                <Clock className="w-3 h-3" />
                                                <span>Updated {new Date(workflow.updated_at).toLocaleDateString()}</span>
                                            </div>

                                            <div className="flex items-center gap-2 pt-3 hairline-t border-t">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/editor?id=${workflow.id}`)}
                                                    className="flex-1 border-white/10 bg-transparent hover:bg-violet-500/10 hover:text-violet-300 hover:border-violet-500/30"
                                                >
                                                    <Edit className="w-3 h-3 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => duplicateWorkflow(workflow)}
                                                    className="border-white/10 bg-transparent hover:bg-violet-500/10 hover:text-violet-300 hover:border-violet-500/30"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => deleteWorkflow(workflow.id)}
                                                    className="border-white/10 bg-transparent hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
