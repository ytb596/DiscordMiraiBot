const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const logger = require('./utility/logger');
const config = require('./config');

class Mirai {
    constructor() {
        this.client = null;
        this.commandsPath = path.join(__dirname, 'modules', 'commands');
        this.watchedFiles = new Map();
    }

    init(client) {
        this.client = client;
        this.loadCommands();
        this.setupFileWatcher();
        this.displayBanner();
    }

    displayBanner() {
        const banner = `
╔══════════════════════════════════════════════════════════════╗
║                          MIRAI BOT                           ║
║                    Discord Bot Manager                       ║
║                                                              ║
║  🚀 Hot Reload System Active                                 ║
║  📁 Commands Auto-Discovery                                  ║
║  🎨 Beautiful Terminal Logs                                  ║
║  ⚡ Ready for Action!                                        ║
╚══════════════════════════════════════════════════════════════╝
        `;
        console.log('\x1b[36m%s\x1b[0m', banner);
    }

    async loadCommands() {
        logger.info('🔄 Loading commands...');
        
        if (!fs.existsSync(this.commandsPath)) {
            logger.warn('Commands directory not found, creating...');
            fs.mkdirSync(this.commandsPath, { recursive: true });
            return;
        }

        const commandFiles = fs.readdirSync(this.commandsPath).filter(file => file.endsWith('.js'));
        const commands = [];

        for (const file of commandFiles) {
            try {
                const filePath = path.join(this.commandsPath, file);
                
                // Clear require cache for hot reload
                delete require.cache[require.resolve(filePath)];
                
                const command = require(filePath);
                
                if (command.name) {
                    this.client.commands.set(command.name, command);
                    commands.push(command);
                    logger.success(`✅ Loaded command: ${command.name}`);
                } else {
                    logger.warn(`⚠️  Command file ${file} is missing name property`);
                }
            } catch (error) {
                logger.error(`❌ Failed to load command ${file}:`, error.message);
            }
        }

        // Skip slash command registration - using prefix commands only
        logger.info(`📦 Total commands loaded: ${this.client.commands.size}`);
    }

    async registerSlashCommands(commands) {
        const slashCommands = commands
            .filter(cmd => cmd.slash)
            .map(cmd => cmd.slash);

        if (slashCommands.length === 0) {
            logger.info('No slash commands to register');
            return;
        }

        try {
            const rest = new REST({ version: '9' }).setToken(config.token);

            logger.info('🔄 Refreshing slash commands...');

            await rest.put(
                Routes.applicationCommands(config.clientId),
                { body: slashCommands }
            );

            logger.success(`✅ Successfully registered ${slashCommands.length} slash commands`);
        } catch (error) {
            logger.error('❌ Failed to register slash commands:', error);
        }
    }

    setupFileWatcher() {
        if (!fs.existsSync(this.commandsPath)) return;

        logger.info('👁️  Setting up file watcher for hot reload...');

        fs.watch(this.commandsPath, { recursive: true }, (eventType, filename) => {
            if (!filename || !filename.endsWith('.js')) return;

            const filePath = path.join(this.commandsPath, filename);

            if (eventType === 'change' && fs.existsSync(filePath)) {
                logger.info(`🔄 File changed: ${filename}`);
                this.reloadCommand(filename);
            } else if (eventType === 'rename') {
                if (fs.existsSync(filePath)) {
                    logger.info(`➕ New command file: ${filename}`);
                    this.reloadCommand(filename);
                } else {
                    logger.info(`➖ Command file removed: ${filename}`);
                    this.removeCommand(filename);
                }
            }
        });
    }

    async reloadCommand(filename) {
        try {
            const filePath = path.join(this.commandsPath, filename);
            
            // Clear require cache
            delete require.cache[require.resolve(filePath)];
            
            const command = require(filePath);
            
            if (command.name) {
                this.client.commands.set(command.name, command);
                logger.success(`🔄 Hot reloaded: ${command.name}`);
                
                // Skip slash command registration - using prefix commands only
            } else {
                logger.warn(`⚠️  Command file ${filename} is missing name property`);
            }
        } catch (error) {
            logger.error(`❌ Failed to reload command ${filename}:`, error.message);
        }
    }

    removeCommand(filename) {
        const commandName = path.basename(filename, '.js');
        if (this.client.commands.has(commandName)) {
            this.client.commands.delete(commandName);
            logger.info(`🗑️  Removed command: ${commandName}`);
        }
    }

    async reloadAllCommands() {
        logger.info('🔄 Reloading all commands...');
        this.client.commands.clear();
        await this.loadCommands();
        logger.success('✅ All commands reloaded successfully!');
    }

    getStats() {
        return {
            commands: this.client.commands.size,
            guilds: this.client.guilds.cache.size,
            users: this.client.users.cache.size,
            uptime: process.uptime()
        };
    }

    displayStats() {
        const stats = this.getStats();
        const uptime = this.formatUptime(stats.uptime);
        
        logger.info('📊 Bot Statistics:');
        logger.info(`   Commands: ${stats.commands}`);
        logger.info(`   Guilds: ${stats.guilds}`);
        logger.info(`   Users: ${stats.users}`);
        logger.info(`   Uptime: ${uptime}`);
    }

    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        return `${days}d ${hours}h ${minutes}m ${secs}s`;
    }
}

module.exports = new Mirai();
