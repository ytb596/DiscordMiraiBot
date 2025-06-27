module.exports = {
    name: 'admin',
    description: 'Admin management commands - manage main/sub admins and guild permissions',
    aliases: ['adm'],
    usage: '<add|remove|list|guild> [main|sub] [user_id]',
    cooldown: 5,
    category: 'System',
    ownerOnly: true,

    async execute(client, message, args) {
        const config = require('../../config');
        const permissions = require('../../utility/permissions');
        const fs = require('fs');
        const path = require('path');

        // Check if user has permission to use admin commands
        if (!permissions.hasHighestPermissions(message.author.id)) {
            return message.reply('❌ This command is restricted to owners and main admins only!');
        }

        if (!args.length) {
            return this.sendAdminHelp(message, config);
        }

        const subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case 'add':
                return this.addAdmin(message, args.slice(1), config, permissions);
            case 'remove':
            case 'rem':
            case 'delete':
            case 'del':
                return this.removeAdmin(message, args.slice(1), config, permissions);
            case 'list':
            case 'ls':
                return this.listAdmins(message, client, config, permissions);
            case 'guild':
            case 'server':
                return this.manageGuild(message, args.slice(1), config, permissions);
            default:
                return this.sendAdminHelp(message, config);
        }
    },

    sendAdminHelp(message, config) {
        const embed = {
            color: 0xe74c3c,
            title: '⚙️ Advanced Admin Management',
            description: 'Comprehensive admin and guild management system with role hierarchy.',
            fields: [
                {
                    name: '👑 Add Admin',
                    value: `\`${config.prefix}admin add main <user_id>\` - Add Main Admin\n\`${config.prefix}admin add sub <user_id>\` - Add Sub Admin`,
                    inline: false
                },
                {
                    name: '🗑️ Remove Admin',
                    value: `\`${config.prefix}admin remove main <user_id>\` - Remove Main Admin\n\`${config.prefix}admin remove sub <user_id>\` - Remove Sub Admin`,
                    inline: false
                },
                {
                    name: '📋 List & Info',
                    value: `\`${config.prefix}admin list\` - Show all administrators\n\`${config.prefix}admin list main\` - Main admins only\n\`${config.prefix}admin list sub\` - Sub admins only`,
                    inline: false
                },
                {
                    name: '🏰 Guild Management',
                    value: `\`${config.prefix}admin guild approve <guild_id>\` - Approve guild\n\`${config.prefix}admin guild blacklist <guild_id>\` - Blacklist guild\n\`${config.prefix}admin guild list\` - View guild status`,
                    inline: false
                },
                {
                    name: '🔑 Permission Levels',
                    value: '**Owner:** Full control, can manage everything\n**Main Admin:** Can manage sub admins and guilds\n**Sub Admin:** Limited guild access, basic commands',
                    inline: false
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'MIRAI Bot • Advanced Administration System'
            }
        };

        return message.reply({ embeds: [embed] });
    },

    async addAdmin(message, args, config, permissions) {
        if (args.length < 2) {
            return message.reply('❌ Usage: `!admin add <main|sub> <user_id>`');
        }

        const adminType = args[0].toLowerCase();
        const userId = args[1];

        if (!['main', 'sub'].includes(adminType)) {
            return message.reply('❌ Admin type must be `main` or `sub`');
        }

        // Validate user ID format
        if (!/^\d{17,19}$/.test(userId)) {
            return message.reply('❌ Invalid user ID format! User ID should be 17-19 digits.');
        }

        // Check permissions for adding main admins (only owners can add main admins)
        if (adminType === 'main' && !permissions.isOwner(message.author.id)) {
            return message.reply('❌ Only bot owners can add main administrators!');
        }

        // Check if user is already an admin
        if (permissions.isAdmin(userId) || permissions.isOwner(userId)) {
            const currentLevel = permissions.getUserLevel(userId);
            return message.reply(`❌ This user is already a ${currentLevel}!`);
        }

        try {
            // Try to fetch user to verify they exist
            const user = await message.client.users.fetch(userId).catch(() => null);

            // Add to appropriate admin list
            if (adminType === 'main') {
                config.admins.main.push(userId);
            } else {
                config.admins.sub.push(userId);
            }

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
                        name: '👑 Admin Level',
                        value: adminType === 'main' ? 'Main Administrator' : 'Sub Administrator',
                        inline: true
                    },
                    {
                        name: '📊 Total Admins',
                        value: `Main: ${config.admins.main.length}\nSub: ${config.admins.sub.length}`,
                        inline: true
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: 'MIRAI Bot • Advanced Admin System'
                }
            };

            return message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error adding admin:', error);
            return message.reply('❌ Failed to add admin. Please check the logs for details.');
        }
    },

    async removeAdmin(message, args, config, permissions) {
        if (args.length < 2) {
            return message.reply('❌ Usage: `!admin remove <main|sub> <user_id>`');
        }

        const adminType = args[0].toLowerCase();
        const userId = args[1];

        if (!['main', 'sub'].includes(adminType)) {
            return message.reply('❌ Admin type must be `main` or `sub`');
        }

        // Check permissions for removing main admins (only owners can remove main admins)
        if (adminType === 'main' && !permissions.isOwner(message.author.id)) {
            return message.reply('❌ Only bot owners can remove main administrators!');
        }

        // Prevent removing self
        if (userId === message.author.id) {
            return message.reply('❌ You cannot remove yourself as an administrator!');
        }

        const targetList = adminType === 'main' ? config.admins.main : config.admins.sub;
        const adminIndex = targetList.indexOf(userId);

        if (adminIndex === -1) {
            return message.reply(`❌ This user is not a ${adminType} administrator!`);
        }

        // Prevent removing the last main admin
        if (adminType === 'main' && config.admins.main.length === 1) {
            return message.reply('❌ Cannot remove the last main administrator! At least one must remain.');
        }

        try {
            const user = await message.client.users.fetch(userId).catch(() => null);

            // Remove from appropriate list
            targetList.splice(adminIndex, 1);

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
                        name: '👑 Admin Level',
                        value: adminType === 'main' ? 'Main Administrator' : 'Sub Administrator',
                        inline: true
                    },
                    {
                        name: '📊 Total Admins',
                        value: `Main: ${config.admins.main.length}\nSub: ${config.admins.sub.length}`,
                        inline: true
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: 'MIRAI Bot • Advanced Admin System'
                }
            };

            return message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error removing admin:', error);
            return message.reply('❌ Failed to remove admin. Please check the logs for details.');
        }
    },

    async listAdmins(message, client, config, permissions) {
        const listType = message.content.split(' ')[2]?.toLowerCase() || 'all';
        
        if (!['all', 'main', 'sub'].includes(listType)) {
            return message.reply('❌ List type must be `all`, `main`, or `sub`');
        }

        const ownersList = [];
        const mainAdminsList = [];
        const subAdminsList = [];

        // Fetch owners
        for (const ownerId of config.owners) {
            try {
                const user = await client.users.fetch(ownerId).catch(() => null);
                const status = ownerId === message.author.id ? ' (You)' : '';
                ownersList.push({
                    text: `• ${user ? user.tag : 'Unknown User'} - \`${ownerId}\`${status}`,
                    level: 'Owner'
                });
            } catch (error) {
                ownersList.push({
                    text: `• Error fetching - \`${ownerId}\``,
                    level: 'Owner'
                });
            }
        }

        // Fetch main admins
        for (const adminId of config.admins.main) {
            try {
                const user = await client.users.fetch(adminId).catch(() => null);
                const status = adminId === message.author.id ? ' (You)' : '';
                mainAdminsList.push({
                    text: `• ${user ? user.tag : 'Unknown User'} - \`${adminId}\`${status}`,
                    level: 'Main Admin'
                });
            } catch (error) {
                mainAdminsList.push({
                    text: `• Error fetching - \`${adminId}\``,
                    level: 'Main Admin'
                });
            }
        }

        // Fetch sub admins
        for (const adminId of config.admins.sub) {
            try {
                const user = await client.users.fetch(adminId).catch(() => null);
                const status = adminId === message.author.id ? ' (You)' : '';
                subAdminsList.push({
                    text: `• ${user ? user.tag : 'Unknown User'} - \`${adminId}\`${status}`,
                    level: 'Sub Admin'
                });
            } catch (error) {
                subAdminsList.push({
                    text: `• Error fetching - \`${adminId}\``,
                    level: 'Sub Admin'
                });
            }
        }

        const embed = {
            color: 0x3498db,
            title: '👥 MIRAI Bot Administration',
            fields: [],
            timestamp: new Date(),
            footer: {
                text: `MIRAI Bot • Your Level: ${permissions.getUserLevel(message.author.id)}`
            }
        };

        if (listType === 'all' || listType === 'main') {
            if (ownersList.length > 0) {
                embed.fields.push({
                    name: '👑 Bot Owners',
                    value: ownersList.map(item => item.text).join('\n') || 'None',
                    inline: false
                });
            }

            if (mainAdminsList.length > 0) {
                embed.fields.push({
                    name: '⭐ Main Administrators',
                    value: mainAdminsList.map(item => item.text).join('\n') || 'None',
                    inline: false
                });
            }
        }

        if (listType === 'all' || listType === 'sub') {
            if (subAdminsList.length > 0) {
                embed.fields.push({
                    name: '🔰 Sub Administrators',
                    value: subAdminsList.map(item => item.text).join('\n') || 'None',
                    inline: false
                });
            }
        }

        // Add statistics
        embed.fields.push({
            name: '📊 Administration Statistics',
            value: `**Owners:** ${config.owners.length}\n**Main Admins:** ${config.admins.main.length}\n**Sub Admins:** ${config.admins.sub.length}\n**Total Staff:** ${config.owners.length + config.admins.main.length + config.admins.sub.length}`,
            inline: true
        });

        // Add guild info
        embed.fields.push({
            name: '🏰 Guild Management',
            value: `**Approved:** ${config.guilds.approved.length}\n**Pending:** ${config.guilds.pending.length}\n**Blacklisted:** ${config.guilds.blacklisted.length}`,
            inline: true
        });

        return message.reply({ embeds: [embed] });
    },

    async manageGuild(message, args, config, permissions) {
        if (args.length < 1) {
            return message.reply('❌ Usage: `!admin guild <approve|blacklist|list|pending> [guild_id]`');
        }

        const action = args[0].toLowerCase();
        const guildId = args[1];

        switch (action) {
            case 'approve':
                return this.approveGuild(message, guildId, config, permissions);
            case 'blacklist':
            case 'ban':
                return this.blacklistGuild(message, guildId, config, permissions);
            case 'list':
                return this.listGuilds(message, config);
            case 'pending':
                return this.listPendingGuilds(message, config);
            default:
                return message.reply('❌ Valid actions: `approve`, `blacklist`, `list`, `pending`');
        }
    },

    async approveGuild(message, guildId, config, permissions) {
        if (!guildId) {
            return message.reply('❌ Please provide a guild ID to approve!');
        }

        if (!/^\d{17,19}$/.test(guildId)) {
            return message.reply('❌ Invalid guild ID format!');
        }

        try {
            const guild = await message.client.guilds.fetch(guildId).catch(() => null);
            
            // Add to approved list
            if (!config.guilds.approved.includes(guildId)) {
                config.guilds.approved.push(guildId);
            }

            // Remove from pending and blacklisted
            const pendingIndex = config.guilds.pending.indexOf(guildId);
            if (pendingIndex > -1) config.guilds.pending.splice(pendingIndex, 1);

            const blacklistIndex = config.guilds.blacklisted.indexOf(guildId);
            if (blacklistIndex > -1) config.guilds.blacklisted.splice(blacklistIndex, 1);

            await this.saveConfig(config);

            const embed = {
                color: 0x2ecc71,
                title: '✅ Guild Approved',
                fields: [
                    {
                        name: '🏰 Guild Info',
                        value: guild ? `${guild.name} (\`${guildId}\`)` : `Guild ID: \`${guildId}\``,
                        inline: true
                    },
                    {
                        name: '👥 Members',
                        value: guild ? guild.memberCount.toString() : 'Unknown',
                        inline: true
                    },
                    {
                        name: '⚡ Status',
                        value: 'Full bot access granted',
                        inline: true
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: 'MIRAI Bot • Guild Management'
                }
            };

            return message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error approving guild:', error);
            return message.reply('❌ Failed to approve guild. Please check the logs.');
        }
    },

    async blacklistGuild(message, guildId, config, permissions) {
        if (!guildId) {
            return message.reply('❌ Please provide a guild ID to blacklist!');
        }

        if (!/^\d{17,19}$/.test(guildId)) {
            return message.reply('❌ Invalid guild ID format!');
        }

        try {
            const guild = await message.client.guilds.fetch(guildId).catch(() => null);

            // Add to blacklist
            if (!config.guilds.blacklisted.includes(guildId)) {
                config.guilds.blacklisted.push(guildId);
            }

            // Remove from approved and pending
            const approvedIndex = config.guilds.approved.indexOf(guildId);
            if (approvedIndex > -1) config.guilds.approved.splice(approvedIndex, 1);

            const pendingIndex = config.guilds.pending.indexOf(guildId);
            if (pendingIndex > -1) config.guilds.pending.splice(pendingIndex, 1);

            await this.saveConfig(config);

            const embed = {
                color: 0xe74c3c,
                title: '🚫 Guild Blacklisted',
                fields: [
                    {
                        name: '🏰 Guild Info',
                        value: guild ? `${guild.name} (\`${guildId}\`)` : `Guild ID: \`${guildId}\``,
                        inline: true
                    },
                    {
                        name: '⚡ Status',
                        value: 'Bot access revoked',
                        inline: true
                    },
                    {
                        name: '🔒 Effect',
                        value: 'All commands disabled in this guild',
                        inline: true
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: 'MIRAI Bot • Guild Management'
                }
            };

            return message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error blacklisting guild:', error);
            return message.reply('❌ Failed to blacklist guild. Please check the logs.');
        }
    },

    async listGuilds(message, config) {
        const embed = {
            color: 0x3498db,
            title: '🏰 Guild Management Overview',
            fields: [
                {
                    name: '✅ Approved Guilds',
                    value: config.guilds.approved.length > 0 ? 
                        config.guilds.approved.slice(0, 10).map(id => `\`${id}\``).join('\n') + 
                        (config.guilds.approved.length > 10 ? `\n...and ${config.guilds.approved.length - 10} more` : '') :
                        'None',
                    inline: true
                },
                {
                    name: '⏳ Pending Guilds',
                    value: config.guilds.pending.length > 0 ? 
                        config.guilds.pending.slice(0, 10).map(id => `\`${id}\``).join('\n') + 
                        (config.guilds.pending.length > 10 ? `\n...and ${config.guilds.pending.length - 10} more` : '') :
                        'None',
                    inline: true
                },
                {
                    name: '🚫 Blacklisted Guilds',
                    value: config.guilds.blacklisted.length > 0 ? 
                        config.guilds.blacklisted.slice(0, 10).map(id => `\`${id}\``).join('\n') + 
                        (config.guilds.blacklisted.length > 10 ? `\n...and ${config.guilds.blacklisted.length - 10} more` : '') :
                        'None',
                    inline: true
                },
                {
                    name: '📊 Statistics',
                    value: `**Total Approved:** ${config.guilds.approved.length}\n**Total Pending:** ${config.guilds.pending.length}\n**Total Blacklisted:** ${config.guilds.blacklisted.length}`,
                    inline: false
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'MIRAI Bot • Guild Management System'
            }
        };

        return message.reply({ embeds: [embed] });
    },

    async listPendingGuilds(message, config) {
        if (config.guilds.pending.length === 0) {
            return message.reply('📭 No guilds are currently pending approval.');
        }

        const embed = {
            color: 0xf39c12,
            title: '⏳ Pending Guild Approvals',
            description: 'Guilds waiting for approval to use the bot.',
            fields: [
                {
                    name: '📋 Pending List',
                    value: config.guilds.pending.slice(0, 15).map((id, index) => 
                        `${index + 1}. \`${id}\``
                    ).join('\n') + 
                    (config.guilds.pending.length > 15 ? `\n...and ${config.guilds.pending.length - 15} more` : ''),
                    inline: false
                },
                {
                    name: '💡 Quick Actions',
                    value: '• Use `!admin guild approve <guild_id>` to approve\n• Use `!admin guild blacklist <guild_id>` to reject\n• Use `!admin guild list` for full overview',
                    inline: false
                }
            ],
            timestamp: new Date(),
            footer: {
                text: `MIRAI Bot • ${config.guilds.pending.length} guilds pending approval`
            }
        };

        return message.reply({ embeds: [embed] });
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