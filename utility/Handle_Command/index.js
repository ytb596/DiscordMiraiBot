const logger = require('../logger');
const cache = require('../../modules/cache');

class CommandHandler {
    constructor() {
        this.cooldowns = new Map();
    }

    /**
     * Execute a prefix command
     * @param {Client} client - Discord client
     * @param {Message} message - Discord message
     * @param {Object} command - Command object
     * @param {Array} args - Command arguments
     */
    async execute(client, message, command, args) {
        // Check cooldown
        if (!this.checkCooldown(command, message.author.id)) {
            const timeLeft = this.getCooldownTimeLeft(command, message.author.id);
            return message.reply(`⏰ Please wait ${Math.ceil(timeLeft / 1000)} more seconds before using this command again.`);
        }

        // Check permissions
        if (!this.checkPermissions(command, message)) {
            return message.reply('❌ You don\'t have permission to use this command!');
        }

        // Log command usage
        logger.command(`${message.author.tag} used command: ${command.name}`, {
            guild: message.guild?.name || 'DM',
            channel: message.channel.name || 'DM',
            args: args.join(' ') || 'none'
        });

        try {
            // Execute command
            await command.execute(client, message, args);

            // Set cooldown
            this.setCooldown(command, message.author.id);

            // Cache command usage statistics
            this.updateCommandStats(command.name, message.author.id);

        } catch (error) {
            logger.error(`Error executing command ${command.name}:`, error);
            
            // Send error message to user
            const errorEmbed = {
                color: 0xff0000,
                title: '❌ Command Error',
                description: 'An error occurred while executing this command.',
                fields: [
                    {
                        name: 'Error Details',
                        value: `\`\`\`${error.message}\`\`\``,
                        inline: false
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: 'If this error persists, please contact the bot owner.'
                }
            };

            await message.reply({ embeds: [errorEmbed] });
        }
    }

    /**
     * Execute a slash command
     * @param {Client} client - Discord client
     * @param {Interaction} interaction - Discord interaction
     * @param {Object} command - Command object
     */
    async executeSlash(client, interaction, command) {
        // Check cooldown
        if (!this.checkCooldown(command, interaction.user.id)) {
            const timeLeft = this.getCooldownTimeLeft(command, interaction.user.id);
            return interaction.reply({
                content: `⏰ Please wait ${Math.ceil(timeLeft / 1000)} more seconds before using this command again.`,
                ephemeral: true
            });
        }

        // Check permissions
        if (!this.checkPermissionsSlash(command, interaction)) {
            return interaction.reply({
                content: '❌ You don\'t have permission to use this command!',
                ephemeral: true
            });
        }

        // Log command usage
        logger.command(`${interaction.user.tag} used slash command: ${command.name}`, {
            guild: interaction.guild?.name || 'DM',
            channel: interaction.channel?.name || 'DM',
            options: JSON.stringify(interaction.options?.data || [])
        });

        try {
            // Execute command
            await command.executeSlash(client, interaction);

            // Set cooldown
            this.setCooldown(command, interaction.user.id);

            // Cache command usage statistics
            this.updateCommandStats(command.name, interaction.user.id);

        } catch (error) {
            logger.error(`Error executing slash command ${command.name}:`, error);
            
            // Send error message to user
            const errorContent = {
                content: '❌ An error occurred while executing this command.',
                ephemeral: true
            };

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorContent);
            } else {
                await interaction.reply(errorContent);
            }
        }
    }

    /**
     * Check if user is on cooldown for a command
     * @param {Object} command - Command object
     * @param {string} userId - User ID
     * @returns {boolean} True if user can use command
     */
    checkCooldown(command, userId) {
        if (!command.cooldown) return true;

        const cooldownKey = `${command.name}_${userId}`;
        const lastUsed = this.cooldowns.get(cooldownKey);

        if (!lastUsed) return true;

        const timePassed = Date.now() - lastUsed;
        const cooldownTime = command.cooldown * 1000;

        return timePassed >= cooldownTime;
    }

    /**
     * Get remaining cooldown time
     * @param {Object} command - Command object
     * @param {string} userId - User ID
     * @returns {number} Remaining cooldown time in ms
     */
    getCooldownTimeLeft(command, userId) {
        if (!command.cooldown) return 0;

        const cooldownKey = `${command.name}_${userId}`;
        const lastUsed = this.cooldowns.get(cooldownKey);

        if (!lastUsed) return 0;

        const timePassed = Date.now() - lastUsed;
        const cooldownTime = command.cooldown * 1000;

        return Math.max(0, cooldownTime - timePassed);
    }

    /**
     * Set cooldown for a user and command
     * @param {Object} command - Command object
     * @param {string} userId - User ID
     */
    setCooldown(command, userId) {
        if (!command.cooldown) return;

        const cooldownKey = `${command.name}_${userId}`;
        this.cooldowns.set(cooldownKey, Date.now());

        // Auto-remove cooldown after expiry
        setTimeout(() => {
            this.cooldowns.delete(cooldownKey);
        }, command.cooldown * 1000);
    }

    /**
     * Check permissions for prefix commands
     * @param {Object} command - Command object
     * @param {Message} message - Discord message
     * @returns {boolean} True if user has permission
     */
    checkPermissions(command, message) {
        // Check owner-only commands
        if (command.ownerOnly) {
            const config = require('../../config');
            return config.owners.includes(message.author.id);
        }

        // Check required permissions
        if (command.permissions && message.guild) {
            const memberPermissions = message.member.permissions;
            return command.permissions.every(permission => 
                memberPermissions.has(permission)
            );
        }

        // Check required roles
        if (command.requiredRoles && message.guild) {
            const memberRoles = message.member.roles.cache;
            return command.requiredRoles.some(roleId => 
                memberRoles.has(roleId)
            );
        }

        return true;
    }

    /**
     * Check permissions for slash commands
     * @param {Object} command - Command object
     * @param {Interaction} interaction - Discord interaction
     * @returns {boolean} True if user has permission
     */
    checkPermissionsSlash(command, interaction) {
        // Check owner-only commands
        if (command.ownerOnly) {
            const config = require('../../config');
            return config.owners.includes(interaction.user.id);
        }

        // Check required permissions
        if (command.permissions && interaction.guild) {
            const memberPermissions = interaction.member.permissions;
            return command.permissions.every(permission => 
                memberPermissions.has(permission)
            );
        }

        // Check required roles
        if (command.requiredRoles && interaction.guild) {
            const memberRoles = interaction.member.roles.cache;
            return command.requiredRoles.some(roleId => 
                memberRoles.has(roleId)
            );
        }

        return true;
    }

    /**
     * Update command usage statistics
     * @param {string} commandName - Command name
     * @param {string} userId - User ID
     */
    updateCommandStats(commandName, userId) {
        const statsKey = `command_stats_${commandName}`;
        const userStatsKey = `user_stats_${userId}`;

        // Get current stats
        let commandStats = cache.get(statsKey) || { uses: 0, users: new Set() };
        let userStats = cache.get(userStatsKey) || { commands: new Map() };

        // Update command stats
        commandStats.uses++;
        commandStats.users.add(userId);

        // Update user stats
        const userCommandCount = userStats.commands.get(commandName) || 0;
        userStats.commands.set(commandName, userCommandCount + 1);

        // Cache updated stats (24 hours TTL)
        cache.set(statsKey, commandStats, 86400000);
        cache.set(userStatsKey, userStats, 86400000);
    }

    /**
     * Get command usage statistics
     * @param {string} commandName - Command name (optional)
     * @returns {Object} Command statistics
     */
    getCommandStats(commandName = null) {
        if (commandName) {
            const statsKey = `command_stats_${commandName}`;
            return cache.get(statsKey) || { uses: 0, users: new Set() };
        }

        // Get all command stats
        const allStats = {};
        const cacheStats = cache.getStats();

        for (const key of Object.keys(cacheStats.entries)) {
            if (key.startsWith('command_stats_')) {
                const cmdName = key.replace('command_stats_', '');
                allStats[cmdName] = cache.get(key);
            }
        }

        return allStats;
    }

    /**
     * Clear all cooldowns
     */
    clearCooldowns() {
        this.cooldowns.clear();
        logger.info('🧹 Cleared all command cooldowns');
    }
}

module.exports = new CommandHandler();
