import { Redis } from '@upstash/redis';

/**
 * Redis client for caching and rate limiting
 * Uses Upstash Redis for serverless compatibility
 */

// Initialize Redis client
let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
    if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
        console.warn('[Redis] Missing UPSTASH_REDIS_URL or UPSTASH_REDIS_TOKEN. Redis features disabled.');
        return null;
    }

    if (!redisClient) {
        redisClient = new Redis({
            url: process.env.UPSTASH_REDIS_URL,
            token: process.env.UPSTASH_REDIS_TOKEN,
        });
    }

    return redisClient;
}

// Configuration
const WORKFLOW_TTL = parseInt(process.env.REDIS_WORKFLOW_TTL || '3600'); // 1 hour
const DEPLOYED_TTL = parseInt(process.env.REDIS_DEPLOYED_TTL || '60'); // short TTL doubles as invalidation
const STATE_TTL = parseInt(process.env.REDIS_STATE_TTL || '3600'); // 1 hour
const RATELIMIT_MAX = parseInt(process.env.REDIS_RATELIMIT_MAX || '100'); // 100 requests
const RATELIMIT_WINDOW = parseInt(process.env.REDIS_RATELIMIT_WINDOW || '60'); // 60 seconds
const API_CACHE_TTL = parseInt(process.env.REDIS_API_CACHE_TTL || '300'); // 5 minutes

/**
 * Cache a workflow definition
 */
export async function cacheWorkflow(workflowId: string, workflow: any): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
        await redis.setex(`workflow:${workflowId}`, WORKFLOW_TTL, JSON.stringify(workflow));
        console.log(`[Redis] Cached workflow: ${workflowId}`);
    } catch (error) {
        console.error('[Redis] Error caching workflow:', error);
    }
}

/**
 * Get cached workflow
 */
export async function getCachedWorkflow(workflowId: string): Promise<any | null> {
    const redis = getRedisClient();
    if (!redis) return null;

    try {
        const cached = await redis.get(`workflow:${workflowId}`);
        if (cached) {
            console.log(`[Redis] Cache hit for workflow: ${workflowId}`);
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
        console.log(`[Redis] Cache miss for workflow: ${workflowId}`);
        return null;
    } catch (error) {
        console.error('[Redis] Error getting cached workflow:', error);
        return null;
    }
}

/**
 * Invalidate workflow cache
 */
export async function invalidateWorkflowCache(workflowId: string): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
        await redis.del(`workflow:${workflowId}`);
        console.log(`[Redis] Invalidated cache for workflow: ${workflowId}`);
    } catch (error) {
        console.error('[Redis] Error invalidating workflow cache:', error);
    }
}

/**
 * Cache the full workflow JSON for a deployed route. Short TTL (default 60s)
 * doubles as invalidation after save/deploy/undeploy.
 */
export async function cacheDeployedWorkflow(
    workspace: string,
    method: string,
    path: string,
    workflow: any
): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
        const key = `deployed:${workspace}:${method}:${path}`;
        await redis.setex(key, DEPLOYED_TTL, JSON.stringify(workflow));
    } catch (error) {
        console.error('[Redis] Error caching deployed workflow:', error);
    }
}

/**
 * Get the cached workflow for a deployed route
 */
export async function getCachedDeployedWorkflow(
    workspace: string,
    method: string,
    path: string
): Promise<any | null> {
    const redis = getRedisClient();
    if (!redis) return null;

    try {
        const key = `deployed:${workspace}:${method}:${path}`;
        const cached = await redis.get(key);
        if (cached) {
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
        return null;
    } catch (error) {
        console.error('[Redis] Error getting cached deployed workflow:', error);
        return null;
    }
}

/**
 * Persistent state for State nodes, namespaced per workspace.
 * Enables stateful mocks across requests (e.g. POST then GET a resource).
 */
export async function getWorkflowState(workspace: string, key: string): Promise<any> {
    const redis = getRedisClient();
    if (!redis) return undefined;

    try {
        const value = await redis.get(`state:${workspace}:${key}`);
        if (value === null || value === undefined) return undefined;
        return typeof value === 'string' ? JSON.parse(value) : value;
    } catch (error) {
        console.error('[Redis] Error reading workflow state:', error);
        return undefined;
    }
}

export async function setWorkflowState(workspace: string, key: string, value: any): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
        await redis.setex(`state:${workspace}:${key}`, STATE_TTL, JSON.stringify(value ?? null));
    } catch (error) {
        console.error('[Redis] Error writing workflow state:', error);
    }
}

/**
 * Invalidate deployed workflow cache
 */
export async function invalidateDeployedWorkflowCache(
    workspace: string,
    method: string,
    path: string
): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
        const key = `deployed:${workspace}:${method}:${path}`;
        await redis.del(key);
        console.log(`[Redis] Invalidated deployed workflow cache: ${key}`);
    } catch (error) {
        console.error('[Redis] Error invalidating deployed workflow cache:', error);
    }
}

/**
 * Check rate limit for IP and endpoint
 */
export async function checkRateLimit(
    ip: string,
    endpoint: string,
    maxRequests: number = RATELIMIT_MAX
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const redis = getRedisClient();

    // If Redis is not available, allow the request
    if (!redis) {
        return { allowed: true, remaining: maxRequests, resetIn: RATELIMIT_WINDOW };
    }

    try {
        const key = `ratelimit:${ip}:${endpoint}`;
        const current = await redis.incr(key);

        // Set expiry on first request
        if (current === 1) {
            await redis.expire(key, RATELIMIT_WINDOW);
        }

        const ttl = await redis.ttl(key);
        const remaining = Math.max(0, maxRequests - current);
        const allowed = current <= maxRequests;

        if (!allowed) {
            console.warn(`[Redis] Rate limit exceeded for ${ip} on ${endpoint}: ${current}/${maxRequests}`);
        }

        return {
            allowed,
            remaining,
            resetIn: ttl > 0 ? ttl : RATELIMIT_WINDOW,
        };
    } catch (error) {
        console.error('[Redis] Error checking rate limit:', error);
        // On error, allow the request
        return { allowed: true, remaining: maxRequests, resetIn: RATELIMIT_WINDOW };
    }
}

/**
 * Cache API response
 */
export async function cacheApiResponse(
    method: string,
    url: string,
    bodyHash: string,
    response: any
): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
        const key = `api-cache:${method}:${url}:${bodyHash}`;
        await redis.setex(key, API_CACHE_TTL, JSON.stringify(response));
        console.log(`[Redis] Cached API response: ${key}`);
    } catch (error) {
        console.error('[Redis] Error caching API response:', error);
    }
}

/**
 * Get cached API response
 */
export async function getCachedApiResponse(
    method: string,
    url: string,
    bodyHash: string
): Promise<any | null> {
    const redis = getRedisClient();
    if (!redis) return null;

    try {
        const key = `api-cache:${method}:${url}:${bodyHash}`;
        const cached = await redis.get(key);
        if (cached) {
            console.log(`[Redis] Cache hit for API response: ${key}`);
            return typeof cached === 'string' ? JSON.parse(cached) : cached;
        }
        return null;
    } catch (error) {
        console.error('[Redis] Error getting cached API response:', error);
        return null;
    }
}

/**
 * Health check for Redis connection
 */
export async function checkRedisHealth(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    const redis = getRedisClient();

    if (!redis) {
        return { healthy: false, error: 'Redis not configured' };
    }

    try {
        const start = Date.now();
        await redis.ping();
        const latency = Date.now() - start;

        return { healthy: true, latency };
    } catch (error: any) {
        return { healthy: false, error: error.message };
    }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
    workflowCacheSize: number;
    deployedCacheSize: number;
    rateLimitKeys: number;
    apiCacheSize: number;
} | null> {
    const redis = getRedisClient();
    if (!redis) return null;

    try {
        // Note: This is an approximation using SCAN
        // In production, you might want to use Redis INFO command
        const workflowKeys = await redis.keys('workflow:*');
        const deployedKeys = await redis.keys('deployed:*');
        const rateLimitKeys = await redis.keys('ratelimit:*');
        const apiCacheKeys = await redis.keys('api-cache:*');

        return {
            workflowCacheSize: Array.isArray(workflowKeys) ? workflowKeys.length : 0,
            deployedCacheSize: Array.isArray(deployedKeys) ? deployedKeys.length : 0,
            rateLimitKeys: Array.isArray(rateLimitKeys) ? rateLimitKeys.length : 0,
            apiCacheSize: Array.isArray(apiCacheKeys) ? apiCacheKeys.length : 0,
        };
    } catch (error) {
        console.error('[Redis] Error getting cache stats:', error);
        return null;
    }
}
