import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.join(__dirname, '.env');
const ENV_EXAMPLE_PATH = path.join(__dirname, '.env.example');

const ALLOWED_ORIGINS = new Set([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8888',
    'http://127.0.0.1:8888',
]);

/**
 * Local-only control server for the tunnel agent.
 *
 * Lets the MockFlow web UI (running in the user's own browser) read tunnel
 * status and write the user's ngrok token into tunnel-agent/.env — WITHOUT
 * that token ever leaving the user's machine. Binds to 127.0.0.1 only, so it
 * is unreachable from outside this computer; CORS is restricted to the known
 * local MockFlow origins so no other website can call it either.
 */
export function startControlServer(manager, port = parseInt(process.env.TUNNEL_CONTROL_PORT || '4756', 10)) {
    const server = http.createServer((req, res) => {
        const origin = req.headers.origin;
        if (origin && ALLOWED_ORIGINS.has(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Vary', 'Origin');
        }
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        if (req.method === 'GET' && req.url === '/status') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ...manager.getStatus(), agentRunning: true }));
            return;
        }

        if (req.method === 'GET' && req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
            return;
        }

        if (req.method === 'POST' && req.url === '/configure') {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
                if (body.length > 10_000) req.destroy(); // guard against abuse
            });
            req.on('end', () => {
                try {
                    const { ngrokToken } = JSON.parse(body || '{}');
                    if (!ngrokToken || typeof ngrokToken !== 'string' || !ngrokToken.trim()) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'ngrokToken is required' }));
                        return;
                    }

                    writeTokenToEnv(ngrokToken.trim());
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        saved: true,
                        message: 'Token saved to tunnel-agent/.env. Restart the tunnel agent (Ctrl+C then npm start) to apply it.',
                    }));
                } catch {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid request body' }));
                }
            });
            return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    });

    server.listen(port, '127.0.0.1', () => {
        console.log(`🔒 Local control server listening on http://127.0.0.1:${port} (not reachable outside this machine)`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`⚠️  Control server port ${port} already in use — is another tunnel-agent instance running?`);
        } else {
            console.error('Control server error:', err.message);
        }
    });

    return server;
}

/** Write/replace NGROK_AUTH_TOKEN in .env, preserving other keys and comments. */
function writeTokenToEnv(token) {
    const source = fs.existsSync(ENV_PATH)
        ? fs.readFileSync(ENV_PATH, 'utf8')
        : fs.existsSync(ENV_EXAMPLE_PATH)
            ? fs.readFileSync(ENV_EXAMPLE_PATH, 'utf8')
            : 'NGROK_AUTH_TOKEN=\nTUNNEL_PORT=3000\n';

    const lines = source.split('\n');
    let found = false;
    const updated = lines.map((line) => {
        if (/^NGROK_AUTH_TOKEN\s*=/.test(line)) {
            found = true;
            return `NGROK_AUTH_TOKEN=${token}`;
        }
        return line;
    });
    if (!found) updated.unshift(`NGROK_AUTH_TOKEN=${token}`);

    fs.writeFileSync(ENV_PATH, updated.join('\n'));
}
