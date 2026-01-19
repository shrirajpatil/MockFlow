# 🌐 MockFlow Tunnel Guide

Expose your local MockFlow instance to the internet using ngrok tunneling. Perfect for testing with hosted APIs, sharing with team members, or accessing from mobile devices.

## 🚀 Quick Start

### 1. Start Your Frontend

```bash
cd frontend
npm run dev
```

Your MockFlow will be running on `http://localhost:3000`

### 2. Start the Tunnel

Open a new terminal:

```bash
cd tunnel-agent
npm start
```

You'll see output like:

```
🚀 Starting tunnel to localhost:3000...
✅ Tunnel created successfully!
📡 Public URL: https://abc123-def456.ngrok.io
🔗 Forwarding to: http://localhost:3000

💡 Share this URL with your team or use it to test with hosted APIs!

⏳ Tunnel is running. Press Ctrl+C to stop.
```

### 3. Access MockFlow

- **Local**: `http://localhost:3000`
- **Public**: `https://abc123-def456.ngrok.io` (your tunnel URL)

The tunnel status will appear in the top-right corner of MockFlow with a copy button!

## 📱 Use Cases

### 1. Testing with Hosted APIs

Create workflows that call your production or staging APIs:

```
Request Node → https://api.yourapp.com/endpoint
```

Test from anywhere using your tunnel URL!

### 2. Team Collaboration

Share your tunnel URL with team members:

```bash
# Get QR code for mobile access
npm run status -- --qr
```

Team members can access your local MockFlow instance and collaborate in real-time.

### 3. Webhook Testing

Use your tunnel URL as a webhook endpoint:

```
Webhook URL: https://abc123-def456.ngrok.io/api/webhook
```

Perfect for testing integrations with services like Stripe, GitHub, etc.

### 4. Mobile Testing

Scan the QR code to access MockFlow on your phone:

```bash
npm start -- --qr
```

## 🔧 Advanced Configuration

### Using Authentication Token

For stable URLs and custom subdomains, get a free ngrok auth token:

1. Sign up at [ngrok.com](https://ngrok.com)
2. Get your auth token from [dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Create `.env` file in `tunnel-agent`:

```env
NGROK_AUTH_TOKEN=your_token_here
```

### Custom Subdomain (Requires Paid Plan)

```env
NGROK_AUTH_TOKEN=your_token_here
NGROK_SUBDOMAIN=my-mockflow
```

Your tunnel will be: `https://my-mockflow.ngrok.io`

### Change Region

```env
NGROK_REGION=eu  # Options: us, eu, ap, au, sa, jp, in
```

## 🎮 CLI Commands

### Start Tunnel

```bash
npm start
# or with QR code
npm start -- --qr
```

### Check Status

```bash
npm run status
# or with QR code
npm run status -- --qr
```

### Stop Tunnel

```bash
npm run stop
```

### Restart Tunnel

```bash
npm run restart
```

## 🔒 Security Considerations

### ✅ Safe Practices

- Tunnels use HTTPS by default (secure)
- Tunnel URLs are random and hard to guess
- You control when the tunnel is active
- Stop the tunnel when not in use

### ⚠️ Important Notes

- **Don't share tunnel URLs publicly** - They expose your local instance
- **Use authentication** - Add auth to your MockFlow workflows if needed
- **Monitor access** - Check ngrok dashboard for traffic logs
- **Temporary URLs** - Free tier URLs change on restart

### 🛡️ Best Practices

1. **Only run tunnels when needed**
2. **Use auth tokens** for stable URLs
3. **Share URLs privately** (Slack, email, not public forums)
4. **Stop tunnels** when done testing
5. **Monitor the ngrok dashboard** for suspicious activity

## 🐛 Troubleshooting

### Tunnel Won't Start

**Error**: `Failed to start tunnel`

**Solutions**:
- Check if port 3000 is in use
- Ensure frontend is running
- Try restarting: `npm run restart`

### Tunnel URL Not Showing in UI

**Solutions**:
- Refresh the browser
- Check tunnel status: `npm run status`
- Ensure tunnel is running

### Connection Refused

**Solutions**:
- Make sure frontend is running on port 3000
- Check if tunnel is active: `npm run status`
- Restart both frontend and tunnel

### Rate Limiting

**Error**: `ERR_NGROK_108`

**Solution**: 
- Free tier has rate limits
- Sign up for ngrok account and add auth token
- Consider upgrading to paid plan for higher limits

## 💡 Tips & Tricks

### Keep Tunnel Running

Use a process manager like `pm2`:

```bash
npm install -g pm2
pm2 start "npm start" --name mockflow-tunnel
```

### Multiple Tunnels

Run tunnels on different ports:

```env
# .env
TUNNEL_PORT=3001
```

### Inspect Traffic

Visit `http://localhost:4040` when tunnel is running to see:
- All HTTP requests
- Request/response details
- Replay requests

## 📚 Additional Resources

- [ngrok Documentation](https://ngrok.com/docs)
- [ngrok Dashboard](https://dashboard.ngrok.com)
- [MockFlow Documentation](./README.md)

---

**Need help?** Check the [troubleshooting section](#-troubleshooting) or open an issue on GitHub.
