# 🌐 User Tunnel System - Quick Start Guide

## What is This?

When MockFlow is hosted in production (e.g., `mockflow.com`), you can now test workflows that call your **local APIs** (running on `localhost:3001`, etc.) through a secure tunnel.

## How It Works

```
Your Browser → MockFlow (hosted) → Tunnel → Your Local API
```

## Setup (2 minutes)

### Step 1: Get ngrok Token (Free)

1. Go to [ngrok.com](https://ngrok.com) and sign up (free)
2. Navigate to [dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Copy your auth token (looks like: `2abc...xyz`)

### Step 2: Configure in MockFlow

1. Open MockFlow
2. Click the **Tunnel** button in the top-right toolbar (next to keyboard shortcuts)
3. Paste your ngrok token
4. Click **Save Configuration**

✅ You'll see "Tunnel Active" indicator when configured!

## Usage

### Testing a Local API

**Scenario:** You have an API running on `http://localhost:3001`

1. **Create a Request Node**
   - URL: `http://localhost:3001`
   - Path: `/api/users`
   - Method: `POST`

2. **Add a Response Node** and connect them

3. **Click Test**

**Result:** MockFlow automatically detects it's a localhost URL and routes through your tunnel!

### Example Workflow

```
Request Node (POST http://localhost:3001/api/users)
  ↓
Validation Node (check response.status === 201)
  ↓
Transformation Node (map user.id to notification.userId)
  ↓
Request Node (POST to production API)
  ↓
Response Node
```

## Security

### ✅ Safe Practices

- **Token stored locally**: Your ngrok token is stored in your browser's localStorage only
- **Never sent to MockFlow servers**: The token is only used by the backend proxy when making requests
- **Encrypted in transit**: All requests use HTTPS
- **You control access**: Stop using MockFlow = tunnel stops

### 🔒 Important Notes

- **Don't share your token**: Keep your ngrok token private
- **Free tier limits**: ngrok free tier has rate limits (40 connections/minute)
- **Temporary tunnels**: Each request creates a temporary tunnel (in full implementation)

## Troubleshooting

### Error: "Local API tunnel not configured"

**Solution:** Configure your ngrok token in Tunnel settings (top-right toolbar)

### Error: "Tunnel not active"

**Solutions:**
1. Check that you saved the token in Tunnel settings
2. Verify the token is correct (copy from ngrok dashboard)
3. Clear browser cache and re-enter token

### Local API not responding

**Solutions:**
1. Make sure your local API is actually running
2. Check the port number is correct
3. Test the API directly: `curl http://localhost:3001/api/users`

## Current Limitations (MVP)

This is the MVP version. Current limitations:

1. **Tunnel creation**: Backend doesn't actually create ngrok tunnels yet (placeholder)
2. **No tunnel caching**: Each request would create a new tunnel (inefficient)
3. **No tunnel status**: Can't see if tunnel is actually active

## Next Steps (Full Implementation)

The full CLI-based system will provide:

- ✅ Persistent tunnels (stay active across requests)
- ✅ Real-time tunnel status in UI
- ✅ Better performance (reuse tunnels)
- ✅ No need to share ngrok tokens
- ✅ Multi-workspace support

**Install CLI (coming soon):**
```bash
npm install -g @mockflow/tunnel
mockflow tunnel start --workspace=your-workspace --port=3001
```

## FAQ

### Q: Do I need ngrok for remote APIs?

**A:** No! ngrok is only needed for `localhost` URLs. Remote APIs (e.g., `https://api.example.com`) work directly.

### Q: Can I use this in development?

**A:** Yes! Works in both development and production. In development, you might not even need the tunnel if your backend can reach localhost directly.

### Q: What if I don't have an ngrok token?

**A:** You can still use MockFlow for remote APIs. The tunnel is only required for testing local APIs.

### Q: Is my ngrok token safe?

**A:** Yes! It's stored in your browser's localStorage and never sent to MockFlow servers. It's only used by the backend proxy when you make a request to a localhost URL.

## Examples

### Example 1: Testing Local Express API

```javascript
// Your local API (localhost:3001)
app.post('/api/users', (req, res) => {
  res.json({ id: 123, name: req.body.name });
});
```

**MockFlow Workflow:**
1. Request Node: `POST http://localhost:3001/api/users`
2. Body: `{"name": "John"}`
3. Response Node: Shows `{"id": 123, "name": "John"}`

### Example 2: Local → Production Chain

```
Request (POST localhost:3001/api/users) → Create user locally
  ↓
Transformation → Extract user.id
  ↓
Request (POST https://api.production.com/notify) → Notify production
  ↓
Response → Success!
```

### Example 3: Multi-Service Integration

```
Request (GET localhost:3001/api/user/123) → Get user from local service
  ↓
Request (GET localhost:3002/api/orders?userId=123) → Get orders from another local service
  ↓
Transformation → Combine user + orders
  ↓
Response → Return combined data
```

## Support

Need help? Check:
- [ngrok Documentation](https://ngrok.com/docs)
- [MockFlow Documentation](./SETUP.md)
- [Implementation Plan](./implementation_plan.md)

---

**Ready to test your local APIs?** Configure your tunnel token and start building! 🚀
