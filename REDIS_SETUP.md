# Redis Setup Guide for MockFlow

## Quick Start

### 1. Create Upstash Redis Database

1. Go to [Upstash Console](https://console.upstash.com/)
2. Click "Create Database"
3. Choose:
   - **Name**: mockflow-cache
   - **Type**: Regional
   - **Region**: Choose closest to your users
   - **Plan**: Free (10K commands/day)
4. Click "Create"

### 2. Get Credentials

After creating the database:
1. Click on your database
2. Scroll to "REST API" section
3. Copy:
   - **UPSTASH_REDIS_REST_URL**
   - **UPSTASH_REDIS_REST_TOKEN**

### 3. Configure Environment Variables

#### Backend (.env)
```bash
# Redis Configuration
UPSTASH_REDIS_URL=https://your-redis.upstash.io
UPSTASH_REDIS_TOKEN=your-redis-token

# Optional: Tune Redis settings
REDIS_WORKFLOW_TTL=3600        # Workflow cache TTL (seconds)
REDIS_RATELIMIT_MAX=100        # Max requests per window
REDIS_RATELIMIT_WINDOW=60      # Rate limit window (seconds)
REDIS_API_CACHE_TTL=300        # API response cache TTL (seconds)
```

#### Frontend (.env.local)
```bash
# No Redis config needed in frontend
# Redis is only used in backend/serverless functions
```

### 4. Test Redis Connection

```bash
# Test health endpoint
curl http://localhost:8888/.netlify/functions/health

# Expected response:
{
  "status": "healthy",
  "redis": {
    "healthy": true,
    "latency": 45
  },
  "cache": {
    "workflowCacheSize": 0,
    "deployedCacheSize": 0,
    "rateLimitKeys": 0,
    "apiCacheSize": 0
  }
}
```

---

## What Redis Caches

### 1. Workflow Definitions
- **Key**: `workflow:{workflowId}`
- **TTL**: 1 hour
- **Purpose**: Avoid DB queries on every execution
- **Invalidated**: On workflow update/delete

### 2. Deployed Workflow Lookup
- **Key**: `deployed:{workspace}:{method}:{path}`
- **TTL**: 1 hour
- **Purpose**: Fast endpoint resolution
- **Invalidated**: On deploy/undeploy

### 3. Rate Limiting
- **Key**: `ratelimit:{ip}:{endpoint}`
- **TTL**: 1 minute
- **Purpose**: Prevent API abuse
- **Limit**: 100 requests/minute per IP

### 4. API Response Cache
- **Key**: `api-cache:{method}:{url}:{bodyHash}`
- **TTL**: 5 minutes
- **Purpose**: Cache external API calls
- **Invalidated**: Automatically after TTL

---

## Performance Impact

### Without Redis
```
Request → Supabase Query (50ms)
       → Supabase Query (50ms)
       → Supabase Query (50ms)
Total: ~150ms + execution time
```

### With Redis (90% cache hit rate)
```
Request → Redis Get (5ms) ✅ Cache Hit!
Total: ~5ms + execution time
```

**Result**: 30x faster endpoint resolution!

---

## Monitoring

### Cache Hit Rate
```bash
# Check cache stats
curl http://localhost:8888/.netlify/functions/health | jq '.cache'
```

### Redis Dashboard
1. Go to [Upstash Console](https://console.upstash.com/)
2. Click on your database
3. View metrics:
   - Commands/sec
   - Hit rate
   - Memory usage
   - Latency

---

## Cost Estimation

### Upstash Free Tier
- **10,000 commands/day**
- **256 MB storage**
- **Perfect for development & small production**

### Typical Usage
- Workflow execution: 2 commands (GET + SET)
- Rate limit check: 2 commands (INCR + EXPIRE)
- **~5,000 executions/day on free tier**

### Paid Plans
- **Pay-as-you-go**: $0.20 per 100K commands
- **Pro**: $10/month for 1M commands
- **Enterprise**: Custom pricing

---

## Troubleshooting

### Redis Not Connected
**Symptom**: Health check shows `redis.healthy: false`

**Fix**:
1. Check environment variables are set
2. Verify Upstash credentials
3. Check network connectivity
4. Review backend logs

**Note**: MockFlow works without Redis (just slower)

### High Cache Miss Rate
**Symptom**: Cache hit rate < 50%

**Possible causes**:
1. TTL too short (increase `REDIS_WORKFLOW_TTL`)
2. Workflows changing frequently
3. Low traffic (cache expires before reuse)

**Fix**: Increase TTL or accept lower hit rate

### Rate Limit False Positives
**Symptom**: Legitimate users getting 429 errors

**Fix**:
1. Increase `REDIS_RATELIMIT_MAX`
2. Increase `REDIS_RATELIMIT_WINDOW`
3. Implement user-based rate limiting (vs IP-based)

---

## Production Checklist

- [ ] Upstash Redis database created
- [ ] Environment variables configured
- [ ] Health check returns `redis.healthy: true`
- [ ] Cache hit rate > 80% (after warmup)
- [ ] Rate limiting tested
- [ ] Monitoring dashboard configured
- [ ] Backup plan if Redis fails (graceful degradation)

---

## Redis CLI Commands

### View All Keys
```bash
# In Upstash Console → CLI
KEYS *
```

### Check Specific Workflow Cache
```bash
GET workflow:your-workflow-id
```

### Check Rate Limit
```bash
GET ratelimit:192.168.1.1:/api/users
TTL ratelimit:192.168.1.1:/api/users
```

### Clear All Cache
```bash
FLUSHDB
```

### Get Cache Stats
```bash
INFO stats
```

---

## Best Practices

1. **Always handle Redis failures gracefully**
   - App should work without Redis (just slower)
   - Never throw errors if Redis is down

2. **Monitor cache hit rates**
   - Target: >80% hit rate
   - Adjust TTLs based on usage patterns

3. **Use appropriate TTLs**
   - Workflows: 1 hour (rarely change)
   - Rate limits: 1 minute (short window)
   - API responses: 5 minutes (balance freshness vs cache)

4. **Invalidate cache on updates**
   - Always clear cache when workflows change
   - Prevents serving stale data

5. **Monitor costs**
   - Track command usage in Upstash dashboard
   - Set up billing alerts

---

## Next Steps

1. ✅ Redis client created
2. ✅ Health check updated
3. [ ] Integrate caching into workflow execution
4. [ ] Add rate limiting to API endpoints
5. [ ] Monitor cache performance
6. [ ] Optimize TTLs based on metrics

**Redis is ready! Now integrate it into your workflow execution logic.**
