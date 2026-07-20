import type { Handler } from '@netlify/functions';
import { executeMock } from '../../src/mockEngine.js';
import { checkRateLimit } from '../../src/lib/redis.js';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

// Deployed mocks are public HTTP endpoints with no auth in front of them, so
// this is the one guard standing between a launch-day traffic spike (or an
// abusive caller) and Supabase/Redis getting hammered. Higher ceiling than
// the proxy's limit since legitimate mock traffic (frontend dev loops,
// integration tests) is bursty by nature.
const EXECUTE_RATELIMIT_MAX = parseInt(process.env.REDIS_EXECUTE_RATELIMIT_MAX || '300', 10);

/**
 * Serves deployed mock APIs.
 * URL shape: /api/{workspace}/{...path} (see netlify.toml redirect)
 */
export const handler: Handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }

    const path = event.path
        .replace('/.netlify/functions/execute', '')
        .replace(/^\/api/, '');

    const parts = path.split('/').filter(Boolean);
    if (parts.length < 1) {
        return {
            statusCode: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Missing workspace',
                usage: '/api/{workspace}/{endpoint-path}',
            }),
        };
    }

    const workspace = decodeURIComponent(parts[0]!);
    const actualPath = '/' + parts.slice(1).join('/');

    const clientIp = event.headers['client-ip'] || event.headers['x-nf-client-connection-ip'] || 'anonymous';
    const rateLimit = await checkRateLimit(clientIp, 'execute', EXECUTE_RATELIMIT_MAX);
    if (!rateLimit.allowed) {
        return {
            statusCode: 429,
            headers: {
                ...CORS_HEADERS,
                'Content-Type': 'application/json',
                'Retry-After': rateLimit.resetIn.toString(),
            },
            body: JSON.stringify({
                error: 'Rate limit exceeded',
                message: `Please try again in ${rateLimit.resetIn} seconds.`,
            }),
        };
    }

    let body: any = null;
    if (event.body) {
        try {
            body = JSON.parse(event.body);
        } catch {
            body = event.body; // non-JSON bodies pass through as raw text
        }
    }

    try {
        const result = await executeMock({
            workspace,
            path: actualPath,
            method: event.httpMethod || 'GET',
            body,
            headers: (event.headers || {}) as Record<string, string>,
            query: (event.queryStringParameters || {}) as Record<string, any>,
        });

        return {
            ...result,
            headers: { ...CORS_HEADERS, ...result.headers },
        };
    } catch (err: any) {
        console.error('[Execute] Unhandled error:', err);
        return {
            statusCode: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
