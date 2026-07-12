import ngrok from '@ngrok/ngrok';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

class TunnelManager {
    constructor() {
        this.listener = null;
        this.tunnelUrl = null;
        this.port = parseInt(process.env.TUNNEL_PORT || '3000', 10);
        this.statusFile = path.join(__dirname, '.tunnel-status.json');
    }

    /**
     * Start the ngrok tunnel
     */
    async start() {
        if (!process.env.NGROK_AUTH_TOKEN) {
            const message =
                'NGROK_AUTH_TOKEN is not set. ngrok requires a free account token to open a tunnel.\n' +
                '  1. Sign up (free): https://dashboard.ngrok.com/signup\n' +
                '  2. Copy your token: https://dashboard.ngrok.com/get-started/your-authtoken\n' +
                '  3. Copy tunnel-agent/.env.example to tunnel-agent/.env and paste it into NGROK_AUTH_TOKEN';
            console.error(`❌ ${message}`);
            this.saveStatus({ active: false, error: message });
            throw new Error(message);
        }

        try {
            console.log(`🚀 Starting tunnel to localhost:${this.port}...`);

            // Configure ngrok options
            const options = {
                addr: this.port,
                authtoken: process.env.NGROK_AUTH_TOKEN,
            };

            // Add optional subdomain if provided
            if (process.env.NGROK_SUBDOMAIN) {
                options.domain = `${process.env.NGROK_SUBDOMAIN}.ngrok.io`;
            }

            // Add region if specified
            if (process.env.NGROK_REGION) {
                options.region = process.env.NGROK_REGION;
            }

            // Start ngrok tunnel
            this.listener = await ngrok.forward(options);
            this.tunnelUrl = this.listener.url();

            // Save status to file
            this.saveStatus({
                active: true,
                url: this.tunnelUrl,
                port: this.port,
                startedAt: new Date().toISOString(),
            });

            console.log(`✅ Tunnel created successfully!`);
            console.log(`📡 Public URL: ${this.tunnelUrl}`);
            console.log(`🔗 Forwarding to: http://localhost:${this.port}`);
            console.log(`\n💡 Share this URL with your team or use it to test with hosted APIs!`);

            return this.tunnelUrl;
        } catch (error) {
            console.error('❌ Failed to start tunnel:', error.message);
            this.saveStatus({ active: false, error: error.message });
            throw error;
        }
    }

    /**
     * Stop the ngrok tunnel
     */
    async stop() {
        try {
            if (this.listener) {
                console.log('🛑 Stopping tunnel...');
                await this.listener.close();
                this.listener = null;
                this.tunnelUrl = null;

                this.saveStatus({ active: false, stoppedAt: new Date().toISOString() });
                console.log('✅ Tunnel stopped successfully!');
            } else {
                console.log('ℹ️  No active tunnel to stop.');
            }
        } catch (error) {
            console.error('❌ Failed to stop tunnel:', error.message);
            throw error;
        }
    }

    /**
     * Get current tunnel status
     */
    getStatus() {
        try {
            if (fs.existsSync(this.statusFile)) {
                const data = fs.readFileSync(this.statusFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Failed to read status file:', error.message);
        }

        return {
            active: false,
            url: null,
            port: this.port,
        };
    }

    /**
     * Save tunnel status to file
     */
    saveStatus(status) {
        try {
            fs.writeFileSync(this.statusFile, JSON.stringify(status, null, 2));
        } catch (error) {
            console.error('Failed to save status file:', error.message);
        }
    }

    /**
     * Restart the tunnel
     */
    async restart() {
        console.log('🔄 Restarting tunnel...');
        await this.stop();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return await this.start();
    }

    /**
     * Keep the tunnel alive
     */
    async keepAlive() {
        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n\n🛑 Received SIGINT, shutting down gracefully...');
            await this.stop();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('\n\n🛑 Received SIGTERM, shutting down gracefully...');
            await this.stop();
            process.exit(0);
        });

        // Keep process alive
        console.log('\n⏳ Tunnel is running. Press Ctrl+C to stop.\n');

        // Monitor tunnel health
        setInterval(() => {
            if (this.listener && this.tunnelUrl) {
                this.saveStatus({
                    active: true,
                    url: this.tunnelUrl,
                    port: this.port,
                    lastCheck: new Date().toISOString(),
                });
            }
        }, 30000); // Update status every 30 seconds
    }
}

export default TunnelManager;
