import { describe, it, expect } from 'vitest';
import type { Node, Edge } from 'reactflow';
import { WorkflowExecutor } from './productionExecutor';

function run(nodes: Node[], edges: Edge[], body: any = {}) {
    const executor = new WorkflowExecutor(nodes, edges, {
        request: { method: 'POST', path: '/x', headers: {}, query: {}, body },
    });
    return executor.execute();
}

describe('WorkflowExecutor (editor Test button)', () => {
    it('mirrors the server executor for request -> response', async () => {
        const nodes: Node[] = [
            { id: 'r1', type: 'request', position: { x: 0, y: 0 }, data: { type: 'request', method: 'POST', path: '/x' } },
            { id: 'resp1', type: 'response', position: { x: 0, y: 0 }, data: { type: 'response', statusCode: 201, bodyTemplate: '{"ok": true}' } },
        ];
        const edges: Edge[] = [{ id: 'e1', source: 'r1', target: 'resp1' }];

        const result = await run(nodes, edges);
        expect(result.success).toBe(true);
        expect(result.statusCode).toBe(201);
        expect(result.body).toEqual({ ok: true });
    });

    it('throws a validation error that surfaces in the result', async () => {
        const nodes: Node[] = [
            { id: 'r1', type: 'request', position: { x: 0, y: 0 }, data: { type: 'request', method: 'POST', path: '/x' } },
            {
                id: 'v1',
                type: 'validation',
                position: { x: 0, y: 0 },
                data: { type: 'validation', rules: [{ field: 'email', condition: 'required', errorMessage: 'email is required' }] },
            },
            { id: 'resp1', type: 'response', position: { x: 0, y: 0 }, data: { type: 'response', statusCode: 200, bodyTemplate: '{}' } },
        ];
        const edges: Edge[] = [
            { id: 'e1', source: 'r1', target: 'v1' },
            { id: 'e2', source: 'v1', target: 'resp1' },
        ];

        const result = await run(nodes, edges, {});
        expect(result.success).toBe(false);
        expect(result.error).toBe('email is required');
    });

    it('branches conditionally using the safe evaluator (no eval)', async () => {
        const nodes: Node[] = [
            { id: 'r1', type: 'request', position: { x: 0, y: 0 }, data: { type: 'request', method: 'POST', path: '/x' } },
            { id: 'c1', type: 'conditional', position: { x: 0, y: 0 }, data: { type: 'conditional', condition: 'request.body.age >= 18' } },
            { id: 'ok', type: 'response', position: { x: 0, y: 0 }, data: { type: 'response', statusCode: 200, bodyTemplate: '{"allowed": true}' } },
            { id: 'deny', type: 'response', position: { x: 0, y: 0 }, data: { type: 'response', statusCode: 403, bodyTemplate: '{"allowed": false}' } },
        ];
        const edges: Edge[] = [
            { id: 'e1', source: 'r1', target: 'c1' },
            { id: 'e2', source: 'c1', target: 'ok', sourceHandle: 'true' },
            { id: 'e3', source: 'c1', target: 'deny', sourceHandle: 'false' },
        ];

        expect((await run(nodes, edges, { age: 30 })).statusCode).toBe(200);
        expect((await run(nodes, edges, { age: 10 })).statusCode).toBe(403);
    });
});
