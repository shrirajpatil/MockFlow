import { evaluateCondition } from './lib/safeEval.js';

/**
 * Server-side workflow executor: runs a deployed workflow (ReactFlow
 * nodes/edges JSON from the `workflows` table) against a real HTTP request.
 *
 * Node semantics mirror the editor's in-canvas Test executor
 * (frontend/src/lib/executor.ts) so what you test is what deploys.
 */

export interface WorkflowNode {
    id: string;
    type?: string;
    data: any;
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
}

export interface RequestContext {
    method: string;
    path: string;
    headers: Record<string, string>;
    query: Record<string, any>;
    params: Record<string, string>;
    body: any;
}

/** Pluggable persistence for State nodes (Redis-backed in production). */
export interface StateStore {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
}

export interface ExecutionResult {
    statusCode: number;
    headers: Record<string, string>;
    body: any;
    logs: string[];
}

const MAX_STEPS = 100;

export class ServerWorkflowExecutor {
    private logs: string[] = [];
    private steps = 0;
    private context: {
        request: RequestContext;
        state: Record<string, any>;
        variables: Record<string, any>;
    };

    constructor(
        private nodes: WorkflowNode[],
        private edges: WorkflowEdge[],
        request: RequestContext,
        private stateStore?: StateStore
    ) {
        this.context = {
            request,
            state: {},
            variables: {},
        };
    }

    async execute(startNode: WorkflowNode): Promise<ExecutionResult> {
        try {
            const result = await this.executeNode(startNode);
            if (result) return { ...result, logs: this.logs };

            // Workflow ended without reaching a Response node
            return {
                statusCode: 200,
                headers: {},
                body: { message: 'Workflow completed without a Response node' },
                logs: this.logs,
            };
        } catch (error: any) {
            this.log(`Execution error: ${error.message}`);
            return {
                statusCode: error.statusCode || 400,
                headers: {},
                body: { error: error.message },
                logs: this.logs,
            };
        }
    }

    private async executeNode(node: WorkflowNode): Promise<Omit<ExecutionResult, 'logs'> | null> {
        if (++this.steps > MAX_STEPS) {
            throw new Error('Workflow exceeded maximum step count (possible cycle)');
        }

        const data = node.data || {};
        const type = data.type || node.type;
        this.log(`Executing ${type} node: ${data.label || node.id}`);

        switch (type) {
            case 'request':
                break; // entry point; matching already done by the router
            case 'validation':
                this.runValidation(data);
                break;
            case 'transformation':
                this.runTransformation(data);
                break;
            case 'state':
                await this.runState(data);
                break;
            case 'response':
                return this.buildResponse(data);
            case 'conditional':
                return this.runConditional(node, data);
            default:
                this.log(`Skipping unknown node type: ${type}`);
        }

        const nextEdge = this.edges.find((edge) => edge.source === node.id);
        if (!nextEdge) {
            this.log('No next node, ending execution');
            return null;
        }

        const nextNode = this.nodes.find((n) => n.id === nextEdge.target);
        return nextNode ? this.executeNode(nextNode) : null;
    }

    private runValidation(data: any): void {
        for (const rule of data.rules || []) {
            const fieldValue = this.context.request.body?.[rule.field];
            this.log(`Validating: ${rule.field} ${rule.condition}`);

            switch (rule.condition) {
                case 'required':
                    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
                        throw validationError(rule.errorMessage || `Field ${rule.field} is required`);
                    }
                    break;
                case 'type':
                    if (rule.value && typeof fieldValue !== rule.value) {
                        throw validationError(rule.errorMessage || `Field ${rule.field} must be of type ${rule.value}`);
                    }
                    break;
                case 'regex':
                    if (rule.value && !new RegExp(rule.value).test(String(fieldValue))) {
                        throw validationError(rule.errorMessage || `Field ${rule.field} does not match pattern`);
                    }
                    break;
                case 'min':
                    if (rule.value !== undefined && Number(fieldValue) < Number(rule.value)) {
                        throw validationError(rule.errorMessage || `Field ${rule.field} must be at least ${rule.value}`);
                    }
                    break;
                case 'max':
                    if (rule.value !== undefined && Number(fieldValue) > Number(rule.value)) {
                        throw validationError(rule.errorMessage || `Field ${rule.field} must be at most ${rule.value}`);
                    }
                    break;
            }
        }
        this.log('Validation passed');
    }

    private runTransformation(data: any): void {
        for (const t of data.transformations || []) {
            this.log(`Transform: ${t.target} <- ${t.source}`);
            const sourceValue = this.getValueFromPath(t.source);
            this.setVariableAtPath(t.target, sourceValue);
        }
    }

    private async runState(data: any): Promise<void> {
        const operation = data.operation || 'get';
        const key = data.key || '';
        if (!key) return;

        if (operation === 'get') {
            let value = this.context.state[key];
            if (value === undefined && this.stateStore) {
                value = await this.stateStore.get(key);
                if (value !== undefined && value !== null) this.context.state[key] = value;
            }
            this.log(`State GET: ${key}`);
            this.context.variables[key] = value;
        } else if (operation === 'set') {
            // Value supports {{path}} templating so state can capture request data
            const value = this.renderTemplateValue(data.value ?? '');
            this.log(`State SET: ${key}`);
            this.context.state[key] = value;
            if (this.stateStore) await this.stateStore.set(key, value);
        }
    }

    private runConditional(node: WorkflowNode, data: any): Promise<Omit<ExecutionResult, 'logs'> | null> {
        const condition = data.condition || 'true';
        const result = evaluateCondition(condition, {
            request: this.context.request,
            state: this.context.state,
            variables: this.context.variables,
        });
        this.log(`Condition "${condition}" -> ${result}`);

        const branchEdge = this.edges.find(
            (edge) => edge.source === node.id && edge.sourceHandle === (result ? 'true' : 'false')
        );
        if (!branchEdge) {
            this.log('No matching conditional branch found');
            return Promise.resolve(null);
        }

        const nextNode = this.nodes.find((n) => n.id === branchEdge.target);
        return nextNode ? this.executeNode(nextNode) : Promise.resolve(null);
    }

    private buildResponse(data: any): Omit<ExecutionResult, 'logs'> {
        const statusCode = data.statusCode || 200;
        this.log(`Response: ${statusCode}`);

        let bodyText = data.bodyTemplate || '{}';
        bodyText = bodyText.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_match: string, path: string) => {
            const value = this.getValueFromPath(path);
            return JSON.stringify(value === undefined ? null : value);
        });

        let body: any;
        try {
            body = JSON.parse(bodyText);
        } catch {
            body = bodyText;
        }

        const headers: Record<string, string> = {};
        for (const h of data.headers || []) {
            if (h.key) headers[h.key] = h.value;
        }

        return { statusCode, headers, body };
    }

    /** Replace {{path}} in a string; a template that is exactly one placeholder keeps the value's type. */
    private renderTemplateValue(template: string): any {
        const exact = /^\{\{(\w+(?:\.\w+)*)\}\}$/.exec(template.trim());
        if (exact) return this.getValueFromPath(exact[1]!);
        return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_m, path: string) => {
            const value = this.getValueFromPath(path);
            return typeof value === 'string' ? value : JSON.stringify(value ?? null);
        });
    }

    private getValueFromPath(path: string): any {
        let value: any = this.context;
        for (const part of path.split('.')) {
            if (value && typeof value === 'object') value = value[part];
            else return undefined;
        }
        return value;
    }

    private setVariableAtPath(path: string, value: any): void {
        const parts = path.split('.');
        let target: any = this.context.variables;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i]!;
            if (!target[part] || typeof target[part] !== 'object') target[part] = {};
            target = target[part];
        }
        target[parts[parts.length - 1]!] = value;
    }

    private log(message: string): void {
        this.logs.push(`[${new Date().toISOString()}] ${message}`);
    }
}

function validationError(message: string): Error & { statusCode: number } {
    const err = new Error(message) as Error & { statusCode: number };
    err.statusCode = 400;
    return err;
}

/**
 * Match a request path against a node path pattern supporting :params
 * (e.g. "/users/:id" matches "/users/42"). Returns extracted params or null.
 */
export function matchPath(pattern: string, actual: string): Record<string, string> | null {
    const patternParts = pattern.split('/').filter(Boolean);
    const actualParts = actual.split('/').filter(Boolean);
    if (patternParts.length !== actualParts.length) return null;

    const params: Record<string, string> = {};
    for (let i = 0; i < patternParts.length; i++) {
        const p = patternParts[i]!;
        const a = actualParts[i]!;
        if (p.startsWith(':')) {
            params[p.slice(1)] = decodeURIComponent(a);
        } else if (p !== a) {
            return null;
        }
    }
    return params;
}
