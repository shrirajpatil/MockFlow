import { Node, Edge } from 'reactflow';
import type { NodeData } from '@/types/nodes';

export interface ExecutionContext {
    request: {
        method: string;
        path: string;
        headers: Record<string, string>;
        query: Record<string, any>;
        body: any;
    };
    state: Record<string, any>;
    variables: Record<string, any>;
}

export interface ExecutionResult {
    success: boolean;
    statusCode?: number;
    headers?: Record<string, string>;
    body?: any;
    error?: string;
    logs?: string[];
}

export class WorkflowExecutor {
    private nodes: Node[];
    private edges: Edge[];
    private context: ExecutionContext;
    private logs: string[];

    constructor(nodes: Node[], edges: Edge[], initialContext: Partial<ExecutionContext> = {}) {
        this.nodes = nodes;
        this.edges = edges;
        this.logs = [];
        this.context = {
            request: initialContext.request || {
                method: 'GET',
                path: '/',
                headers: {},
                query: {},
                body: null,
            },
            state: initialContext.state || {},
            variables: initialContext.variables || {},
        };
    }

    async execute(): Promise<ExecutionResult> {
        try {
            // Find the starting node (Request node with no incoming edges)
            const startNode = this.nodes.find(
                (node) => node.type === 'request' && !this.edges.some((edge) => edge.target === node.id)
            );

            if (!startNode) {
                return {
                    success: false,
                    error: 'No starting Request node found',
                    logs: this.logs,
                };
            }

            this.log(`Starting execution from node: ${startNode.id}`);

            // Execute the workflow starting from the Request node
            const result = await this.executeNode(startNode);

            return {
                success: true,
                ...result,
                logs: this.logs,
            };
        } catch (error: any) {
            this.log(`Execution error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                logs: this.logs,
            };
        }
    }

    private async executeNode(node: Node): Promise<Partial<ExecutionResult>> {
        const data = node.data as NodeData;
        this.log(`Executing ${data.type} node: ${data.label}`);

        let result: Partial<ExecutionResult> = {};

        switch (data.type) {
            case 'request':
                result = await this.executeRequestNode(data);
                break;
            case 'validation':
                result = await this.executeValidationNode(data);
                break;
            case 'transformation':
                result = await this.executeTransformationNode(data);
                break;
            case 'response':
                result = await this.executeResponseNode(data);
                return result; // Response node is terminal
            case 'state':
                result = await this.executeStateNode(data);
                break;
            case 'conditional':
                result = await this.executeConditionalNode(node);
                return result; // Conditional handles its own next nodes
            default:
                this.log(`Unknown node type: ${(data as any).type}`);
        }

        // Find next node(s)
        const nextEdges = this.edges.filter((edge) => edge.source === node.id);
        if (nextEdges.length === 0) {
            this.log('No next node found, ending execution');
            return result;
        }

        // Execute next node
        const nextNode = this.nodes.find((n) => n.id === nextEdges[0].target);
        if (nextNode) {
            return await this.executeNode(nextNode);
        }

        return result;
    }

    private async executeRequestNode(data: any): Promise<Partial<ExecutionResult>> {
        // Request node just validates the incoming request matches the schema
        this.log(`Request: ${data.method || 'GET'} ${data.path || '/'}`);

        // Update context with request data
        this.context.request.method = data.method || this.context.request.method;
        this.context.request.path = data.path || this.context.request.path;

        return {};
    }

    private async executeValidationNode(data: any): Promise<Partial<ExecutionResult>> {
        const rules = data.rules || [];

        for (const rule of rules) {
            this.log(`Validating: ${rule.field} ${rule.condition}`);

            // Get field value from request body
            const fieldValue = this.context.request.body?.[rule.field];

            switch (rule.condition) {
                case 'required':
                    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
                        throw new Error(rule.errorMessage || `Field ${rule.field} is required`);
                    }
                    break;
                case 'type':
                    if (rule.value && typeof fieldValue !== rule.value) {
                        throw new Error(rule.errorMessage || `Field ${rule.field} must be of type ${rule.value}`);
                    }
                    break;
                case 'regex':
                    if (rule.value && !new RegExp(rule.value).test(String(fieldValue))) {
                        throw new Error(rule.errorMessage || `Field ${rule.field} does not match pattern`);
                    }
                    break;
            }
        }

        this.log('Validation passed');
        return {};
    }

    private async executeTransformationNode(data: any): Promise<Partial<ExecutionResult>> {
        const transformations = data.transformations || [];

        for (const t of transformations) {
            this.log(`Transform: ${t.target} ← ${t.source}`);

            // Simple field mapping
            const sourceValue = this.getValueFromPath(t.source);
            this.setValueAtPath(t.target, sourceValue);
        }

        return {};
    }

    private async executeResponseNode(data: any): Promise<Partial<ExecutionResult>> {
        this.log(`Response: ${data.statusCode || 200}`);

        // Parse body template and replace variables
        let body = data.bodyTemplate || '{}';

        // Replace {{variable}} with actual values
        body = body.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match: string, path: string) => {
            const value = this.getValueFromPath(path);
            return JSON.stringify(value);
        });

        try {
            const parsedBody = JSON.parse(body);
            return {
                statusCode: data.statusCode || 200,
                headers: this.arrayToObject(data.headers || []),
                body: parsedBody,
            };
        } catch (e) {
            return {
                statusCode: data.statusCode || 200,
                headers: this.arrayToObject(data.headers || []),
                body: body,
            };
        }
    }

    private async executeStateNode(data: any): Promise<Partial<ExecutionResult>> {
        const operation = data.operation || 'get';
        const key = data.key || '';

        if (operation === 'get') {
            this.log(`State GET: ${key}`);
            const value = this.context.state[key];
            this.context.variables[key] = value;
        } else if (operation === 'set') {
            this.log(`State SET: ${key} = ${data.value}`);
            this.context.state[key] = data.value;
        }

        return {};
    }

    private async executeConditionalNode(node: Node): Promise<Partial<ExecutionResult>> {
        const data = node.data as any;
        const condition = data.condition || 'true';

        this.log(`Evaluating condition: ${condition}`);

        // Simple condition evaluation (in production, use a safe eval library)
        let result = false;
        try {
            // Create a safe evaluation context
            const evalContext = {
                request: this.context.request,
                state: this.context.state,
                variables: this.context.variables,
            };

            // Very basic evaluation - in production use a proper expression parser
            result = eval(`with(evalContext) { ${condition} }`);
        } catch (e: any) {
            this.log(`Condition evaluation error: ${e.message}`);
            result = false;
        }

        this.log(`Condition result: ${result}`);

        // Find the appropriate next node based on condition result
        const nextEdges = this.edges.filter((edge) => edge.source === node.id);
        const targetEdge = nextEdges.find((edge) =>
            result ? edge.sourceHandle === 'true' : edge.sourceHandle === 'false'
        );

        if (targetEdge) {
            const nextNode = this.nodes.find((n) => n.id === targetEdge.target);
            if (nextNode) {
                return await this.executeNode(nextNode);
            }
        }

        this.log('No matching conditional branch found');
        return {};
    }

    private getValueFromPath(path: string): any {
        const parts = path.split('.');
        let value: any = this.context;

        for (const part of parts) {
            if (value && typeof value === 'object') {
                value = value[part];
            } else {
                return undefined;
            }
        }

        return value;
    }

    private setValueAtPath(path: string, value: any): void {
        const parts = path.split('.');
        let target: any = this.context.variables;

        for (let i = 0; i < parts.length - 1; i++) {
            if (!target[parts[i]]) {
                target[parts[i]] = {};
            }
            target = target[parts[i]];
        }

        target[parts[parts.length - 1]] = value;
    }

    private arrayToObject(arr: Array<{ key: string; value: string }>): Record<string, string> {
        return arr.reduce((obj, item) => {
            obj[item.key] = item.value;
            return obj;
        }, {} as Record<string, string>);
    }

    private log(message: string): void {
        this.logs.push(`[${new Date().toISOString()}] ${message}`);
        console.log(message);
    }
}
