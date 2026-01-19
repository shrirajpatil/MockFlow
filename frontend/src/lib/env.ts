import { z } from 'zod';

/**
 * Environment variable schema for production validation
 */
const envSchema = z.object({
    // Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),

    // Backend Configuration
    NEXT_PUBLIC_BACKEND_URL: z.string().url('Invalid backend URL').optional(),

    // Application Configuration
    NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL').optional(),
    NEXT_PUBLIC_ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),

    // Monitoring (Optional)
    NEXT_PUBLIC_SENTRY_DSN: z.string().url('Invalid Sentry DSN').optional(),
    NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
});

/**
 * Server-side environment schema (for API routes)
 */
const serverEnvSchema = z.object({
    // Supabase Service Key (server-side only)
    SUPABASE_SERVICE_KEY: z.string().min(1).optional(),

    // Redis Configuration
    UPSTASH_REDIS_URL: z.string().url().optional(),
    UPSTASH_REDIS_TOKEN: z.string().optional(),

    // Security
    JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters').optional(),
    ALLOWED_ORIGINS: z.string().optional(),

    // Rate Limiting
    RATE_LIMIT_MAX: z.coerce.number().positive().default(100),
    RATE_LIMIT_WINDOW: z.coerce.number().positive().default(60000),
});

export type Env = z.infer<typeof envSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validate and parse environment variables
 * Throws error if validation fails
 */
export function validateEnv(): Env {
    try {
        return envSchema.parse({
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
            NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
            NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
            NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
            NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
            throw new Error(
                `Environment validation failed:\n${issues.join('\n')}\n\nPlease check your .env.local file.`
            );
        }
        throw error;
    }
}

/**
 * Validate server-side environment variables
 */
export function validateServerEnv(): ServerEnv {
    try {
        return serverEnvSchema.parse({
            SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
            UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL,
            UPSTASH_REDIS_TOKEN: process.env.UPSTASH_REDIS_TOKEN,
            JWT_SECRET: process.env.JWT_SECRET,
            ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
            RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
            RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
            console.error(`Server environment validation failed:\n${issues.join('\n')}`);
            // Don't throw in server context, just log
            return serverEnvSchema.parse({});
        }
        throw error;
    }
}

/**
 * Get validated environment variables (cached)
 */
let cachedEnv: Env | null = null;

export function getEnv(): Env {
    if (!cachedEnv) {
        cachedEnv = validateEnv();
    }
    return cachedEnv;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
    return getEnv().NEXT_PUBLIC_ENVIRONMENT === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
    return getEnv().NEXT_PUBLIC_ENVIRONMENT === 'development';
}

/**
 * Get app URL with fallback
 */
export function getAppUrl(): string {
    const env = getEnv();
    return env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
}
