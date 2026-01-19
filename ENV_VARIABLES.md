# MockFlow Environment Variables

## Required Variables

### NEXT_PUBLIC_SUPABASE_URL
- **Description**: Your Supabase project URL
- **Example**: `https://abcdefghijklmnop.supabase.co`
- **Where to get**: Supabase Dashboard → Settings → API → Project URL
- **Required**: Yes

### NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Description**: Supabase anonymous (public) key
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to get**: Supabase Dashboard → Settings → API → Project API keys → anon public
- **Required**: Yes
- **Security**: Safe to expose to client

## Optional Variables

### NEXT_PUBLIC_BACKEND_URL
- **Description**: Backend API URL (ngrok tunnel or deployed backend)
- **Example**: `https://your-backend.netlify.app`
- **Default**: Uses relative paths if not set
- **Required**: No (but recommended for production)

### NEXT_PUBLIC_APP_URL
- **Description**: Your application's public URL
- **Example**: `https://mockflow.com`
- **Default**: `window.location.origin` or `http://localhost:3000`
- **Required**: No (but recommended for production)

### NEXT_PUBLIC_ENVIRONMENT
- **Description**: Current environment
- **Values**: `development`, `staging`, `production`
- **Default**: `development`
- **Required**: No

### NEXT_PUBLIC_SENTRY_DSN
- **Description**: Sentry error tracking DSN
- **Example**: `https://abc123@o123456.ingest.sentry.io/7654321`
- **Where to get**: Sentry Dashboard → Settings → Projects → [Your Project] → Client Keys (DSN)
- **Required**: No (but recommended for production)

### NEXT_PUBLIC_ANALYTICS_ID
- **Description**: Analytics tracking ID (Google Analytics, Plausible, etc.)
- **Example**: `G-XXXXXXXXXX` or `your-domain.com`
- **Required**: No

## Server-Side Only Variables

⚠️ **NEVER expose these to the client!**

### SUPABASE_SERVICE_KEY
- **Description**: Supabase service role key (admin access)
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to get**: Supabase Dashboard → Settings → API → Project API keys → service_role
- **Required**: No (only for admin operations)
- **Security**: ⚠️ KEEP SECRET! Full database access

### UPSTASH_REDIS_URL
- **Description**: Redis database URL for caching
- **Example**: `https://your-redis.upstash.io`
- **Where to get**: Upstash Dashboard → Your Database → REST API → UPSTASH_REDIS_REST_URL
- **Required**: No (caching is optional)

### UPSTASH_REDIS_TOKEN
- **Description**: Redis authentication token
- **Example**: `AXXXAAIncDE...`
- **Where to get**: Upstash Dashboard → Your Database → REST API → UPSTASH_REDIS_REST_TOKEN
- **Required**: No (required if using Redis)

### JWT_SECRET
- **Description**: Secret key for JWT token signing
- **Example**: `your-very-long-random-secret-at-least-32-characters-long`
- **Generate**: `openssl rand -base64 32`
- **Required**: No (only if implementing custom auth)
- **Security**: Must be at least 32 characters

### ALLOWED_ORIGINS
- **Description**: Comma-separated list of allowed CORS origins
- **Example**: `https://mockflow.com,https://www.mockflow.com`
- **Default**: All origins allowed in development
- **Required**: No (but recommended for production)

### RATE_LIMIT_MAX
- **Description**: Maximum number of requests per window
- **Example**: `100`
- **Default**: `100`
- **Required**: No

### RATE_LIMIT_WINDOW
- **Description**: Rate limit window in milliseconds
- **Example**: `60000` (1 minute)
- **Default**: `60000`
- **Required**: No

## Setup Instructions

### Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in required variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Start development server:
   ```bash
   npm run dev
   ```

### Production

1. Set all environment variables in your hosting platform:
   - **Vercel**: Settings → Environment Variables
   - **Netlify**: Site settings → Build & deploy → Environment

2. Required for production:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BACKEND_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_ENVIRONMENT=production`
   - `NEXT_PUBLIC_SENTRY_DSN` (recommended)
   - `ALLOWED_ORIGINS`

3. Deploy:
   ```bash
   npm run build
   npm start
   ```

## Validation

The app validates all environment variables on startup using Zod schemas. If validation fails, you'll see detailed error messages indicating which variables are missing or invalid.

## Security Best Practices

1. ✅ **Never commit `.env.local`** to version control
2. ✅ **Use different keys** for development and production
3. ✅ **Rotate secrets** regularly
4. ✅ **Keep service keys** server-side only
5. ✅ **Use environment-specific** configurations
6. ⚠️ **Never expose** `SUPABASE_SERVICE_KEY` to client
7. ⚠️ **Never expose** `JWT_SECRET` to client

## Troubleshooting

### Error: "Environment validation failed"
- Check that all required variables are set
- Verify URLs are valid (include `https://`)
- Ensure keys are copied correctly (no extra spaces)

### Error: "Invalid Supabase URL"
- URL must start with `https://`
- URL must end with `.supabase.co`
- Check for typos

### Error: "JWT secret must be at least 32 characters"
- Generate a longer secret: `openssl rand -base64 32`
- Or use a password manager to generate a random string

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Sentry Setup Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
