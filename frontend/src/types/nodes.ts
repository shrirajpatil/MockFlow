// Node data type definitions
export interface BaseNodeData {
    label: string;
    type: string;
}

export interface RequestNodeData extends BaseNodeData {
    type: 'request';
    method?: string;
    path?: string;
    url?: string; // Base URL for real API calls (e.g., http://localhost:3001)
    pathParams?: Array<{ key: string; type: string }>;
    queryParams?: Array<{ key: string; type: string; required: boolean }>;
    headers?: Array<{ key: string; value: string }>;
    bodySchema?: string; // JSON schema as string
    auth?: {
        type: 'none' | 'bearer' | 'apiKey' | 'basic';
        token?: string;
        apiKey?: string;
        apiKeyHeader?: string;
        username?: string;
        password?: string;
    };
    timeout?: number; // Request timeout in ms
    retries?: number; // Number of retries
}

export interface ValidationNodeData extends BaseNodeData {
    type: 'validation';
    rules?: Array<{
        field: string;
        condition: 'required' | 'type' | 'regex' | 'min' | 'max';
        value?: string;
        errorMessage?: string;
    }>;
}

export interface TransformationNodeData extends BaseNodeData {
    type: 'transformation';
    transformations?: Array<{
        target: string;
        source: string;
        transform?: string; // JS expression
    }>;
}

export interface ResponseNodeData extends BaseNodeData {
    type: 'response';
    statusCode?: number;
    headers?: Array<{ key: string; value: string }>;
    bodyTemplate?: string; // JSON template with {{variables}}
}

export interface StateNodeData extends BaseNodeData {
    type: 'state';
    operation?: 'get' | 'set';
    key?: string;
    value?: string;
}

export interface ConditionalNodeData extends BaseNodeData {
    type: 'conditional';
    condition?: string; // JS expression
    trueLabel?: string;
    falseLabel?: string;
}

export type NodeData =
    | RequestNodeData
    | ValidationNodeData
    | TransformationNodeData
    | ResponseNodeData
    | StateNodeData
    | ConditionalNodeData;
