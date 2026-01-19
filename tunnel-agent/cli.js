#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import TunnelManager from './tunnel-manager.js';

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
            process.exit(1);
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

// Parse command line arguments
program.parse();
