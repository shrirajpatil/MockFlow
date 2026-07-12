import { supabase } from './db.js';
import {
    getCachedDeployedWorkflow,
    cacheDeployedWorkflow,
    getWorkflowState,
    setWorkflowState,
} from './lib/redis.js';
import {
    ServerWorkflowExecutor,
    matchPath,
    type WorkflowNode,
    type WorkflowEdge,
    type StateStore,
} from './workflowExecutor.js';

interface ExecutionContext {
    workspace: string;
    path: string;
    method: string;
    body: any;
    headers: Record<string, string>;
    query: Record<string, any>;
}

interface DeployedWorkflow {
    id: string;
    name: string;
    workspace: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}

interface RouteMatch {
    workflow: DeployedWorkflow;
    startNode: WorkflowNode;
    params: Record<string, string>;
}

/**
 * Serve a deployed mock: find the workflow in the workspace whose Request
 * node matches method+path, execute it, and return the designed response.
 */
export async function executeMock(ctx: ExecutionContext) {
    const match = await resolveRoute(ctx);

    if (!match) {
        return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'No deployed endpoint matches this request',
                workspace: ctx.workspace,
                method: ctx.method,
                path: ctx.path,
            }),
        };
    }

    const stateStore: StateStore = {
        get: (key) => getWorkflowState(ctx.workspace, key),
        set: (key, value) => setWorkflowState(ctx.workspace, key, value),
    };

    const executor = new ServerWorkflowExecutor(
        match.workflow.nodes,
        match.workflow.edges,
        {
            method: ctx.method,
            path: ctx.path,
            headers: ctx.headers,
            query: ctx.query,
            params: match.params,
            body: ctx.body,
        },
        stateStore
    );

    const result = await executor.execute(match.startNode);

    // Record execution history (fire-and-forget)
    void recordExecution(match.workflow.id, ctx, result.statusCode, result.body);

    return {
        statusCode: result.statusCode,
        headers: {
            'Content-Type': 'application/json',
            'X-Powered-By': 'MockFlow',
            ...result.headers,
        },
        body: typeof result.body === 'string' ? result.body : JSON.stringify(result.body),
    };
}

async function resolveRoute(ctx: ExecutionContext): Promise<RouteMatch | null> {
    // 1. Redis cache (exact method+path routes only)
    const cached = await getCachedDeployedWorkflow(ctx.workspace, ctx.method, ctx.path);
    if (cached) {
        const match = matchWorkflow(cached, ctx.method, ctx.path);
        if (match) return match;
    }

    // 2. Supabase lookup: all deployed workflows in this workspace
    const { data: workflows, error } = await supabase
        .from('workflows')
        .select('id, name, workspace, nodes, edges')
        .eq('deployed', true)
        .eq('workspace', ctx.workspace)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('[MockEngine] Supabase error:', error.message);
        return null;
    }

    for (const workflow of workflows || []) {
        const match = matchWorkflow(workflow as DeployedWorkflow, ctx.method, ctx.path);
        if (match) {
            await cacheDeployedWorkflow(ctx.workspace, ctx.method, ctx.path, workflow);
            return match;
        }
    }

    return null;
}

/** Find the Request node in a workflow matching method+path (supports :params). */
function matchWorkflow(workflow: DeployedWorkflow, method: string, path: string): RouteMatch | null {
    for (const node of workflow.nodes || []) {
        const data = node.data || {};
        const type = data.type || node.type;
        if (type !== 'request') continue;

        const nodeMethod = (data.method || 'GET').toUpperCase();
        if (nodeMethod !== method.toUpperCase() && nodeMethod !== 'ANY') continue;

        const params = matchPath(data.path || '/', path);
        if (params) return { workflow, startNode: node, params };
    }
    return null;
}

async function recordExecution(workflowId: string, ctx: ExecutionContext, statusCode: number, body: any) {
    try {
        await supabase.from('workflow_executions').insert({
            workflow_id: workflowId,
            request_data: { method: ctx.method, path: ctx.path, query: ctx.query, body: ctx.body },
            response_data: { statusCode, body },
            status: statusCode < 400 ? 'success' : 'failed',
        });
    } catch (error) {
        console.error('[MockEngine] Failed to record execution:', error);
    }
}
