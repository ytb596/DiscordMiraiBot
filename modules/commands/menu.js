module.exports = {
    name: 'menu',
    description: 'Display bot menu with command list and detailed information',
    aliases: ['m', 'commands'],
    usage: '[all|command_name]',
    cooldown: 3,
    category: 'General',

    async execute(client, message, args) {
        const { commands } = client;
        const config = require('../../config');

        if (!args.length) {
            return this.sendMainMenu(message, commands, config);
        }

        const subCommand = args[0].toLowerCase();

        if (subCommand === 'all') {
            return this.sendAllCommands(message, commands, config);
        } else {
            // Check if it's a command name
            const command = commands.get(subCommand) || commands.find(c => c.aliases && c.aliases.includes(subCommand));
            if (command) {
                return this.sendCommandDetails(message, command, config);
            } else {
                return message.reply(`❌ Command \`${subCommand}\` not found! Use \`${config.prefix}menu all\` to see all commands.`);
            }
        }
    },

    sendMainMenu(message, commands, config) {
        // Group commands by category
        const categories = {};
        commands.forEach(command => {
            const category = command.category || 'General';
            if (!categories[category]) categories[category] = [];
            categories[category].push(command);
        });

        const embed = {
            color: 0x3498db,
            title: '📋 MIRAI Bot Menu',
            description: `Welcome to MIRAI Bot! Here's what I can do for you.`,
            fields: [],
            timestamp: new Date(),
            footer: {
                text: `Use ${config.prefix}menu all to see all commands • ${config.prefix}menu <command> for details`
            }
        };

        // Add category overview
        for (const [categoryName, categoryCommands] of Object.entries(categories)) {
            const commandNames = categoryCommands.slice(0, 5).map(cmd => `\`${cmd.name}\``).join(', ');
            const moreText = categoryCommands.length > 5 ? ` and ${categoryCommands.length - 5} more...` : '';
            
            embed.fields.push({
                name: `${this.getCategoryEmoji(categoryName)} ${categoryName}`,
                value: `${commandNames}${moreText}`,
                inline: false
            });
        }

        // Add quick stats
        embed.fields.push({
            name: '📊 Bot Statistics',
            value: `**Commands:** ${commands.size}\n**Prefix:** ${config.prefix}\n**Status:** Online & Ready`,
            inline: true
        });

        // Add usage info
        embed.fields.push({
            name: '💡 Quick Help',
            value: `• \`${config.prefix}menu all\` - Show all commands\n• \`${config.prefix}menu <command>\` - Command details\n• \`${config.prefix}help\` - Alternative help`,
            inline: true
        });

        return message.reply({ embeds: [embed] });
    },

    async sendAllCommands(message, commands, config) {
        // Group commands by category
        const categories = {};
        commands.forEach(command => {
            const category = command.category || 'General';
            if (!categories[category]) categories[category] = [];
            categories[category].push(command);
        });

        const embeds = [];
        let currentEmbed = {
            color: 0x2ecc71,
            title: '📚 All Commands',
            description: `Complete list of available commands. Use \`${config.prefix}menu <command>\` for details.`,
            fields: [],
            timestamp: new Date(),
            footer: {
                text: `Page 1 • Total Commands: ${commands.size}`
            }
        };

        let fieldCount = 0;
        const maxFieldsPerEmbed = 6;

        for (const [categoryName, categoryCommands] of Object.entries(categories)) {
            // Check if we need a new embed
            if (fieldCount >= maxFieldsPerEmbed) {
                embeds.push(currentEmbed);
                currentEmbed = {
                    color: 0x2ecc71,
                    title: '📚 All Commands (Continued)',
                    fields: [],
                    timestamp: new Date(),
                    footer: {
                        text: `Page ${embeds.length + 1} • Total Commands: ${commands.size}`
                    }
                };
                fieldCount = 0;
            }

            // Create command list for this category
            const commandList = categoryCommands.map(cmd => {
                const aliases = cmd.aliases && cmd.aliases.length ? ` (${cmd.aliases.join(', ')})` : '';
                const cooldown = cmd.cooldown ? ` [${cmd.cooldown}s]` : '';
                return `\`${config.prefix}${cmd.name}\`${aliases}${cooldown}`;
            }).join('\n');

            currentEmbed.fields.push({
                name: `${this.getCategoryEmoji(categoryName)} ${categoryName} (${categoryCommands.length})`,
                value: commandList,
                inline: false
            });

            fieldCount++;
        }

        // Add the last embed
        embeds.push(currentEmbed);

        // Send embeds with slight delays
        for (let i = 0; i < embeds.length; i++) {
            if (i === 0) {
                await message.reply({ embeds: [embeds[i]] });
            } else {
                // Small delay between messages to avoid rate limits
                setTimeout(() => {
                    message.channel.send({ embeds: [embeds[i]] });
                }, i * 1000);
            }
        }
    },

    sendCommandDetails(message, command, config) {
        const embed = {
            color: 0xe74c3c,
            title: `🔍 Command Details: ${command.name}`,
            fields: [
                {
                    name: '📄 Description',
                    value: command.description || 'No description provided',
                    inline: false
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'Mirai Bot • Command Information'
            }
        };

        // Add basic info
        if (command.aliases && command.aliases.length) {
            embed.fields.push({
                name: '🔗 Aliases',
                value: command.aliases.map(alias => `\`${alias}\``).join(', '),
                inline: true
            });
        }

        if (command.usage) {
            embed.fields.push({
                name: '💡 Usage',
                value: `\`${config.prefix}${command.name} ${command.usage}\``,
                inline: true
            });
        }

        // Add advanced info
        const advancedInfo = [];
        
        if (command.cooldown) {
            advancedInfo.push(`**Cooldown:** ${command.cooldown} seconds`);
        }

        if (command.category) {
            advancedInfo.push(`**Category:** ${command.category}`);
        }

        if (command.ownerOnly) {
            advancedInfo.push(`**Access:** Owner Only`);
        }

        if (command.permissions && command.permissions.length) {
            advancedInfo.push(`**Permissions:** ${command.permissions.join(', ')}`);
        }

        if (advancedInfo.length > 0) {
            embed.fields.push({
                name: '⚙️ Advanced Info',
                value: advancedInfo.join('\n'),
                inline: false
            });
        }

        // Add example if usage exists
        if (command.usage) {
            let example = `${config.prefix}${command.name}`;
            
            // Create example based on usage pattern
            if (command.usage.includes('[') && command.usage.includes(']')) {
                // Optional parameter
                if (command.name === 'help') example += ' ping';
                else if (command.name === 'reload') example += ' ping';
                else example += '';
            } else if (command.usage.includes('<') && command.usage.includes('>')) {
                // Required parameter
                example += ' example_value';
            }

            embed.fields.push({
                name: '📝 Example',
                value: `\`${example}\``,
                inline: false
            });
        }

        return message.reply({ embeds: [embed] });
    },

    getCategoryEmoji(category) {
        const categoryEmojis = {
            'General': '📚',
            'Utility': '🔧',
            'System': '⚙️',
            'Fun': '🎉',
            'Moderation': '🛡️',
            'Music': '🎵',
            'Economy': '💰',
            'Game': '🎮'
        };
        return categoryEmojis[category] || '📁';
    }
};