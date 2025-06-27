module.exports = {
    name: 'status',
    description: 'Hiển thị trạng thái bot, thống kê và thông tin hệ thống toàn diện',
    aliases: ['info', 'stats', 'botinfo', 'trangthai'],
    cooldown: 5,
    category: 'Chính',
    version: '2.0.0',
    cre: 'MiraiCore',

    async execute(client, message, args) {
        const permissions = require('../../utility/permissions');
        const config = require('../../config');
        const cache = require('../../modules/cache');

        // Calculate uptime
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // Memory usage
        const memUsage = process.memoryUsage();
        const memUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
        const memTotal = Math.round(memUsage.heapTotal / 1024 / 1024);

        // Guild information
        const totalGuilds = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        // Permission stats
        const userLevel = permissions.getUserLevel(message.author.id);
        const isApprovedGuild = message.guild ? permissions.isGuildApproved(message.guild.id) : true;
        const guildStatus = message.guild ? permissions.getGuildStatus(message.guild.id) : 'DM';

        // Cache statistics
        const cacheStats = cache.getStats();

        // Build main embed
        const mainEmbed = {
            color: 0x00d4ff,
            title: '🤖 MIRAI Bot Status',
            description: 'Advanced Discord Bot with Premium Features',
            thumbnail: {
                url: client.user.displayAvatarURL({ dynamic: true, size: 256 })
            },
            fields: [
                {
                    name: '⚡ System Status',
                    value: `**Uptime:** ${uptimeString}\n**Memory:** ${memUsed}MB / ${memTotal}MB\n**Node.js:** ${process.version}\n**Discord.js:** v14.21.0`,
                    inline: true
                },
                {
                    name: '📊 Bot Statistics',
                    value: `**Guilds:** ${totalGuilds}\n**Users:** ${totalUsers.toLocaleString()}\n**Commands:** ${client.commands.size}\n**Ping:** ${client.ws.ping}ms`,
                    inline: true
                },
                {
                    name: '🔑 Your Status',
                    value: `**Level:** ${userLevel}\n**Guild Status:** ${guildStatus}\n**Access:** ${isApprovedGuild || permissions.hasHighestPermissions(message.author.id) ? '✅ Granted' : '⏳ Limited'}`,
                    inline: true
                }
            ]
        };

        // Administration embed (for admins only)
        let adminEmbed = null;
        if (permissions.isAdmin(message.author.id) || permissions.isOwner(message.author.id)) {
            adminEmbed = {
                color: 0xff9500,
                title: '👑 Administration Panel',
                fields: [
                    {
                        name: '🏰 Guild Management',
                        value: `**Approved:** ${config.guilds.approved.length}\n**Pending:** ${config.guilds.pending.length}\n**Blacklisted:** ${config.guilds.blacklisted.length}`,
                        inline: true
                    },
                    {
                        name: '👥 Staff Members',
                        value: `**Owners:** ${config.owners.length}\n**Main Admins:** ${config.admins.main.length}\n**Sub Admins:** ${config.admins.sub.length}`,
                        inline: true
                    },
                    {
                        name: '🗄️ Cache System',
                        value: `**Entries:** ${cacheStats.size}/${cacheStats.maxSize}\n**Persistent:** ${cacheStats.persistentEntries}\n**Total Hits:** ${cacheStats.totalHits}`,
                        inline: true
                    }
                ],
                footer: {
                    text: 'Administration data visible to staff only'
                }
            };
        }

        // Performance embed
        const performanceEmbed = {
            color: 0x2ecc71,
            title: '📈 Performance Metrics',
            fields: [
                {
                    name: '🔥 Hot Reload System',
                    value: `**Status:** Active\n**Watched Files:** ${client.commands.size}\n**Auto Discovery:** Enabled\n**Real-time Updates:** ✅`,
                    inline: true
                },
                {
                    name: '🛡️ Security Features',
                    value: `**Permission System:** Multi-level\n**Guild Protection:** Active\n**Cooldown System:** Enabled\n**Error Handling:** Advanced`,
                    inline: true
                },
                {
                    name: '🎨 Features',
                    value: `**Colored Logs:** ✅\n**Command Menu:** ✅\n**Admin Panel:** ✅\n**Cache System:** ✅`,
                    inline: true
                }
            ],
            footer: {
                text: `MIRAI Bot • Powered by Node.js • Last reboot: ${new Date(Date.now() - uptime * 1000).toLocaleString()}`
            }
        };

        // Send embeds
        const embeds = [mainEmbed];
        if (adminEmbed) embeds.push(adminEmbed);
        embeds.push(performanceEmbed);

        // Send first embed as reply
        await message.reply({ embeds: [embeds[0]] });

        // Send additional embeds with delay
        for (let i = 1; i < embeds.length; i++) {
            setTimeout(() => {
                message.channel.send({ embeds: [embeds[i]] });
            }, i * 1500);
        }

        // Add quick action buttons for admins
        if (permissions.hasHighestPermissions(message.author.id)) {
            setTimeout(() => {
                const quickActionsEmbed = {
                    color: 0x9b59b6,
                    title: '⚡ Quick Actions',
                    description: 'Common administrative commands for quick access:',
                    fields: [
                        {
                            name: '🔧 Management',
                            value: `\`${config.prefix}admin list\` - View all admins\n\`${config.prefix}admin guild list\` - Guild overview\n\`${config.prefix}reload\` - Reload commands`,
                            inline: true
                        },
                        {
                            name: '📋 Information',
                            value: `\`${config.prefix}menu all\` - All commands\n\`${config.prefix}admin guild pending\` - Pending guilds\n\`${config.prefix}ping\` - Bot latency`,
                            inline: true
                        }
                    ],
                    footer: {
                        text: 'Quick actions panel for administrators'
                    }
                };
                message.channel.send({ embeds: [quickActionsEmbed] });
            }, embeds.length * 1500);
        }
    }
};