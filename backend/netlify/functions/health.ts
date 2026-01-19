import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { checkRedisHealth, getCacheStats } from '../../src/lib/redis.js';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    // Health check endpoint with Redis status
    const redisHealth = await checkRedisHealth();
    const cacheStats = await getCacheStats();

    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'mockflow-backend',
        version: '1.0.0',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        redis: redisHealth,
        cache: cacheStats,
    };

    return {
        statusCode: redisHealth.healthy ? 200 : 503,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(health),
    };
};
