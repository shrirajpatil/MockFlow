import yaml from 'js-yaml';
import { Node, Edge } from 'reactflow';

/**
 * Turns an OpenAPI 3.x (and best-effort Swagger 2.0) document into one
 * MockFlow node graph per operation — Request -> [Validation] -> Response,
 * matching the shape handwritten templates use (see lib/templates.ts).
 */

export interface ParsedOperation {
    key: string; // "METHOD /path", unique within the parsed doc
    method: string;
    path: string; // MockFlow's :param syntax, converted from OpenAPI's {param}
    summary: string;
    nodes: Node[];
    edges: Edge[];
}

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;

export function parseOpenApiSpec(text: string): ParsedOperation[] {
    const doc = parseSpecText(text);
    if (!doc || typeof doc !== 'object' || !doc.paths || typeof doc.paths !== 'object') {
        throw new Error('No "paths" object found — is this a valid OpenAPI/Swagger document?');
    }

    const ops: ParsedOperation[] = [];

    for (const [rawPath, pathItemRaw] of Object.entries<any>(doc.paths)) {
        const pathItem = pathItemRaw || {};
        const mockPath = rawPath.replace(/\{(\w+)\}/g, ':$1');
        const pathLevelParams = Array.isArray(pathItem.parameters) ? pathItem.parameters : [];

        for (const method of HTTP_METHODS) {
            const operation = pathItem[method];
            if (!operation) continue;

            const allParams = [...pathLevelParams, ...(operation.parameters || [])];
            const pathParams = allParams
                .filter((p: any) => p.in === 'path')
                .map((p: any) => ({ key: p.name, type: p.schema?.type || 'string' }));
            const queryParams = allParams
                .filter((p: any) => p.in === 'query')
                .map((p: any) => ({ key: p.name, type: p.schema?.type || 'string', required: !!p.required }));

            const bodySchema = resolveRequestBodySchema(doc, operation, allParams);
            const requiredFields: string[] = Array.isArray(bodySchema?.required) ? bodySchema.required : [];

            const { statusCode, exampleBody } = resolveSuccessResponse(doc, operation);

            const methodUpper = method.toUpperCase();
            const { nodes, edges } = buildGraph({
                method: methodUpper,
                path: mockPath,
                pathParams,
                queryParams,
                requiredFields,
                statusCode,
                exampleBody,
                summary: operation.summary,
            });

            ops.push({
                key: `${methodUpper} ${mockPath}`,
                method: methodUpper,
                path: mockPath,
                summary: operation.summary || operation.operationId || '',
                nodes,
                edges,
            });
        }
    }

    if (ops.length === 0) {
        throw new Error('No operations found in this spec (expected GET/POST/PUT/PATCH/DELETE under "paths").');
    }

    return ops;
}

function parseSpecText(text: string): any {
    try {
        return JSON.parse(text);
    } catch {
        // Fall through to YAML — most hand-authored OpenAPI specs are YAML.
    }
    return yaml.load(text);
}

function resolveRequestBodySchema(doc: any, operation: any, allParams: any[]): any {
    const jsonContent = operation.requestBody?.content?.['application/json'];
    if (jsonContent?.schema) return resolveSchema(doc, jsonContent.schema);

    // Swagger 2.0: body carried as a "body"-in parameter, not requestBody.
    const bodyParam = allParams.find((p: any) => p.in === 'body');
    if (bodyParam?.schema) return resolveSchema(doc, bodyParam.schema);

    return null;
}

function resolveSuccessResponse(doc: any, operation: any): { statusCode: number; exampleBody: any } {
    const responses = operation.responses || {};
    const codes = Object.keys(responses);
    const successKey = codes.find((k) => /^2\d\d$/.test(k)) || codes[0];
    const statusCode = successKey && /^\d+$/.test(successKey) ? parseInt(successKey, 10) : 200;

    if (!successKey) return { statusCode: 200, exampleBody: {} };
    const response = responses[successKey];

    const jsonContent = response?.content?.['application/json'];
    if (jsonContent?.example !== undefined) return { statusCode, exampleBody: jsonContent.example };
    if (jsonContent?.examples) {
        const first: any = Object.values(jsonContent.examples)[0];
        return { statusCode, exampleBody: first?.value ?? {} };
    }
    if (jsonContent?.schema) return { statusCode, exampleBody: exampleFromSchema(doc, jsonContent.schema) };

    // Swagger 2.0: response schema sits directly on the response object.
    if (response?.schema) return { statusCode, exampleBody: exampleFromSchema(doc, response.schema) };

    return { statusCode, exampleBody: {} };
}

function buildGraph(spec: {
    method: string;
    path: string;
    pathParams: Array<{ key: string; type: string }>;
    queryParams: Array<{ key: string; type: string; required: boolean }>;
    requiredFields: string[];
    statusCode: number;
    exampleBody: any;
    summary?: string;
}): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let y = 50;

    const requestId = 'request-1';
    nodes.push({
        id: requestId,
        type: 'request',
        position: { x: 250, y },
        data: {
            label: `${spec.method} ${spec.path}`,
            type: 'request',
            method: spec.method,
            path: spec.path,
            pathParams: spec.pathParams,
            queryParams: spec.queryParams,
        },
    });
    y += 180;
    let lastId = requestId;

    if (spec.requiredFields.length > 0) {
        const validationId = 'validation-1';
        nodes.push({
            id: validationId,
            type: 'validation',
            position: { x: 250, y },
            data: {
                label: 'Validate input',
                type: 'validation',
                rules: spec.requiredFields.map((field) => ({
                    field,
                    condition: 'required' as const,
                    errorMessage: `${field} is required`,
                })),
            },
        });
        edges.push({ id: `e-${requestId}-${validationId}`, source: requestId, target: validationId });
        lastId = validationId;
        y += 180;
    }

    const responseId = 'response-1';
    nodes.push({
        id: responseId,
        type: 'response',
        position: { x: 250, y },
        data: {
            label: spec.summary || `${spec.statusCode} response`,
            type: 'response',
            statusCode: spec.statusCode,
            headers: [{ key: 'Content-Type', value: 'application/json' }],
            bodyTemplate: JSON.stringify(spec.exampleBody ?? {}, null, 2),
        },
    });
    edges.push({ id: `e-${lastId}-${responseId}`, source: lastId, target: responseId });

    return { nodes, edges };
}

function resolveSchema(doc: any, schema: any, seen: Set<string> = new Set()): any {
    if (schema && typeof schema.$ref === 'string') {
        if (seen.has(schema.$ref)) return {};
        seen.add(schema.$ref);
        const path = schema.$ref.replace(/^#\//, '').split('/');
        let node = doc;
        for (const part of path) node = node?.[part];
        return node ? resolveSchema(doc, node, seen) : {};
    }
    return schema || {};
}

function exampleFromSchema(doc: any, schemaIn: any, depth = 0): any {
    if (!schemaIn || depth > 6) return null;
    const schema = resolveSchema(doc, schemaIn);

    if (schema.example !== undefined) return schema.example;
    if (schema.default !== undefined) return schema.default;
    if (Array.isArray(schema.enum) && schema.enum.length > 0) return schema.enum[0];

    if (Array.isArray(schema.allOf)) {
        return schema.allOf.reduce(
            (acc: any, sub: any) => ({ ...acc, ...exampleFromSchema(doc, sub, depth + 1) }),
            {}
        );
    }

    if (schema.properties || schema.type === 'object') {
        const obj: Record<string, any> = {};
        for (const [key, propSchema] of Object.entries(schema.properties || {})) {
            obj[key] = exampleFromSchema(doc, propSchema, depth + 1);
        }
        return obj;
    }

    if (schema.type === 'array') {
        return [exampleFromSchema(doc, schema.items, depth + 1)];
    }

    switch (schema.type) {
        case 'string':
            if (schema.format === 'date-time') return new Date().toISOString();
            if (schema.format === 'date') return new Date().toISOString().slice(0, 10);
            if (schema.format === 'email') return 'user@example.com';
            if (schema.format === 'uuid') return '00000000-0000-0000-0000-000000000000';
            return 'string';
        case 'integer':
        case 'number':
            return 0;
        case 'boolean':
            return true;
        default:
            return null;
    }
}
