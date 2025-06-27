const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const mirai = require('./mirai');
const logger = require('./utility/logger');
const config = require('./config');

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Initialize collections
client.commands = new Collection();
client.cooldowns = new Collection();

// Initialize mirai system
mirai.init(client);

// Bot ready event
client.once('ready', () => {
    logger.success(`Bot logged in as ${client.user.tag}!`);
    logger.info(`Serving ${client.guilds.cache.size} guilds`);
    
    // Set bot status
    client.user.setActivity('with hot reload 🔥', { type: 'PLAYING' });
});

// Message handler for prefix commands
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || 
                   client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    // Handle command execution
    try {
        await require('./utility/Handle_Command').execute(client, message, command, args);
    } catch (error) {
        logger.error(`Error executing command ${commandName}:`, error);
        message.reply('❌ An error occurred while executing this command!');
    }
});

// Removed slash command handler - using prefix commands only

// Error handling
client.on('error', (error) => {
    logger.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    logger.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    process.exit(1);
});

// Login to Discord
if (!config.token || config.token === 'your_discord_token_here') {
    logger.error('No Discord token provided! Please add your token to config.js');
    process.exit(1);
}

client.login(config.token).catch((error) => {
    logger.error('Failed to login to Discord:', error);
    process.exit(1);
});

module.exports = client;
