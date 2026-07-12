import { Node, Edge } from 'reactflow';

/**
 * Built-in workflow templates for the "New from template" gallery.
 * Each template is a ready-to-run workflow: Test it in the editor, then
 * Save + Deploy to serve it at /api/{workspace}{path}.
 */

export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    nodes: Node[];
    edges: Edge[];
}

export const templates: WorkflowTemplate[] = [
    {
        id: 'users-list',
        name: 'Simple GET endpoint',
        description: 'GET /users returns a static list of users. The smallest possible mock.',
        nodes: [
            {
                id: 'request-1',
                type: 'request',
                position: { x: 250, y: 50 },
                data: { label: 'GET /users', type: 'request', method: 'GET', path: '/users' },
            },
            {
                id: 'response-1',
                type: 'response',
                position: { x: 250, y: 250 },
                data: {
                    label: 'Users list',
                    type: 'response',
                    statusCode: 200,
                    headers: [{ key: 'Content-Type', value: 'application/json' }],
                    bodyTemplate: JSON.stringify(
                        {
                            users: [
                                { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
                                { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
                            ],
                            total: 2,
                        },
                        null,
                        2
                    ),
                },
            },
        ],
        edges: [{ id: 'e1', source: 'request-1', target: 'response-1' }],
    },
    {
        id: 'user-registration',
        name: 'POST with validation',
        description: 'POST /users validates the body (name + email required) and echoes the new user back with 201.',
        nodes: [
            {
                id: 'request-1',
                type: 'request',
                position: { x: 250, y: 50 },
                data: { label: 'POST /users', type: 'request', method: 'POST', path: '/users' },
            },
            {
                id: 'validation-1',
                type: 'validation',
                position: { x: 250, y: 220 },
                data: {
                    label: 'Validate input',
                    type: 'validation',
                    rules: [
                        { field: 'name', condition: 'required', errorMessage: 'name is required' },
                        { field: 'email', condition: 'required', errorMessage: 'email is required' },
                        { field: 'email', condition: 'regex', value: '^[^@]+@[^@]+\\.[^@]+$', errorMessage: 'email must be valid' },
                    ],
                },
            },
            {
                id: 'transform-1',
                type: 'transformation',
                position: { x: 250, y: 390 },
                data: {
                    label: 'Build user',
                    type: 'transformation',
                    transformations: [
                        { target: 'user.name', source: 'request.body.name' },
                        { target: 'user.email', source: 'request.body.email' },
                    ],
                },
            },
            {
                id: 'response-1',
                type: 'response',
                position: { x: 250, y: 560 },
                data: {
                    label: 'Created',
                    type: 'response',
                    statusCode: 201,
                    headers: [{ key: 'Content-Type', value: 'application/json' }],
                    bodyTemplate: '{\n  "id": 101,\n  "user": {{variables.user}},\n  "created": true\n}',
                },
            },
        ],
        edges: [
            { id: 'e1', source: 'request-1', target: 'validation-1' },
            { id: 'e2', source: 'validation-1', target: 'transform-1' },
            { id: 'e3', source: 'transform-1', target: 'response-1' },
        ],
    },
    {
        id: 'conditional-auth',
        name: 'Conditional branching',
        description: 'POST /login returns 200 when the password matches, 401 otherwise — shows true/false branches.',
        nodes: [
            {
                id: 'request-1',
                type: 'request',
                position: { x: 250, y: 50 },
                data: { label: 'POST /login', type: 'request', method: 'POST', path: '/login' },
            },
            {
                id: 'conditional-1',
                type: 'conditional',
                position: { x: 250, y: 220 },
                data: {
                    label: 'Check password',
                    type: 'conditional',
                    condition: "request.body.password == 'secret123'",
                    trueLabel: 'Authorized',
                    falseLabel: 'Denied',
                },
            },
            {
                id: 'response-ok',
                type: 'response',
                position: { x: 80, y: 420 },
                data: {
                    label: 'Authorized',
                    type: 'response',
                    statusCode: 200,
                    headers: [{ key: 'Content-Type', value: 'application/json' }],
                    bodyTemplate: '{\n  "token": "mock-jwt-token",\n  "user": {{request.body.username}}\n}',
                },
            },
            {
                id: 'response-denied',
                type: 'response',
                position: { x: 420, y: 420 },
                data: {
                    label: 'Denied',
                    type: 'response',
                    statusCode: 401,
                    headers: [{ key: 'Content-Type', value: 'application/json' }],
                    bodyTemplate: '{\n  "error": "Invalid credentials"\n}',
                },
            },
        ],
        edges: [
            { id: 'e1', source: 'request-1', target: 'conditional-1' },
            { id: 'e2', source: 'conditional-1', sourceHandle: 'true', target: 'response-ok' },
            { id: 'e3', source: 'conditional-1', sourceHandle: 'false', target: 'response-denied' },
        ],
    },
    {
        id: 'stateful-resource',
        name: 'Stateful mock (save + read)',
        description: 'POST /profile stores the request body; GET /profile returns whatever was last saved. One workflow, two endpoints.',
        nodes: [
            {
                id: 'request-save',
                type: 'request',
                position: { x: 80, y: 50 },
                data: { label: 'POST /profile', type: 'request', method: 'POST', path: '/profile' },
            },
            {
                id: 'state-set',
                type: 'state',
                position: { x: 80, y: 220 },
                data: { label: 'Save profile', type: 'state', operation: 'set', key: 'profile', value: '{{request.body}}' },
            },
            {
                id: 'response-saved',
                type: 'response',
                position: { x: 80, y: 390 },
                data: {
                    label: 'Saved',
                    type: 'response',
                    statusCode: 201,
                    headers: [{ key: 'Content-Type', value: 'application/json' }],
                    bodyTemplate: '{\n  "saved": true,\n  "profile": {{state.profile}}\n}',
                },
            },
            {
                id: 'request-read',
                type: 'request',
                position: { x: 420, y: 50 },
                data: { label: 'GET /profile', type: 'request', method: 'GET', path: '/profile' },
            },
            {
                id: 'state-get',
                type: 'state',
                position: { x: 420, y: 220 },
                data: { label: 'Load profile', type: 'state', operation: 'get', key: 'profile' },
            },
            {
                id: 'response-profile',
                type: 'response',
                position: { x: 420, y: 390 },
                data: {
                    label: 'Profile',
                    type: 'response',
                    statusCode: 200,
                    headers: [{ key: 'Content-Type', value: 'application/json' }],
                    bodyTemplate: '{\n  "profile": {{state.profile}}\n}',
                },
            },
        ],
        edges: [
            { id: 'e1', source: 'request-save', target: 'state-set' },
            { id: 'e2', source: 'state-set', target: 'response-saved' },
            { id: 'e3', source: 'request-read', target: 'state-get' },
            { id: 'e4', source: 'state-get', target: 'response-profile' },
        ],
    },
];
