import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface HTTPRequestConfig {
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
    retries?: number;
}

export interface HTTPResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
    duration: number;
}

/**
 * Make a real HTTP request with authentication and retry logic
 */
export async function makeHTTPRequest(config: HTTPRequestConfig): Promise<HTTPResponse> {
    const startTime = Date.now();

    // Build axios config
    const axiosConfig: AxiosRequestConfig = {
        method: config.method,
        url: config.url,
        headers: { ...config.headers },
        data: config.body,
        timeout: config.timeout || 30000, // 30 seconds default
        validateStatus: () => true, // Don't throw on any status code
    };

    // Add authentication
    if (config.auth) {
        switch (config.auth.type) {
            case 'bearer':
                if (config.auth.token) {
                    axiosConfig.headers!['Authorization'] = `Bearer ${config.auth.token}`;
                }
                break;
            case 'apiKey':
                if (config.auth.apiKey && config.auth.apiKeyHeader) {
                    axiosConfig.headers![config.auth.apiKeyHeader] = config.auth.apiKey;
                }
                break;
            case 'basic':
                if (config.auth.username && config.auth.password) {
                    const credentials = btoa(`${config.auth.username}:${config.auth.password}`);
                    axiosConfig.headers!['Authorization'] = `Basic ${credentials}`;
                }
                break;
        }
    }

    // Retry logic
    const maxRetries = config.retries || 0;
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response: AxiosResponse = await axios(axiosConfig);
            const duration = Date.now() - startTime;

            return {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers as Record<string, string>,
                body: response.data,
                duration,
            };
        } catch (error: any) {
            lastError = error;

            // Don't retry on client errors (4xx)
            if (error.response && error.response.status >= 400 && error.response.status < 500) {
                break;
            }

            // Wait before retry (exponential backoff)
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    // If all retries failed, return error response
    const duration = Date.now() - startTime;

    if (lastError.response) {
        return {
            status: lastError.response.status,
            statusText: lastError.response.statusText,
            headers: lastError.response.headers,
            body: lastError.response.data,
            duration,
        };
    }

    // Network error or timeout
    throw new Error(lastError.message || 'Network error');
}

/**
 * Make a request through the proxy (for local APIs to avoid CORS)
 */
export async function makeProxiedRequest(config: HTTPRequestConfig): Promise<HTTPResponse> {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        const proxyUrl = backendUrl ? `${backendUrl}/backend/proxy` : '/.netlify/functions/proxy';

        const response = await axios.post(proxyUrl, config);
        return response.data;
    } catch (error: any) {
        throw new Error(`Proxy error: ${error.message}`);
    }
}

/**
 * Determine if a URL is local (localhost or 127.0.0.1)
 */
export function isLocalURL(url: string): boolean {
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
 * Smart HTTP request that automatically uses proxy for local URLs
 */
export async function smartHTTPRequest(config: HTTPRequestConfig): Promise<HTTPResponse> {
    if (isLocalURL(config.url)) {
        // Use proxy for local URLs to avoid CORS
        return makeProxiedRequest(config);
    } else {
        // Direct request for remote URLs
        return makeHTTPRequest(config);
    }
}
