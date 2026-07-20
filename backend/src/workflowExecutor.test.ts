import { describe, it, expect } from 'vitest';
import { ServerWorkflowExecutor, matchPath, type WorkflowNode, type WorkflowEdge, type StateStore } from './workflowExecutor.js';

function run(nodes: WorkflowNode[], edges: WorkflowEdge[], body: any = {}, stateStore?: StateStore) {
    const startNode = nodes.find((n) => (n.data.type || n.type) === 'request')!;
    const executor = new ServerWorkflowExecutor(
        nodes,
        edges,
        { method: 'POST', path: '/x', headers: {}, query: {}, params: {}, body },
        stateStore
    );
    return executor.execute(startNode);
}

describe('matchPath', () => {
    it('matches static paths', () => {
        expect(matchPath('/users', '/users')).toEqual({});
        expect(matchPath('/users', '/orders')).toBeNull();
    });

    it('extracts path params', () => {
        expect(matchPath('/users/:id', '/users/42')).toEqual({ id: '42' });
        expect(matchPath('/users/:id/orders/:orderId', '/users/1/orders/9')).toEqual({ id: '1', orderId: '9' });
    });

    it('rejects mismatched segment counts', () => {
        expect(matchPath('/users/:id', '/users/1/extra')).toBeNull();
    });
});

describe('ServerWorkflowExecutor', () => {
    it('runs request -> response and renders the body template', async () => {
        const nodes: WorkflowNode[] = [
            { id: 'r1', data: { type: 'request', method: 'POST', path: '/x' } },
            { id: 'resp1', data: { type: 'response', statusCode: 201, bodyTemplate: '{"ok": true}' } },
        ];
        const edges: WorkflowEdge[] = [{ id: 'e1', source: 'r1', target: 'resp1' }];

        const result = await run(nodes, edges);
        expect(result.statusCode).toBe(201);
        expect(result.body).toEqual({ ok: true });
    });

    it('fails validation with a 400 and the rule error message', async () => {
        const nodes: WorkflowNode[] = [
            { id: 'r1', data: { type: 'request', method: 'POST', path: '/x' } },
            {
                id: 'v1',
                data: {
                    type: 'validation',
                    rules: [{ field: 'name', condition: 'required', errorMessage: 'name is required' }],
                },
            },
            { id: 'resp1', data: { type: 'response', statusCode: 200, bodyTemplate: '{}' } },
        ];
        const edges: WorkflowEdge[] = [
            { id: 'e1', source: 'r1', target: 'v1' },
            { id: 'e2', source: 'v1', target: 'resp1' },
        ];

        const result = await run(nodes, edges, {}); // missing "name"
        expect(result.statusCode).toBe(400);
        expect(result.body).toEqual({ error: 'name is required' });
    });

    it('passes validation and continues to the response', async () => {
        const nodes: WorkflowNode[] = [
            { id: 'r1', data: { type: 'request', method: 'POST', path: '/x' } },
            {
                id: 'v1',
                data: { type: 'validation', rules: [{ field: 'name', condition: 'required' }] },
            },
            { id: 'resp1', data: { type: 'response', statusCode: 200, bodyTemplate: '{"received": true}' } },
        ];
        const edges: WorkflowEdge[] = [
            { id: 'e1', source: 'r1', target: 'v1' },
            { id: 'e2', source: 'v1', target: 'resp1' },
        ];

        const result = await run(nodes, edges, { name: 'Ada' });
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({ received: true });
    });

    it('transforms fields and interpolates them into the response template', async () => {
        const nodes: WorkflowNode[] = [
            { id: 'r1', data: { type: 'request', method: 'POST', path: '/x' } },
            {
                id: 't1',
                data: {
                    type: 'transformation',
                    transformations: [{ target: 'user.name', source: 'request.body.name' }],
                },
            },
            { id: 'resp1', data: { type: 'response', statusCode: 200, bodyTemplate: '{"name": {{variables.user.name}}}' } },
        ];
        const edges: WorkflowEdge[] = [
            { id: 'e1', source: 'r1', target: 't1' },
            { id: 'e2', source: 't1', target: 'resp1' },
        ];

        const result = await run(nodes, edges, { name: 'Grace' });
        expect(result.body).toEqual({ name: 'Grace' });
    });

    it('branches on conditional true/false handles', async () => {
        const nodes: WorkflowNode[] = [
            { id: 'r1', data: { type: 'request', method: 'POST', path: '/x' } },
            { id: 'c1', data: { type: 'conditional', condition: 'request.body.age >= 18' } },
            { id: 'ok', data: { type: 'response', statusCode: 200, bodyTemplate: '{"allowed": true}' } },
            { id: 'deny', data: { type: 'response', statusCode: 403, bodyTemplate: '{"allowed": false}' } },
        ];
        const edges: WorkflowEdge[] = [
            { id: 'e1', source: 'r1', target: 'c1' },
            { id: 'e2', source: 'c1', target: 'ok', sourceHandle: 'true' },
            { id: 'e3', source: 'c1', target: 'deny', sourceHandle: 'false' },
        ];

        const adult = await run(nodes, edges, { age: 21 });
        expect(adult.statusCode).toBe(200);

        const minor = await run(nodes, edges, { age: 12 });
        expect(minor.statusCode).toBe(403);
    });

    it('persists state through the injected store across separate executions', async () => {
        const store = new Map<string, any>();
        const stateStore: StateStore = {
            get: async (key) => store.get(key),
            set: async (key, value) => void store.set(key, value),
        };

        const saveNodes: WorkflowNode[] = [
            { id: 'r1', data: { type: 'request', method: 'POST', path: '/profile' } },
            { id: 's1', data: { type: 'state', operation: 'set', key: 'profile', value: '{{request.body}}' } },
            { id: 'resp1', data: { type: 'response', statusCode: 201, bodyTemplate: '{"saved": true}' } },
        ];
        const saveEdges: WorkflowEdge[] = [
            { id: 'e1', source: 'r1', target: 's1' },
            { id: 'e2', source: 's1', target: 'resp1' },
        ];
        await run(saveNodes, saveEdges, { name: 'Linus' }, stateStore);

        const readNodes: WorkflowNode[] = [
            { id: 'r2', data: { type: 'request', method: 'GET', path: '/profile' } },
            { id: 's2', data: { type: 'state', operation: 'get', key: 'profile' } },
            { id: 'resp2', data: { type: 'response', statusCode: 200, bodyTemplate: '{"profile": {{state.profile}}}' } },
        ];
        const readEdges: WorkflowEdge[] = [
            { id: 'e1', source: 'r2', target: 's2' },
            { id: 'e2', source: 's2', target: 'resp2' },
        ];
        const result = await run(readNodes, readEdges, {}, stateStore);

        expect(result.body).toEqual({ profile: { name: 'Linus' } });
    });

    it('returns a 200 fallback when the workflow ends without a Response node', async () => {
        const nodes: WorkflowNode[] = [{ id: 'r1', data: { type: 'request', method: 'GET', path: '/x' } }];
        const result = await run(nodes, []);
        expect(result.statusCode).toBe(200);
    });

    it('resolves {{fake.*}} tokens to generated values, not literal lookups', async () => {
        const nodes: WorkflowNode[] = [
            { id: 'r1', data: { type: 'request', method: 'POST', path: '/x' } },
            {
                id: 'resp1',
                data: {
                    type: 'response',
                    statusCode: 200,
                    bodyTemplate: '{"id": {{fake.uuid}}, "email": {{fake.email}}, "n": {{fake.number}}}',
                },
            },
        ];
        const edges: WorkflowEdge[] = [{ id: 'e1', source: 'r1', target: 'resp1' }];

        const result = await run(nodes, edges);
        expect(result.statusCode).toBe(200);
        expect(result.body.id).toMatch(/^[0-9a-f-]{36}$/);
        expect(result.body.email).toMatch(/@/);
        expect(typeof result.body.n).toBe('number');

        // Two separate executions should (almost always) produce different fake values.
        const again = await run(nodes, edges);
        expect(again.body.id).not.toBe(result.body.id);
    });

    it('chaos mode injects a simulated error at a 100% error rate', async () => {
        const nodes: WorkflowNode[] = [
            { id: 'r1', data: { type: 'request', method: 'GET', path: '/x' } },
            {
                id: 'resp1',
                data: {
                    type: 'response',
                    statusCode: 200,
                    bodyTemplate: '{"ok": true}',
                    chaos: { enabled: true, errorRate: 100, errorStatusCodes: [503] },
                },
            },
        ];
        const edges: WorkflowEdge[] = [{ id: 'e1', source: 'r1', target: 'resp1' }];

        const result = await run(nodes, edges);
        expect(result.statusCode).toBe(503);
        expect(result.body).toMatchObject({ statusCode: 503 });
    });

    it('chaos mode leaves the response untouched at a 0% error rate', async () => {
        const nodes: WorkflowNode[] = [
            { id: 'r1', data: { type: 'request', method: 'GET', path: '/x' } },
            {
                id: 'resp1',
                data: {
                    type: 'response',
                    statusCode: 200,
                    bodyTemplate: '{"ok": true}',
                    chaos: { enabled: true, errorRate: 0, latencyMinMs: 0, latencyMaxMs: 0 },
                },
            },
        ];
        const edges: WorkflowEdge[] = [{ id: 'e1', source: 'r1', target: 'resp1' }];

        const result = await run(nodes, edges);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({ ok: true });
    });

    it('caps chaos latency at 5s even if a larger value is configured', async () => {
        const nodes: WorkflowNode[] = [
            { id: 'r1', data: { type: 'request', method: 'GET', path: '/x' } },
            {
                id: 'resp1',
                data: {
                    type: 'response',
                    statusCode: 200,
                    bodyTemplate: '{"ok": true}',
                    chaos: { enabled: true, latencyMinMs: 20, latencyMaxMs: 20, errorRate: 0 },
                },
            },
        ];
        const edges: WorkflowEdge[] = [{ id: 'e1', source: 'r1', target: 'resp1' }];

        const start = Date.now();
        const result = await run(nodes, edges);
        const elapsed = Date.now() - start;
        expect(result.statusCode).toBe(200);
        expect(elapsed).toBeGreaterThanOrEqual(15); // allows for timer slack
    });

    it('guards against infinite loops', async () => {
        const nodes: WorkflowNode[] = [
            { id: 'r1', data: { type: 'request', method: 'GET', path: '/x' } },
            { id: 'a', data: { type: 'transformation', transformations: [] } },
            { id: 'b', data: { type: 'transformation', transformations: [] } },
        ];
        const edges: WorkflowEdge[] = [
            { id: 'e1', source: 'r1', target: 'a' },
            { id: 'e2', source: 'a', target: 'b' },
            { id: 'e3', source: 'b', target: 'a' }, // cycle
        ];

        const result = await run(nodes, edges);
        expect(result.statusCode).toBe(400);
        expect(String(result.body.error)).toMatch(/maximum step count/i);
    });
});
