# MockFlow Tunnel Agent

Exposes a local server on your machine (your own API, a webhook receiver, anything on a port)
to the internet using ngrok — so a deployed MockFlow workflow's Request node can call it, or so
you can share it for testing on another device.

## You probably don't need this

Most people connecting a local API don't need to install anything: open MockFlow's editor,
click **Local APIs** in the toolbar, and use the built-in SSH-based tunnel — no account, no
install, no agent to run. This CLI exists for a **persistent, auto-detected** tunnel instead —
useful if you're testing often and don't want to re-run a command every time.

## Quick Start

ngrok requires a free account token before it will open any tunnel — get one first:

1. Sign up (free): https://dashboard.ngrok.com/signup
2. Copy your token: https://dashboard.ngrok.com/get-started/your-authtoken
3. `cp .env.example .env` and paste your token into `NGROK_AUTH_TOKEN` — or skip this and paste
   it into MockFlow's "Local APIs" dialog instead once the agent is running (see below).

```bash
# Install dependencies (first time only)
npm install

# Start tunnel
npm start
```

You'll get a public URL like `https://abc123.ngrok-free.app` that forwards to `localhost:{TUNNEL_PORT}`
on your machine — set `TUNNEL_PORT` in `.env` to whatever port **your own API** runs on (not
necessarily MockFlow's dev server).

If you don't have a token yet, `npm start` will keep the local control server running so you can
paste one into MockFlow's "Local APIs" dialog — the tunnel connects automatically as soon as you do.

## Commands

```bash
npm start          # Start tunnel
npm run stop       # Stop tunnel
npm run status     # Check tunnel status
npm run restart    # Restart tunnel
npm run configure  # Run just the control server, so you can paste a token from the browser first

# With QR code for mobile access
npm start -- --qr
npm run status -- --qr
```

## Configuration

Create a `.env` file (copy from `.env.example`):

```env
# Required: ngrok auth token — see Quick Start above
NGROK_AUTH_TOKEN=your_token_here

# Port your local API/server runs on (default: 3000)
TUNNEL_PORT=3000

# Optional: Custom subdomain (requires auth + paid plan)
NGROK_SUBDOMAIN=my-mockflow

# Optional: Region (us, eu, ap, au, sa, jp, in)
NGROK_REGION=us
```

## Features

- ✅ **Instant public URLs** — share anything on a local port
- ✅ **HTTPS by default** — secure tunneling out of the box
- ✅ **QR codes** — easy mobile access
- ✅ **Status tracking** — real-time tunnel status in MockFlow's UI
- ✅ **CLI management** — simple commands for all operations

## Use cases

1. **A local API for a MockFlow Request node** — the primary use case, see above.
2. **Team collaboration** — share a local dev server with remote teammates.
3. **Mobile/device testing** — test something running on your machine from your phone.
4. **Webhook testing** — receive webhooks from external services locally.

## Requirements

- Node.js 16+
- An SSH client is *not* needed for this path (that's the no-signup alternative) — this agent
  only needs Node and a free ngrok account.

## License

MIT
