# 🚀 Quick Demo: Using the Tunnel

## Step 1: Start Your Frontend

```bash
cd frontend
npm run dev
```

Wait for: `✓ Ready on http://localhost:3000`

## Step 2: Start the Tunnel

Open a **new terminal**:

```bash
cd tunnel-agent
npm start
```

You'll see:

```
🚀 Starting tunnel to localhost:3000...
✅ Tunnel created successfully!
📡 Public URL: https://abc123-def456.ngrok.io
🔗 Forwarding to: http://localhost:3000

💡 Share this URL with your team or use it to test with hosted APIs!

⏳ Tunnel is running. Press Ctrl+C to stop.
```

## Step 3: See It in Action

1. **Open MockFlow** at `http://localhost:3000`
2. **Look at top-right corner** - You'll see the tunnel status badge!
3. **Click the copy button** to copy the public URL
4. **Share it** with team members or use it for testing

## Step 4: Test It

**Option A: Share with team**
- Send the public URL to a colleague
- They can access your local MockFlow instance!

**Option B: Test on mobile**
```bash
npm run status -- --qr
```
- Scan the QR code with your phone
- Access MockFlow on mobile!

**Option C: Test with hosted API**
- Create a workflow in MockFlow
- Add a Request node pointing to your production API
- Test it through the tunnel URL

## Stop the Tunnel

Press `Ctrl+C` in the tunnel terminal, or run:

```bash
npm run stop
```

---

**That's it!** 🎉 You now have a public URL for your local MockFlow instance.

For more details, see [TUNNEL_GUIDE.md](./TUNNEL_GUIDE.md)
