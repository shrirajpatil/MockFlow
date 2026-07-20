'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Play, Download, Upload, Trash2, Undo2, Redo2, FileJson, Keyboard, Rocket, Copy, CheckCircle2, Database, Zap, KeyRound } from 'lucide-react';
import useStore from '@/store/useStore';
import { WorkflowExecutor } from '@/lib/productionExecutor';
import { saveWorkflow, updateWorkflow, deployWorkflow, undeployWorkflow, loadWorkflow } from '@/lib/api';
import { templates } from '@/lib/templates';
import { getOrCreateWorkspace, restoreWorkspace, shortLabel } from '@/lib/workspace';
import { useToast } from '@/hooks/use-toast';
import WorkspaceTunnelSettings from '@/components/WorkspaceTunnelSettings';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';


export default function Toolbar() {
    const { nodes, edges, setNodes, setEdges, undo, redo, canUndo, canRedo } = useStore();
    const { toast } = useToast();
    const [testDialogOpen, setTestDialogOpen] = useState(false);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false);
    const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);
    const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false);
    const [deployDialogOpen, setDeployDialogOpen] = useState(false);
    const [tryItResult, setTryItResult] = useState<string | null>(null);
    const [tryingIt, setTryingIt] = useState(false);
    const [testRequest, setTestRequest] = useState('{\n  "name": "John Doe",\n  "email": "john@example.com"\n}');
    const [testResult, setTestResult] = useState<any>(null);
    const [testLogs, setTestLogs] = useState<string[]>([]);
    const [testing, setTesting] = useState(false);
    const [nodeCount, setNodeCount] = useState(0);
    const [edgeCount, setEdgeCount] = useState(0);

    // Workspace
    const [workspace, setWorkspace] = useState<string>('');
    const [restoreCode, setRestoreCode] = useState('');
    const [restoreError, setRestoreError] = useState<string | null>(null);
    const [showRestore, setShowRestore] = useState(false);
    const [workspaceCopied, setWorkspaceCopied] = useState(false);

    // Workflow metadata
    const [workflowId, setWorkflowId] = useState<string | null>(null);
    const [workflowName, setWorkflowName] = useState('');
    const [workflowDescription, setWorkflowDescription] = useState('');
    const [isDeployed, setIsDeployed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deploying, setDeploying] = useState(false);
    const [copied, setCopied] = useState(false);

    // Workspace ID is generated locally on first visit, never user-typed, so two
    // people can never collide into the same workspace by picking the same name.
    useEffect(() => {
        setWorkspace(getOrCreateWorkspace());
    }, []);

    // Open an existing workflow via /editor?id=... (from the workflows page)
    useEffect(() => {
        const id = new URLSearchParams(window.location.search).get('id');
        if (!id) return;

        (async () => {
            const workflow = await loadWorkflow(id);
            if (!workflow) {
                toast({ title: 'Workflow not found', variant: 'destructive' });
                return;
            }
            setNodes(workflow.nodes || []);
            setEdges(workflow.edges || []);
            setWorkflowId(workflow.id);
            setWorkflowName(workflow.name);
            setWorkflowDescription(workflow.description || '');
            setIsDeployed(!!workflow.deployed);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setNodeCount(nodes.length);
        setEdgeCount(edges.length);
    }, [nodes, edges]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + S: Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSaveToDatabase();
            }
            // Ctrl/Cmd + Z: Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canUndo()) undo();
            }
            // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
            if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
                ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
                e.preventDefault();
                if (canRedo()) redo();
            }
            // Ctrl/Cmd + /: Show shortcuts
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                setShortcutsDialogOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canUndo, canRedo, undo, redo]);

    const handleSaveToFile = () => {
        const workflow = {
            nodes,
            edges,
            version: '1.0',
            createdAt: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mockflow-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSaveToDatabase = async () => {
        if (!workflowName.trim()) {
            setSaveDialogOpen(true);
            return;
        }

        if (!workspace) {
            toast({ title: 'Set a workspace first', description: 'Your workspace namespaces your workflows and API URLs.' });
            setWorkspaceDialogOpen(true);
            return;
        }

        setSaving(true);
        try {
            if (workflowId) {
                // Update existing workflow
                const result = await updateWorkflow({
                    id: workflowId,
                    name: workflowName,
                    description: workflowDescription,
                    nodes,
                    edges,
                    workspace,
                });
                if (result) {
                    toast({ title: 'Workflow updated' });
                    setSaveDialogOpen(false);
                }
            } else {
                // Save new workflow
                const result = await saveWorkflow({
                    name: workflowName,
                    description: workflowDescription,
                    nodes,
                    edges,
                    workspace,
                });
                if (result) {
                    setWorkflowId(result.id);
                    setIsDeployed(result.deployed);
                    toast({ title: 'Workflow saved' });
                    setSaveDialogOpen(false);
                }
            }
        } catch (error: any) {
            toast({ title: 'Failed to save workflow', description: error.message, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeploy = async () => {
        if (!workflowId) {
            toast({ title: 'Save the workflow first', description: 'Deploy publishes the last saved version.' });
            return;
        }

        setDeploying(true);
        try {
            if (isDeployed) {
                const success = await undeployWorkflow(workflowId);
                if (success) {
                    setIsDeployed(false);
                    toast({ title: 'Workflow undeployed', description: 'The endpoint is no longer served.' });
                }
            } else {
                const success = await deployWorkflow(workflowId);
                if (success) {
                    setIsDeployed(true);
                    setTryItResult(null);
                    setDeployDialogOpen(true);
                }
            }
        } catch (error: any) {
            toast({ title: 'Deploy failed', description: error.message, variant: 'destructive' });
        } finally {
            setDeploying(false);
        }
    };

    const handleTryIt = async () => {
        const url = getEndpointUrl();
        if (!url) return;

        const requestNode = nodes.find(n => n.type === 'request');
        const method = (requestNode?.data as any)?.method || 'GET';

        setTryingIt(true);
        setTryItResult(null);
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: method === 'GET' || method === 'DELETE' ? undefined : testRequest,
            });
            const text = await response.text();
            let pretty = text;
            try {
                pretty = JSON.stringify(JSON.parse(text), null, 2);
            } catch { /* keep raw */ }
            setTryItResult(`HTTP ${response.status}\n\n${pretty}`);
        } catch (error: any) {
            setTryItResult(`Request failed: ${error.message}\n\nNote: deployed endpoints are served by Netlify Functions. Run "netlify dev" locally or use your deployed site URL.`);
        } finally {
            setTryingIt(false);
        }
    };

    const handleTest = async () => {
        if (nodes.length === 0) {
            toast({ title: 'Nothing to test', description: 'Add nodes to your workflow first.' });
            return;
        }

        setTestDialogOpen(true);
        setTestResult(null);
        setTestLogs([]);
        setTesting(true);

        try {
            const requestNode = nodes.find(n => n.type === 'request');
            if (!requestNode) {
                setTestResult({ success: false, error: 'No Request node found' });
                return;
            }
            const requestData = requestNode.data as any;

            let body: any = null;
            try {
                body = testRequest.trim() ? JSON.parse(testRequest) : null;
            } catch {
                setTestResult({ success: false, error: 'Request body is not valid JSON' });
                return;
            }

            // Runs the same node semantics as the deployed serving engine
            const executor = new WorkflowExecutor(nodes, edges, {
                request: {
                    method: requestData.method || 'GET',
                    path: requestData.path || '/',
                    headers: {},
                    query: {},
                    body,
                },
            });

            const result = await executor.execute();
            setTestResult(result);
            setTestLogs(result.logs || []);
        } catch (error: any) {
            setTestResult({ success: false, error: error.message });
        } finally {
            setTesting(false);
        }
    };

    const getEndpointUrl = () => {
        const requestNode = nodes.find(n => n.type === 'request');
        if (!requestNode || !workspace) return null;
        const path = requestNode.data.path || '/endpoint';
        return `${window.location.origin}/api/${workspace}${path}`;
    };

    const copyEndpoint = () => {
        const url = getEndpointUrl();
        if (url) {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleExportOpenAPI = () => {
        // TODO: Implement OpenAPI export
        const openAPISpec = {
            openapi: '3.0.0',
            info: {
                title: 'MockFlow API',
                version: '1.0.0',
                description: 'Generated from MockFlow workflow',
            },
            paths: {},
        };

        const blob = new Blob([JSON.stringify(openAPISpec, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mockflow-openapi-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleLoad = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const workflow = JSON.parse(event.target?.result as string);
                        setNodes(workflow.nodes || []);
                        setEdges(workflow.edges || []);
                        toast({ title: 'Workflow loaded from file' });
                    } catch (error) {
                        toast({ title: 'Failed to load workflow', description: 'The file is not valid workflow JSON.', variant: 'destructive' });
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const handleClear = () => {
        if (confirm('Are you sure you want to clear the canvas?')) {
            setNodes([]);
            setEdges([]);
        }
    };

    const handleLoadTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;
        setNodes(template.nodes);
        setEdges(template.edges);
        setWorkflowId(null);
        setWorkflowName(template.name);
        setWorkflowDescription(template.description);
        setIsDeployed(false);
        setTemplatesDialogOpen(false);
        toast({ title: `Template loaded: ${template.name}`, description: 'Test it, then Save and Deploy.' });
    };

    return (
        <>
            <div className="h-14 flex items-center justify-between px-6 bg-zinc-900/95 backdrop-blur-xl border-b border-white/[0.08] z-50 relative sticky top-0">
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-base text-white tracking-tight leading-none">
                                MockFlow <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Studio</span>
                            </h1>
                            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide block mt-0.5">
                                Visual Builder
                            </span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/60 border border-zinc-700/50 text-zinc-300">
                            <span className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${nodeCount > 0 ? 'bg-indigo-400' : 'bg-zinc-600'}`}></span>
                                {nodeCount} Nodes
                            </span>
                            <span className="w-px h-3 bg-zinc-700"></span>
                            <span className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${edgeCount > 0 ? 'bg-violet-400' : 'bg-zinc-600'}`}></span>
                                {edgeCount} Edges
                            </span>
                        </div>

                        {workspace && (
                            <button
                                onClick={() => setWorkspaceDialogOpen(true)}
                                className="px-3 py-1.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-2 hover:bg-violet-500/30 transition-colors font-mono"
                                title="View or restore your workspace"
                            >
                                <Database className="w-3 h-3" /> {shortLabel(workspace)}
                            </button>
                        )}
                    </div>
                </div>

                <TooltipProvider>
                    <div className="flex items-center gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo()} className="text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:text-zinc-600">
                                    <Undo2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo()} className="text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:text-zinc-600">
                                    <Redo2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
                        </Tooltip>

                        <div className="w-px h-6 bg-zinc-700 mx-1" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setTemplatesDialogOpen(true)} className="text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                    <FileJson className="w-4 h-4 mr-2" />
                                    Templates
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Start from a ready-made workflow</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={handleLoad} className="text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Load
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Load workflow from file</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={handleSaveToDatabase} disabled={saving} className="text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:text-zinc-600">
                                    <Database className="w-4 h-4 mr-2" />
                                    {workflowId ? 'Update' : 'Save'}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Save to database (Ctrl+S)</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    onClick={handleDeploy}
                                    disabled={!workflowId || deploying}
                                    className={isDeployed
                                        ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0"
                                        : "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0"
                                    }
                                >
                                    {isDeployed ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Rocket className="w-4 h-4 mr-2" />}
                                    {isDeployed ? 'Deployed' : 'Deploy'}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{isDeployed ? 'Undeploy workflow' : 'Deploy workflow to make it accessible via HTTP'}</TooltipContent>
                        </Tooltip>

                        {isDeployed && getEndpointUrl() && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={copyEndpoint} className="text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                        {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> : <Copy className="w-4 h-4 mr-2" />}
                                        {copied ? 'Copied!' : 'Copy URL'}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{getEndpointUrl()}</TooltipContent>
                            </Tooltip>
                        )}

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={handleSaveToFile} className="text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Export workflow to file</TooltipContent>
                        </Tooltip>

                        <div className="w-px h-6 bg-zinc-700 mx-1" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0" size="sm" onClick={() => setTestDialogOpen(true)}>
                                    <Play className="w-4 h-4 mr-2" />
                                    Test
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Test workflow</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={handleClear} className="text-zinc-300 hover:bg-red-500/20 hover:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Clear canvas</TooltipContent>
                        </Tooltip>

                        <div className="w-px h-6 bg-zinc-700 mx-1" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setShortcutsDialogOpen(true)} className="text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                    <Keyboard className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Keyboard shortcuts (Ctrl+/)</TooltipContent>
                        </Tooltip>

                        <WorkspaceTunnelSettings />
                    </div>
                </TooltipProvider>
            </div>

            <GettingStartedStrip
                buildDone={nodes.some((n) => (n.data as any)?.type === 'request') && nodes.some((n) => (n.data as any)?.type === 'response')}
                testDone={testResult !== null}
                saveDone={workflowId !== null}
                deployDone={isDeployed}
            />

            {/* Workspace Dialog: informational + recovery, never a place to type a new name */}
            <Dialog
                open={workspaceDialogOpen}
                onOpenChange={(open) => {
                    setWorkspaceDialogOpen(open);
                    if (!open) {
                        setShowRestore(false);
                        setRestoreCode('');
                        setRestoreError(null);
                    }
                }}
            >
                <DialogContent className="border-indigo-500/20">
                    <DialogHeader>
                        <DialogTitle className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Your workspace</DialogTitle>
                        <DialogDescription>
                            Namespaces your workflows and API URLs. Generated automatically for this browser, so nobody else can guess it.
                        </DialogDescription>
                    </DialogHeader>

                    {!showRestore ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Workspace ID</Label>
                                <div className="flex gap-2">
                                    <Input value={workspace} readOnly className="font-mono text-xs border-indigo-500/20 bg-transparent" />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            navigator.clipboard.writeText(workspace);
                                            setWorkspaceCopied(true);
                                            setTimeout(() => setWorkspaceCopied(false), 2000);
                                        }}
                                    >
                                        {workspaceCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-violet-300">
                                    Your endpoints look like: <code className="bg-violet-500/10 px-1 rounded">/api/{shortLabel(workspace)}.../...</code>
                                </p>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                <p className="text-xs text-amber-300">
                                    <span className="font-bold">Keep this private.</span> Anyone with this ID can see and edit everything in this workspace. Treat it like a password, not a username.
                                </p>
                            </div>

                            <Button variant="outline" className="w-full gap-2" onClick={() => setShowRestore(true)}>
                                <KeyRound className="w-4 h-4" />
                                Restore a workspace from another device
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Paste your workspace ID</Label>
                                <Input
                                    value={restoreCode}
                                    onChange={(e) => {
                                        setRestoreCode(e.target.value);
                                        setRestoreError(null);
                                    }}
                                    placeholder="e.g. 3f2a9c1e-4b7d-4e2a-9c1e-4b7d4e2a9c1e"
                                    autoFocus
                                    className="font-mono text-xs border-indigo-500/20 bg-transparent"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Copy it from the Workspace panel on your other device.
                                </p>
                                {restoreError && <p className="text-xs text-destructive">{restoreError}</p>}
                            </div>

                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <p className="text-xs text-red-300">
                                    This replaces your current workspace ({shortLabel(workspace)}...) in this browser. If you haven't saved its ID elsewhere, you'll lose access to its workflows.
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="ghost" className="flex-1" onClick={() => setShowRestore(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
                                    onClick={() => {
                                        const result = restoreWorkspace(restoreCode);
                                        if (!result.ok) {
                                            setRestoreError(result.error || 'Invalid code');
                                            return;
                                        }
                                        setWorkspace(getOrCreateWorkspace());
                                        setShowRestore(false);
                                        setWorkspaceDialogOpen(false);
                                        toast({ title: 'Workspace restored' });
                                    }}
                                >
                                    Restore
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Save Workflow Dialog */}
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogContent className="border-indigo-100">
                    <DialogHeader>
                        <DialogTitle>Save Workflow</DialogTitle>
                        <DialogDescription>
                            Enter a name and description for your workflow
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Workflow Name *</Label>
                            <Input
                                value={workflowName}
                                onChange={(e) => setWorkflowName(e.target.value)}
                                placeholder="My API Workflow"
                                className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description (optional)</Label>
                            <Textarea
                                value={workflowDescription}
                                onChange={(e) => setWorkflowDescription(e.target.value)}
                                placeholder="Describe what this workflow does..."
                                rows={3}
                                className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                            />
                        </div>

                        <Button
                            onClick={handleSaveToDatabase}
                            disabled={!workflowName.trim() || saving}
                            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
                        >
                            {saving ? 'Saving...' : 'Save Workflow'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Test Dialog */}
            <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] border-indigo-500/20">
                    <DialogHeader>
                        <DialogTitle>Test Workflow</DialogTitle>
                        <DialogDescription>
                            Test your workflow with a sample request
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Request Body (JSON)</Label>
                            <Textarea
                                value={testRequest}
                                onChange={(e) => setTestRequest(e.target.value)}
                                className="font-mono text-xs border-indigo-500/20 bg-transparent"
                                rows={8}
                            />
                        </div>

                        <Button onClick={handleTest} disabled={testing} className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600">
                            {testing ? 'Testing...' : 'Run Test'}
                        </Button>

                        {testResult && (
                            <div className="space-y-2 min-w-0">
                                <Label>Result</Label>
                                <ScrollArea className="h-[300px] w-full border border-indigo-500/20 rounded-md p-4">
                                    <div className="space-y-2 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">Status:</span>
                                            <span className={testResult.success ? 'text-emerald-400' : 'text-red-400'}>
                                                {testResult.success ? 'Success' : 'Failed'}
                                            </span>
                                        </div>

                                        {testResult.statusCode && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">Status Code:</span>
                                                <span>{testResult.statusCode}</span>
                                            </div>
                                        )}

                                        {testResult.body && (
                                            <div className="space-y-1 min-w-0">
                                                <span className="font-semibold">Response Body:</span>
                                                <pre className="bg-black/20 p-2 rounded text-xs whitespace-pre-wrap break-words min-w-0">
                                                    {JSON.stringify(testResult.body, null, 2)}
                                                </pre>
                                            </div>
                                        )}

                                        {testResult.error && (
                                            <div className="space-y-1 min-w-0">
                                                <span className="font-semibold text-red-400">Error:</span>
                                                <pre className="bg-red-500/10 p-2 rounded text-xs text-red-300 whitespace-pre-wrap break-words min-w-0">
                                                    {testResult.error}
                                                </pre>
                                            </div>
                                        )}

                                        {testResult.logs && testResult.logs.length > 0 && (
                                            <div className="space-y-1 min-w-0">
                                                <span className="font-semibold">Execution Logs:</span>
                                                <pre className="bg-black/20 p-2 rounded text-xs whitespace-pre-wrap break-words min-w-0">
                                                    {testResult.logs.join('\n')}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Deploy Success Dialog */}
            <Dialog open={deployDialogOpen} onOpenChange={setDeployDialogOpen}>
                <DialogContent className="max-w-2xl border-indigo-500/20">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Rocket className="w-5 h-5 text-emerald-500" />
                            Your mock API is live
                        </DialogTitle>
                        <DialogDescription>
                            The endpoint below serves your workflow. Anyone with the URL can call it.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Endpoint URL</Label>
                            <div className="flex gap-2">
                                <Input readOnly value={getEndpointUrl() || ''} className="font-mono text-xs bg-transparent" />
                                <Button variant="outline" size="sm" onClick={copyEndpoint}>
                                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Try it with curl</Label>
                            <pre className="bg-zinc-950 text-zinc-100 p-3 rounded-md text-xs overflow-x-auto">
                                {(() => {
                                    const requestNode = nodes.find(n => n.type === 'request');
                                    const method = ((requestNode?.data as any)?.method || 'GET').toUpperCase();
                                    const url = getEndpointUrl() || '';
                                    return method === 'GET' || method === 'DELETE'
                                        ? `curl -X ${method} "${url}"`
                                        : `curl -X ${method} "${url}" \\\n  -H "Content-Type: application/json" \\\n  -d '${testRequest.replace(/\n\s*/g, ' ')}'`;
                                })()}
                            </pre>
                        </div>

                        <Button onClick={handleTryIt} disabled={tryingIt} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700">
                            {tryingIt ? 'Calling endpoint...' : 'Try it now'}
                        </Button>

                        {tryItResult && (
                            <pre className="bg-black/20 p-3 rounded-md text-xs overflow-auto max-h-[200px] whitespace-pre-wrap">
                                {tryItResult}
                            </pre>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Templates Dialog */}
            <Dialog open={templatesDialogOpen} onOpenChange={setTemplatesDialogOpen}>
                <DialogContent className="max-w-2xl border-indigo-500/20">
                    <DialogHeader>
                        <DialogTitle>Start from a template</DialogTitle>
                        <DialogDescription>
                            Ready-made workflows: load one, Test it, then Save and Deploy.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => handleLoadTemplate(template.id)}
                                className="text-left p-4 rounded-xl border border-indigo-500/20 hover:border-indigo-400/40 hover:bg-indigo-500/10 transition-all"
                            >
                                <div className="font-semibold text-sm mb-1">{template.name}</div>
                                <div className="text-xs text-muted-foreground leading-relaxed">{template.description}</div>
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Keyboard Shortcuts Dialog */}
            <Dialog open={shortcutsDialogOpen} onOpenChange={setShortcutsDialogOpen}>
                <DialogContent className="border-indigo-500/20">
                    <DialogHeader>
                        <DialogTitle>Keyboard Shortcuts</DialogTitle>
                        <DialogDescription>
                            Boost your productivity with these shortcuts
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Save workflow</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-indigo-500/10 rounded border border-indigo-500/20">Ctrl+S</kbd>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Undo</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-indigo-500/10 rounded border border-indigo-500/20">Ctrl+Z</kbd>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Redo</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-indigo-500/10 rounded border border-indigo-500/20">Ctrl+Shift+Z</kbd>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Delete selected</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-indigo-500/10 rounded border border-indigo-500/20">Delete</kbd>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Fit view</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-indigo-500/10 rounded border border-indigo-500/20">F</kbd>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Show shortcuts</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-indigo-500/10 rounded border border-indigo-500/20">Ctrl+/</kbd>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

/**
 * Slim, non-modal guidance that stays visible until the first deploy. Unlike
 * OnboardingGuide (a one-time popup), this keeps tracking Build/Test/Save/Deploy
 * across the whole session so the "how do I use this" answer doesn't disappear
 * after the first dismiss.
 */
function GettingStartedStrip({
    buildDone,
    testDone,
    saveDone,
    deployDone,
}: {
    buildDone: boolean;
    testDone: boolean;
    saveDone: boolean;
    deployDone: boolean;
}) {
    const [dismissed, setDismissed] = useState(false);

    if (deployDone || dismissed) return null;

    const steps: { label: string; done: boolean }[] = [
        { label: 'Build', done: buildDone },
        { label: 'Test', done: testDone },
        { label: 'Save', done: saveDone },
        { label: 'Deploy', done: deployDone },
    ];

    return (
        <div className="h-9 flex items-center justify-center gap-6 px-6 bg-[#0d1024]/80 border-b border-white/[0.06] text-xs relative z-40">
            <span className="text-zinc-500 font-medium hidden sm:inline">Getting started:</span>
            <div className="flex items-center gap-4">
                {steps.map((step, i) => (
                    <React.Fragment key={step.label}>
                        {i > 0 && <span className="w-3 h-px bg-zinc-700 hidden sm:block" />}
                        <span className={`flex items-center gap-1.5 ${step.done ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : (
                                <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px]">{i + 1}</span>
                            )}
                            {step.label}
                        </span>
                    </React.Fragment>
                ))}
            </div>
            <button
                onClick={() => setDismissed(true)}
                className="absolute right-4 text-zinc-600 hover:text-zinc-300 transition-colors text-[11px]"
                title="Dismiss"
            >
                Dismiss
            </button>
        </div>
    );
}
