import type { Handler } from '@netlify/functions';
import { executeMock } from '../../src/mockEngine.js';

export const handler: Handler = async (event, context) => {
    const path = event.path.replace('/.netlify/functions/execute', '').replace('/api/execute', '');
    // Expected path format: /:mockId/:path*

    const parts = path.split('/').filter(Boolean);
    if (parts.length < 1) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing mockId' }),
        };
    }

    const mockId = parts[0];
    const actualPath = '/' + parts.slice(1).join('/');

    try {
        const result = await executeMock({
            mockId,
            path: actualPath,
            method: event.httpMethod || 'GET',
            body: event.body ? JSON.parse(event.body) : {},
            headers: event.headers,
        });

        return result;
    } catch (err: any) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', details: err.message }),
        };
    }
};
