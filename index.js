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

    const permissions = require('./utility/permissions');
    
    // Check guild permissions (skip for DMs)
    if (message.guild) {
        const guildId = message.guild.id;
        const userId = message.author.id;
        
        // Auto-add guild to pending if not already tracked
        if (!permissions.isGuildApproved(guildId) && 
            !permissions.isGuildBlacklisted(guildId) && 
            !permissions.isGuildPending(guildId)) {
            permissions.addPendingGuild(guildId);
            
            // Save config with new pending guild
            const fs = require('fs').promises;
            const path = require('path');
            try {
                const configPath = path.join(__dirname, 'config.json');
                await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
                logger.info(`📝 Added guild ${message.guild.name} (${guildId}) to pending approval`);
            } catch (error) {
                logger.error('Failed to save pending guild:', error);
            }
        }
        
        // Block usage in blacklisted guilds
        if (permissions.isGuildBlacklisted(guildId)) {
            return message.reply('🚫 This server has been blacklisted from using MIRAI Bot.');
        }
        
        // Check if user can use bot in this guild
        if (!permissions.canUseInGuild(userId, guildId)) {
            const guildStatus = permissions.getGuildStatus(guildId);
            if (guildStatus === 'Pending') {
                return message.reply('⏳ This server is pending approval. Only admins can use the bot currently.\n\nServer administrators can contact the bot owner for approval.');
            } else {
                return message.reply('❌ This server is not authorized to use MIRAI Bot.\n\nPlease contact the bot administrator for access.');
            }
        }
    }

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
