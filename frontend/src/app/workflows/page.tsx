'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileJson, Clock, Rocket, Trash2, Edit, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Workflow {
    id: string;
    name: string;
    description: string;
    workspace: string;
    deployed: boolean;
    method: string;
    path: string;
    created_at: string;
    updated_at: string;
}

export default function WorkflowsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWorkflows();
    }, []);

    const loadWorkflows = async () => {
        try {
            const { data, error } = await supabase
                .from('workflows')
                .select('*')
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
                .eq('id', id);

            if (error) throw error;

            toast({
                title: 'Workflow deleted',
                description: 'The workflow has been removed',
                variant: 'success',
            });

            loadWorkflows();
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
            const { data: workflowData } = await supabase
                .from('workflows')
                .select('definition')
                .eq('id', workflow.id)
                .single();

            const { error } = await supabase
                .from('workflows')
                .insert({
                    name: `${workflow.name} (Copy)`,
                    description: workflow.description,
                    workspace: workflow.workspace,
                    method: workflow.method,
                    path: `${workflow.path}-copy`,
                    definition: workflowData?.definition,
                });

            if (error) throw error;

            toast({
                title: 'Workflow duplicated',
                description: 'A copy has been created',
                variant: 'success',
            });

            loadWorkflows();
        } catch (error: any) {
            toast({
                title: 'Error duplicating workflow',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
            {/* Header */}
            <div className="border-b border-indigo-100/50 bg-white/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                My Workflows
                            </h1>
                            <p className="text-slate-600 mt-1">Manage and organize your API workflows</p>
                        </div>
                        <Button
                            onClick={() => router.push('/editor')}
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                ) : workflows.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-center mx-auto mb-6">
                            <FileJson className="w-10 h-10 text-indigo-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">No workflows yet</h3>
                        <p className="text-slate-500 mb-6">Create your first workflow to get started</p>
                        <Button
                            onClick={() => router.push('/editor')}
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Workflow
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workflows.map((workflow) => (
                            <Card
                                key={workflow.id}
                                className="group hover:shadow-lg transition-all duration-200 border-indigo-100/50 hover:border-indigo-200"
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {workflow.name}
                                                {workflow.deployed && (
                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                        <Rocket className="w-3 h-3 inline mr-1" />
                                                        Deployed
                                                    </span>
                                                )}
                                            </CardTitle>
                                            <CardDescription className="mt-1 line-clamp-2">
                                                {workflow.description || 'No description'}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-mono text-xs">
                                                {workflow.method}
                                            </span>
                                            <span className="font-mono text-xs text-slate-500 truncate">
                                                {workflow.path}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Clock className="w-3 h-3" />
                                            <span>Updated {new Date(workflow.updated_at).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/editor?id=${workflow.id}`)}
                                                className="flex-1 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                                            >
                                                <Edit className="w-3 h-3 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => duplicateWorkflow(workflow)}
                                                className="hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => deleteWorkflow(workflow.id)}
                                                className="hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
