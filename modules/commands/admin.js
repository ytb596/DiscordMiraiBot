module.exports = {
    name: 'admin',
    description: 'Admin management commands - add, remove, or list administrators',
    aliases: ['adm'],
    usage: '<add|remove|list> [user_id]',
    cooldown: 5,
    category: 'System',
    ownerOnly: true,

    async execute(client, message, args) {
        const config = require('../../config');
        const fs = require('fs');
        const path = require('path');

        // Check if user is bot owner
        if (!config.owners.includes(message.author.id)) {
            return message.reply('❌ This command is restricted to bot owners only!');
        }

        if (!args.length) {
            return this.sendAdminHelp(message, config);
        }

        const subCommand = args[0].toLowerCase();
        const userId = args[1];

        switch (subCommand) {
            case 'add':
                return this.addAdmin(message, userId, config);
            case 'remove':
            case 'rem':
            case 'delete':
            case 'del':
                return this.removeAdmin(message, userId, config);
            case 'list':
            case 'ls':
                return this.listAdmins(message, client, config);
            default:
                return this.sendAdminHelp(message, config);
        }
    },

    sendAdminHelp(message, config) {
        const embed = {
            color: 0xe74c3c,
            title: '⚙️ Admin Management Commands',
            description: 'Manage bot administrators and their permissions.',
            fields: [
                {
                    name: '➕ Add Admin',
                    value: `\`${config.prefix}admin add <user_id>\`\nAdd a new administrator to the bot`,
                    inline: false
                },
                {
                    name: '➖ Remove Admin',
                    value: `\`${config.prefix}admin remove <user_id>\`\nRemove an administrator from the bot`,
                    inline: false
                },
                {
                    name: '📋 List Admins',
                    value: `\`${config.prefix}admin list\`\nShow all current administrators`,
                    inline: false
                },
                {
                    name: '💡 Tips',
                    value: '• User ID can be found by enabling Developer Mode in Discord\n• Right-click on user → Copy ID\n• Only bot owners can manage admins',
                    inline: false
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'Mirai Bot • Admin Management'
            }
        };

        return message.reply({ embeds: [embed] });
    },

    async addAdmin(message, userId, config) {
        if (!userId) {
            return message.reply('❌ Please provide a user ID to add as admin!\nUsage: `!admin add <user_id>`');
        }

        // Validate user ID format
        if (!/^\d{17,19}$/.test(userId)) {
            return message.reply('❌ Invalid user ID format! User ID should be 17-19 digits.');
        }

        // Check if user is already an admin
        if (config.owners.includes(userId)) {
            return message.reply('❌ This user is already an administrator!');
        }

        try {
            // Try to fetch user to verify they exist
            const user = await message.client.users.fetch(userId).catch(() => null);
            
            if (!user) {
                return message.reply('⚠️ Could not find user with that ID. Adding anyway...');
            }

            // Add to config
            config.owners.push(userId);

            // Save to config.json
            await this.saveConfig(config);

            const embed = {
                color: 0x2ecc71,
                title: '✅ Admin Added Successfully',
                fields: [
                    {
                        name: '👤 User Added',
                        value: user ? `${user.tag} (\`${userId}\`)` : `User ID: \`${userId}\``,
                        inline: true
                    },
                    {
                        name: '📊 Total Admins',
                        value: `${config.owners.length}`,
                        inline: true
                    },
                    {
                        name: '⚡ Status',
                        value: 'Config updated and saved',
                        inline: true
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: 'Mirai Bot • Admin Management'
                }
            };

            return message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error adding admin:', error);
            return message.reply('❌ Failed to add admin. Please check the logs for details.');
        }
    },

    async removeAdmin(message, userId, config) {
        if (!userId) {
            return message.reply('❌ Please provide a user ID to remove from admins!\nUsage: `!admin remove <user_id>`');
        }

        // Check if user is an admin
        const adminIndex = config.owners.indexOf(userId);
        if (adminIndex === -1) {
            return message.reply('❌ This user is not an administrator!');
        }

        // Prevent removing the last owner
        if (config.owners.length === 1) {
            return message.reply('❌ Cannot remove the last administrator! At least one owner must remain.');
        }

        // Prevent removing self (safety check)
        if (userId === message.author.id) {
            return message.reply('❌ You cannot remove yourself as an administrator!');
        }

        try {
            // Try to fetch user info for display
            const user = await message.client.users.fetch(userId).catch(() => null);

            // Remove from config
            config.owners.splice(adminIndex, 1);

            // Save to config.json
            await this.saveConfig(config);

            const embed = {
                color: 0xe67e22,
                title: '✅ Admin Removed Successfully',
                fields: [
                    {
                        name: '👤 User Removed',
                        value: user ? `${user.tag} (\`${userId}\`)` : `User ID: \`${userId}\``,
                        inline: true
                    },
                    {
                        name: '📊 Total Admins',
                        value: `${config.owners.length}`,
                        inline: true
                    },
                    {
                        name: '⚡ Status',
                        value: 'Config updated and saved',
                        inline: true
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: 'Mirai Bot • Admin Management'
                }
            };

            return message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error removing admin:', error);
            return message.reply('❌ Failed to remove admin. Please check the logs for details.');
        }
    },

    async listAdmins(message, client, config) {
        if (!config.owners || config.owners.length === 0) {
            return message.reply('❌ No administrators found!');
        }

        const adminList = [];
        
        for (const ownerId of config.owners) {
            try {
                const user = await client.users.fetch(ownerId).catch(() => null);
                if (user) {
                    const status = ownerId === message.author.id ? ' (You)' : '';
                    adminList.push(`• ${user.tag} - \`${ownerId}\`${status}`);
                } else {
                    adminList.push(`• Unknown User - \`${ownerId}\``);
                }
            } catch (error) {
                adminList.push(`• Error fetching - \`${ownerId}\``);
            }
        }

        // Split into multiple embeds if too many admins
        const maxPerEmbed = 10;
        const embeds = [];

        for (let i = 0; i < adminList.length; i += maxPerEmbed) {
            const currentList = adminList.slice(i, i + maxPerEmbed);
            const pageNum = Math.floor(i / maxPerEmbed) + 1;
            const totalPages = Math.ceil(adminList.length / maxPerEmbed);

            const embed = {
                color: 0x3498db,
                title: `👥 Bot Administrators${totalPages > 1 ? ` (Page ${pageNum}/${totalPages})` : ''}`,
                description: currentList.join('\n'),
                fields: [
                    {
                        name: '📊 Statistics',
                        value: `**Total Admins:** ${config.owners.length}\n**Your Status:** ${config.owners.includes(message.author.id) ? 'Administrator' : 'Not Admin'}`,
                        inline: true
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: `Mirai Bot • Admin Management • Showing ${currentList.length} of ${adminList.length} admins`
                }
            };

            embeds.push(embed);
        }

        // Send embeds
        for (let i = 0; i < embeds.length; i++) {
            if (i === 0) {
                await message.reply({ embeds: [embeds[i]] });
            } else {
                setTimeout(() => {
                    message.channel.send({ embeds: [embeds[i]] });
                }, i * 1000);
            }
        }
    },

    async saveConfig(config) {
        const fs = require('fs').promises;
        const path = require('path');
        
        try {
            const configPath = path.join(__dirname, '..', '..', 'config.json');
            await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error('Error saving config:', error);
            throw error;
        }
    }
};