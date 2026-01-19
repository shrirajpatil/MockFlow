import { supabase } from './db.js';
import { getCachedDeployedWorkflow, cacheDeployedWorkflow } from './lib/redis.js';

interface ExecutionContext {
    mockId: string;
    path: string;
    method: string;
    body: any;
    headers: any;
    workspace?: string;
}

export async function executeMock(ctx: ExecutionContext) {
    const workspace = ctx.workspace || 'default';

    // 1. Try Redis Cache First
    const cachedEndpoint = await getCachedDeployedWorkflow(workspace, ctx.method, ctx.path);
    if (cachedEndpoint) {
        // In a full implementation, we'd also cache the full endpoint object or workflow
        // For now, we know we have a match.
        console.log(`[MockEngine] Cache hit for ${ctx.method} ${ctx.path}`);
    }

    // 2. Fetch/Resolve Endpoint from Supabase
    const { data: endpoints, error } = await supabase
        .from('endpoints')
        .select('*')
        .eq('mock_api_id', ctx.mockId)
        .eq('method', ctx.method)
        .eq('is_enabled', true);

    if (error || !endpoints || endpoints.length === 0) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Endpoint not found', path: ctx.path }),
        };
    }

    // Simple exact match for now
    const endpoint = endpoints.find(e => e.path === ctx.path);

    if (!endpoint) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Endpoint path not found', path: ctx.path, available: endpoints.map(e => e.path) }),
        };
    }

    // 3. Cache the resolution result
    await cacheDeployedWorkflow(workspace, ctx.method, ctx.path, endpoint.id);

    // 4. Return response
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Mock Executed Successfully',
            mockId: ctx.mockId,
            endpoint: endpoint.name,
            cached: !!cachedEndpoint
        }),
    };
}
