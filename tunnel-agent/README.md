# MockFlow Tunnel Agent

Expose your local MockFlow instance to the internet using ngrok.

## Quick Start

```bash
# Install dependencies (first time only)
npm install

# Start tunnel
npm start
```

You'll get a public URL like `https://abc123.ngrok.io` that forwards to your local MockFlow on port 3000.

## Commands

```bash
npm start          # Start tunnel
npm run stop       # Stop tunnel
npm run status     # Check tunnel status
npm run restart    # Restart tunnel

# With QR code for mobile access
npm start -- --qr
npm run status -- --qr
```

## Configuration

Create a `.env` file (copy from `.env.example`):

```env
# Optional: ngrok auth token for stable URLs
NGROK_AUTH_TOKEN=your_token_here

# Port to tunnel (default: 3000)
TUNNEL_PORT=3000

# Optional: Custom subdomain (requires auth + paid plan)
NGROK_SUBDOMAIN=my-mockflow

# Optional: Region (us, eu, ap, au, sa, jp, in)
NGROK_REGION=us
```

## Features

- ✅ **Instant public URLs** - Share your local MockFlow with anyone
- ✅ **HTTPS by default** - Secure tunneling out of the box
- ✅ **QR codes** - Easy mobile access
- ✅ **Status tracking** - Real-time tunnel status in UI
- ✅ **CLI management** - Simple commands for all operations

## Use Cases

1. **Team Collaboration** - Share your local instance with remote team members
2. **Mobile Testing** - Test MockFlow on your phone or tablet
3. **Webhook Testing** - Receive webhooks from external services
4. **API Testing** - Test with hosted APIs from anywhere

## Documentation

See [TUNNEL_GUIDE.md](../TUNNEL_GUIDE.md) for comprehensive documentation including:
- Advanced configuration
- Security best practices
- Troubleshooting
- Tips & tricks

## Requirements

- Node.js 16+
- MockFlow frontend running on port 3000

## License

MIT
