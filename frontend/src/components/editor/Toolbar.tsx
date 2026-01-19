'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Play, Download, Upload, Trash2, Undo2, Redo2, FileJson, Keyboard, Rocket, Copy, CheckCircle2, Database, Zap } from 'lucide-react';
import useStore from '@/store/useStore';
import { WorkflowExecutor } from '@/lib/executor';
import { saveWorkflow, updateWorkflow, deployWorkflow, undeployWorkflow } from '@/lib/api';
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
    const [testDialogOpen, setTestDialogOpen] = useState(false);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false);
    const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);
    const [testRequest, setTestRequest] = useState('{\n  "name": "John Doe",\n  "email": "john@example.com"\n}');
    const [testResult, setTestResult] = useState<any>(null);
    const [testLogs, setTestLogs] = useState<string[]>([]);
    const [testing, setTesting] = useState(false);
    const [nodeCount, setNodeCount] = useState(0);
    const [edgeCount, setEdgeCount] = useState(0);

    // Workspace
    const [workspace, setWorkspace] = useState<string>('');
    const [tempWorkspace, setTempWorkspace] = useState('');

    // Workflow metadata
    const [workflowId, setWorkflowId] = useState<string | null>(null);
    const [workflowName, setWorkflowName] = useState('');
    const [workflowDescription, setWorkflowDescription] = useState('');
    const [isDeployed, setIsDeployed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deploying, setDeploying] = useState(false);
    const [copied, setCopied] = useState(false);

    // Load workspace from localStorage on mount
    useEffect(() => {
        const savedWorkspace = localStorage.getItem('mockflow_workspace');
        if (savedWorkspace) {
            setWorkspace(savedWorkspace);
        } else {
            // Show workspace dialog if no workspace set
            setWorkspaceDialogOpen(true);
        }
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
            alert('Please set a workspace first');
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
                    alert('Workflow updated successfully!');
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
                    alert('Workflow saved successfully!');
                    setSaveDialogOpen(false);
                }
            }
        } catch (error) {
            alert('Failed to save workflow');
        } finally {
            setSaving(false);
        }
    };

    const handleDeploy = async () => {
        if (!workflowId) {
            alert('Please save the workflow first');
            return;
        }

        setDeploying(true);
        try {
            if (isDeployed) {
                const success = await undeployWorkflow(workflowId);
                if (success) {
                    setIsDeployed(false);
                    alert('Workflow undeployed successfully');
                }
            } else {
                const success = await deployWorkflow(workflowId);
                if (success) {
                    setIsDeployed(true);
                    alert('Workflow deployed successfully!');
                }
            }
        } catch (error) {
            alert('Failed to deploy workflow');
        } finally {
            setDeploying(false);
        }
    };

    const handleTest = async () => {
        if (nodes.length === 0) {
            alert('No nodes to test. Please add nodes to your workflow first.');
            return;
        }

        setTestDialogOpen(true);
        setTestResult(null);
        setTestLogs([]);
        setTesting(true);

        const logs: string[] = [];
        const addLog = (message: string) => {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] ${message}`;
            logs.push(logMessage);
            setTestLogs([...logs]);
        };

        try {
            const requestNode = nodes.find(n => n.type === 'request');

            if (!requestNode) {
                addLog('❌ No Request node found');
                setTestResult({ success: false, error: 'No Request node found' });
                setTesting(false);
                return;
            }

            const requestData = requestNode.data as any;
            addLog(`Starting test from Request node: ${requestData.label || 'Request'}`);

            // Check if this is an external API call (has full URL)
            const isExternalAPI = requestData.path && (requestData.path.startsWith('http://') || requestData.path.startsWith('https://'));

            if (isExternalAPI) {
                // Call external API
                addLog(`🌐 Calling external API: ${requestData.method || 'GET'} ${requestData.path}`);

                const startTime = Date.now();

                try {
                    const requestBody = requestData.bodySchema ? JSON.parse(requestData.bodySchema) : undefined;

                    const response = await fetch(requestData.path, {
                        method: requestData.method || 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(requestData.headers || {})
                        },
                        body: requestBody ? JSON.stringify(requestBody) : undefined
                    });

                    const executionTime = Date.now() - startTime;
                    const responseData = await response.json();

                    addLog(`✅ Response received: ${response.status} ${response.statusText}`);
                    addLog(`⏱️ Execution time: ${executionTime}ms`);

                    setTestResult({
                        success: response.ok,
                        statusCode: response.status,
                        response: responseData,
                        executionTime
                    });
                } catch (error: any) {
                    addLog(`❌ External API call failed: ${error.message}`);
                    setTestResult({
                        success: false,
                        error: error.message
                    });
                }
            } else {
                // Mock API test (existing behavior)
                addLog(`Request: ${requestData.method || 'GET'} ${requestData.path || '/'}`);

                const outgoingEdge = edges.find(e => e.source === requestNode.id);
                if (!outgoingEdge) {
                    addLog('❌ No Response node connected');
                    setTestResult({ success: false, error: 'No Response node connected' });
                    setTesting(false);
                    return;
                }

                const responseNode = nodes.find(n => n.id === outgoingEdge.target);
                if (!responseNode || responseNode.type !== 'response') {
                    addLog('❌ Connected node is not a Response node');
                    setTestResult({ success: false, error: 'Connected node is not a Response node' });
                    setTesting(false);
                    return;
                }

                const responseData = responseNode.data as any;
                addLog(`Executing response node: ${responseData.label || 'Response'}`);
                addLog(`Response: ${responseData.statusCode || 200}`);

                let responseBody = {};
                try {
                    if (responseData.bodyTemplate) {
                        responseBody = JSON.parse(responseData.bodyTemplate);
                    }
                } catch (e) {
                    addLog('⚠️ Invalid JSON in response body template');
                }

                setTestResult({
                    success: true,
                    statusCode: responseData.statusCode || 200,
                    response: responseBody,
                    executionTime: 0
                });

                addLog('✅ Workflow execution completed');
            }
        } catch (error: any) {
            addLog(`❌ Execution error: ${error.message}`);
            setTestResult({
                success: false,
                error: error.message
            });
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
                    } catch (error) {
                        alert('Failed to load workflow');
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
                            <span className="px-3 py-1.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-2">
                                <Database className="w-3 h-3" /> {workspace}
                            </span>
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


            {/* Workspace Setup Dialog */}
            <Dialog open={workspaceDialogOpen} onOpenChange={setWorkspaceDialogOpen}>
                <DialogContent className="border-indigo-100">
                    <DialogHeader>
                        <DialogTitle className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Welcome to MockFlow!</DialogTitle>
                        <DialogDescription>
                            Choose a workspace name to isolate your workflows from other users
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Workspace Name *</Label>
                            <Input
                                value={tempWorkspace}
                                onChange={(e) => setTempWorkspace(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                placeholder="my-workspace"
                                autoFocus
                                className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                            />
                            <p className="text-xs text-muted-foreground">
                                Use lowercase letters, numbers, and hyphens only. This will be part of your API URLs.
                            </p>
                            {tempWorkspace && (
                                <p className="text-xs text-violet-600">
                                    Your endpoints will be: <code className="bg-violet-50 px-1 rounded">/api/{tempWorkspace}/...</code>
                                </p>
                            )}
                        </div>

                        <Button
                            onClick={() => {
                                if (tempWorkspace.trim()) {
                                    setWorkspace(tempWorkspace);
                                    localStorage.setItem('mockflow_workspace', tempWorkspace);
                                    setWorkspaceDialogOpen(false);
                                }
                            }}
                            disabled={!tempWorkspace.trim()}
                            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
                        >
                            Set Workspace
                        </Button>
                    </div>
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
                <DialogContent className="max-w-3xl max-h-[80vh] border-indigo-100">
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
                                className="font-mono text-xs border-indigo-200"
                                rows={8}
                            />
                        </div>

                        <Button onClick={handleTest} disabled={testing} className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600">
                            {testing ? 'Testing...' : 'Run Test'}
                        </Button>

                        {testResult && (
                            <div className="space-y-2">
                                <Label>Result</Label>
                                <ScrollArea className="h-[300px] border border-indigo-100 rounded-md p-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">Status:</span>
                                            <span className={testResult.success ? 'text-emerald-600' : 'text-red-600'}>
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
                                            <div className="space-y-1">
                                                <span className="font-semibold">Response Body:</span>
                                                <pre className="bg-indigo-50 p-2 rounded text-xs overflow-auto">
                                                    {JSON.stringify(testResult.body, null, 2)}
                                                </pre>
                                            </div>
                                        )}

                                        {testResult.error && (
                                            <div className="space-y-1">
                                                <span className="font-semibold text-red-600">Error:</span>
                                                <pre className="bg-red-50 p-2 rounded text-xs text-red-600">
                                                    {testResult.error}
                                                </pre>
                                            </div>
                                        )}

                                        {testResult.logs && testResult.logs.length > 0 && (
                                            <div className="space-y-1">
                                                <span className="font-semibold">Execution Logs:</span>
                                                <pre className="bg-indigo-50 p-2 rounded text-xs overflow-auto">
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

            {/* Keyboard Shortcuts Dialog */}
            <Dialog open={shortcutsDialogOpen} onOpenChange={setShortcutsDialogOpen}>
                <DialogContent className="border-indigo-100">
                    <DialogHeader>
                        <DialogTitle>Keyboard Shortcuts</DialogTitle>
                        <DialogDescription>
                            Boost your productivity with these shortcuts
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Save workflow</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-indigo-50 rounded border border-indigo-100">Ctrl+S</kbd>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Undo</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-indigo-50 rounded border border-indigo-100">Ctrl+Z</kbd>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Redo</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-indigo-50 rounded border border-indigo-100">Ctrl+Shift+Z</kbd>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Delete selected</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-indigo-50 rounded border border-indigo-100">Delete</kbd>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Fit view</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-indigo-50 rounded border border-indigo-100">F</kbd>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Show shortcuts</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-indigo-50 rounded border border-indigo-100">Ctrl+/</kbd>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
