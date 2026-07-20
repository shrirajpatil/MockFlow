#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import TunnelManager from './tunnel-manager.js';
import { startControlServer } from './control-server.js';

const program = new Command();
const manager = new TunnelManager();

program
    .name('tunnel-agent')
    .description('MockFlow Tunnel Agent - Expose your local instance via ngrok')
    .version('1.0.0');

// Start command
program
    .command('start')
    .description('Start the ngrok tunnel')
    .option('-q, --qr', 'Display QR code for mobile access')
    .action(async (options) => {
        const controlServer = startControlServer(manager);

        try {
            const url = await manager.start();

            if (options.qr) {
                console.log('\n📱 Scan this QR code to access on mobile:\n');
                qrcode.generate(url, { small: true });
            }

            // Keep tunnel alive
            await manager.keepAlive();
        } catch (error) {
            console.error(chalk.red('Failed to start tunnel:'), error.message);
            console.log(chalk.yellow('\n💡 The control server is still running — open MockFlow\'s'));
            console.log(chalk.yellow('   "Local APIs" panel and paste your ngrok token there.'));
            console.log(chalk.yellow('   The tunnel will connect automatically — no need to restart this command.\n'));
            console.log(chalk.gray('Press Ctrl+C to exit.\n'));

            // Keep the process (and control server) alive so the user can configure
            // the token from the browser without re-running the CLI from scratch.
            await new Promise(() => {
                process.on('SIGINT', () => { controlServer.close(); process.exit(0); });
            });
        }
    });

// Stop command
program
    .command('stop')
    .description('Stop the ngrok tunnel')
    .action(async () => {
        try {
            await manager.stop();
        } catch (error) {
            console.error(chalk.red('Failed to stop tunnel:'), error.message);
            process.exit(1);
        }
    });

// Status command
program
    .command('status')
    .description('Show tunnel status')
    .option('-q, --qr', 'Display QR code if tunnel is active')
    .action((options) => {
        const status = manager.getStatus();

        console.log('\n' + chalk.bold('🔍 Tunnel Status') + '\n');
        console.log(chalk.gray('─'.repeat(50)));

        if (status.active) {
            console.log(chalk.green('● Status:'), chalk.bold('Active'));
            console.log(chalk.blue('📡 Public URL:'), chalk.bold(status.url));
            console.log(chalk.blue('🔗 Local Port:'), chalk.bold(status.port));

            if (status.startedAt) {
                const startTime = new Date(status.startedAt);
                const uptime = Math.floor((Date.now() - startTime.getTime()) / 1000);
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                const seconds = uptime % 60;
                console.log(chalk.blue('⏱️  Uptime:'), `${hours}h ${minutes}m ${seconds}s`);
            }

            if (options.qr) {
                console.log('\n📱 QR Code for mobile access:\n');
                qrcode.generate(status.url, { small: true });
            }

            console.log('\n' + chalk.green('✅ Tunnel is running!'));
            console.log(chalk.gray('💡 Tip: Share the public URL with your team or use it for testing\n'));
        } else {
            console.log(chalk.red('● Status:'), chalk.bold('Inactive'));

            if (status.error) {
                console.log(chalk.red('❌ Error:'), status.error);
            }

            if (status.stoppedAt) {
                console.log(chalk.gray('🕐 Stopped at:'), new Date(status.stoppedAt).toLocaleString());
            }

            console.log('\n' + chalk.yellow('⚠️  No active tunnel'));
            console.log(chalk.gray('💡 Run "npm start" to create a tunnel\n'));
        }

        console.log(chalk.gray('─'.repeat(50)) + '\n');
    });

// Restart command
program
    .command('restart')
    .description('Restart the ngrok tunnel')
    .option('-q, --qr', 'Display QR code for mobile access')
    .action(async (options) => {
        try {
            const url = await manager.restart();

            if (options.qr) {
                console.log('\n📱 Scan this QR code to access on mobile:\n');
                qrcode.generate(url, { small: true });
            }

            // Keep tunnel alive
            await manager.keepAlive();
        } catch (error) {
            console.error(chalk.red('Failed to restart tunnel:'), error.message);
            process.exit(1);
        }
    });

// Configure command — runs just the local control server so the MockFlow
// web UI can save an ngrok token without starting a tunnel yet.
program
    .command('configure')
    .description('Run only the local control server, so you can paste your ngrok token from the MockFlow web UI')
    .action(() => {
        const controlServer = startControlServer(manager);
        console.log(chalk.gray('Open MockFlow → toolbar → "Local APIs" and paste your ngrok token.'));
        console.log(chalk.gray('The tunnel starts automatically once you do — press Ctrl+C here to stop it.\n'));
        process.on('SIGINT', () => { controlServer.close(); process.exit(0); });
    });

// Parse command line arguments
program.parse();
