/**
 * Derives human-readable endpoint documentation (params, example request/
 * response) from a workflow's node graph, for the public share/docs page.
 */

export interface EndpointDoc {
    method: string;
    path: string;
    pathParams: Array<{ key: string; type: string }>;
    queryParams: Array<{ key: string; type: string; required: boolean }>;
    hasBody: boolean;
    requiredBodyFields: string[];
    responseStatusCode: number;
    responseExample: any;
}

export function deriveEndpointDoc(nodes: any[]): EndpointDoc | null {
    const requestNode = (nodes || []).find((n) => (n.data?.type || n.type) === 'request');
    if (!requestNode) return null;
    const data = requestNode.data || {};
    const method = (data.method || 'GET').toUpperCase();

    const validationNode = (nodes || []).find((n) => (n.data?.type || n.type) === 'validation');
    const requiredBodyFields: string[] = (validationNode?.data?.rules || [])
        .filter((r: any) => r.condition === 'required')
        .map((r: any) => r.field);

    const responseNode = (nodes || []).find((n) => (n.data?.type || n.type) === 'response');
    let responseExample: any = {};
    if (responseNode?.data?.bodyTemplate) {
        // {{...}} placeholders are runtime-only — replace with null so the
        // example still parses as illustrative JSON.
        const cleaned = String(responseNode.data.bodyTemplate).replace(/"?\{\{[^}]+\}\}"?/g, 'null');
        try {
            responseExample = JSON.parse(cleaned);
        } catch {
            responseExample = responseNode.data.bodyTemplate;
        }
    }

    return {
        method,
        path: data.path || '/',
        pathParams: data.pathParams || [],
        queryParams: data.queryParams || [],
        hasBody: method !== 'GET' && method !== 'DELETE',
        requiredBodyFields,
        responseStatusCode: responseNode?.data?.statusCode || 200,
        responseExample,
    };
}
