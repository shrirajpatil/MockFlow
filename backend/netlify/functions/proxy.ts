import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import axios, { type AxiosRequestConfig } from 'axios';
import { checkRateLimit, cacheApiResponse, getCachedApiResponse } from '../../src/lib/redis.js';
import crypto from 'crypto';


interface ProxyRequest {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    headers?: Record<string, string>;
    body?: any;
    auth?: {
        type: 'none' | 'bearer' | 'apiKey' | 'basic';
        token?: string;
        apiKey?: string;
        apiKeyHeader?: string;
        username?: string;
        password?: string;
    };
    timeout?: number;
    tunnelConfig?: {
        ngrokToken?: string;
    };
}

/**
 * CORS Configuration
 */
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://localhost:3000',
];

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Will be set dynamically
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
};

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | undefined): boolean {
    if (!origin) return false;

    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development') {
        return origin.includes('localhost') || origin.includes('127.0.0.1');
    }

    // In production, check against whitelist
    return ALLOWED_ORIGINS.some(allowed => origin === allowed || origin.endsWith(allowed));
}

/**
 * Get CORS headers for response
 */
function getCorsHeaders(origin: string | undefined): Record<string, string> {
    const allowedOrigin = origin && isOriginAllowed(origin) ? origin : (ALLOWED_ORIGINS[0] || '*');

    return {
        ...CORS_HEADERS,
        'Access-Control-Allow-Origin': allowedOrigin,
    };
}

/**
 * Check if a URL is local (localhost or 127.0.0.1)
 */
function isLocalURL(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname === 'localhost' ||
            urlObj.hostname === '127.0.0.1' ||
            urlObj.hostname.endsWith('.local');
    } catch {
        return false;
    }
}

/**
 * Validate request payload
 */
function validateRequest(config: any): { valid: boolean; error?: string } {
    if (!config.method) {
        return { valid: false, error: 'Method is required' };
    }

    if (!config.url) {
        return { valid: false, error: 'URL is required' };
    }

    // Validate URL format
    try {
        new URL(config.url);
    } catch {
        return { valid: false, error: 'Invalid URL format' };
    }

    // Check for suspicious patterns (basic security)
    const suspiciousPatterns = [
        'file://',
        'javascript:',
        'data:',
    ];

    if (suspiciousPatterns.some(pattern => config.url.toLowerCase().includes(pattern))) {
        return { valid: false, error: 'Invalid URL scheme' };
    }

    return { valid: true };
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    const origin = event.headers.origin || event.headers.Origin;
    const corsHeaders = getCorsHeaders(origin);

    // Handle OPTIONS preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: corsHeaders,
            body: '',
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    // Check origin
    if (!isOriginAllowed(origin)) {
        return {
            statusCode: 403,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                error: 'Origin not allowed',
                message: 'This origin is not whitelisted for API access'
            }),
        };
    }

    try {
        // 1. Rate Limiting Check
        const clientIp = event.headers['client-ip'] || event.headers['x-nf-client-connection-ip'] || 'anonymous';
        const rateLimit = await checkRateLimit(clientIp, 'proxy');

        if (!rateLimit.allowed) {
            return {
                statusCode: 429,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                    'Retry-After': rateLimit.resetIn.toString(),
                },
                body: JSON.stringify({
                    error: 'Rate limit exceeded',
                    message: `Please try again in ${rateLimit.resetIn} seconds.`,
                    remaining: rateLimit.remaining,
                }),
            };
        }

        const config: ProxyRequest = JSON.parse(event.body || '{}');

        // Validate request
        const validation = validateRequest(config);
        if (!validation.valid) {
            return {
                statusCode: 400,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ error: validation.error }),
            };
        }

        // 2. Check Cache for GET requests
        const bodyHash = crypto.createHash('md5').update(event.body || '').digest('hex');
        if (config.method === 'GET') {
            const cached = await getCachedApiResponse(config.method, config.url, bodyHash);
            if (cached) {
                return {
                    statusCode: 200,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                        'X-Cache': 'HIT',
                    },
                    body: JSON.stringify({ ...cached, cached: true }),
                };
            }
        }

        // 3. Resolve Local URL / Tunnel
        if (isLocalURL(config.url)) {
            if (!config.tunnelConfig?.ngrokToken) {
                return {
                    statusCode: 400,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        error: 'Local API tunnel not configured',
                        message: 'To test local APIs, please configure your ngrok token in the Tunnel settings (top-right toolbar)',
                        details: 'Click the Tunnel button → Enter your ngrok auth token → Save',
                    }),
                };
            }
            console.log('Tunnel token provided, would create tunnel here');
        }

        // 4. Build axios config & Execute
        const axiosConfig: AxiosRequestConfig = {
            method: config.method,
            url: config.url,
            headers: { ...config.headers },
            data: config.body,
            timeout: config.timeout || 30000,
            validateStatus: () => true,
        };

        if (config.auth) {
            switch (config.auth.type) {
                case 'bearer':
                    if (config.auth.token) axiosConfig.headers!['Authorization'] = `Bearer ${config.auth.token}`;
                    break;
                case 'apiKey':
                    if (config.auth.apiKey && config.auth.apiKeyHeader) axiosConfig.headers![config.auth.apiKeyHeader] = config.auth.apiKey;
                    break;
                case 'basic':
                    if (config.auth.username && config.auth.password) {
                        const credentials = Buffer.from(`${config.auth.username}:${config.auth.password}`).toString('base64');
                        axiosConfig.headers!['Authorization'] = `Basic ${credentials}`;
                    }
                    break;
            }
        }

        const startTime = Date.now();
        const response = await axios(axiosConfig);
        const duration = Date.now() - startTime;

        const responseData = {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            body: response.data,
            duration,
        };

        // 5. Cache successful GET responses
        if (config.method === 'GET' && response.status >= 200 && response.status < 300) {
            await cacheApiResponse(config.method, config.url, bodyHash, responseData);
        }

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'X-Cache': 'MISS',
                'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            },
            body: JSON.stringify(responseData),
        };
    } catch (error: any) {
        console.error('Proxy error:', error);

        return {
            statusCode: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                error: error.message || 'Proxy request failed',
                details: error.response?.data,
            }),
        };
    }
};
