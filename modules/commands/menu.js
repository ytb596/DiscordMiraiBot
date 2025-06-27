module.exports = {
    name: 'menu',
    description: 'Hiển thị menu bot với danh sách lệnh và thông tin chi tiết',
    aliases: ['m', 'danhsach', 'ds'],
    usage: '[all|tên_lệnh]',
    cooldown: 3,
    category: 'Chính',
    version: '2.1.0',
    cre: 'MiraiDev',

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
                return message.reply(`❌ Không tìm thấy lệnh \`${subCommand}\`! Dùng \`${config.prefix}menu all\` để xem tất cả lệnh.`);
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
            title: '📋 Menu MIRAI Bot',
            description: `Chào mừng đến với MIRAI Bot! Đây là những gì tôi có thể làm cho bạn.`,
            fields: [],
            timestamp: new Date(),
            footer: {
                text: `Dùng ${config.prefix}menu all để xem tất cả lệnh • ${config.prefix}menu <lệnh> để xem chi tiết`
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
            name: '📊 Thống kê Bot',
            value: `**Lệnh:** ${commands.size}\n**Tiền tố:** ${config.prefix}\n**Trạng thái:** Online & Sẵn sàng`,
            inline: true
        });

        // Add usage info
        embed.fields.push({
            name: '💡 Hướng dẫn nhanh',
            value: `• \`${config.prefix}menu all\` - Hiện tất cả lệnh\n• \`${config.prefix}menu <lệnh>\` - Chi tiết lệnh\n• \`${config.prefix}help\` - Trợ giúp khác`,
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
            title: '📚 Tất cả lệnh',
            description: `Danh sách đầy đủ các lệnh có sẵn. Dùng \`${config.prefix}menu <lệnh>\` để xem chi tiết.`,
            fields: [],
            timestamp: new Date(),
            footer: {
                text: `Trang 1 • Tổng số lệnh: ${commands.size}`
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
                    title: '📚 Tất cả lệnh (Tiếp theo)',
                    fields: [],
                    timestamp: new Date(),
                    footer: {
                        text: `Trang ${embeds.length + 1} • Tổng số lệnh: ${commands.size}`
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
            title: `🔍 Chi tiết lệnh: ${command.name}`,
            fields: [
                {
                    name: '📄 Mô tả',
                    value: command.description || 'Không có mô tả',
                    inline: false
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'MIRAI Bot • Thông tin lệnh'
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
            advancedInfo.push(`**Quyền truy cập:** Chỉ Owner`);
        }

        if (command.permissions && command.permissions.length) {
            advancedInfo.push(`**Quyền hạn:** ${command.permissions.join(', ')}`);
        }

        // Add version and creator info
        if (command.version) {
            advancedInfo.push(`**Phiên bản:** ${command.version}`);
        }

        if (command.cre) {
            advancedInfo.push(`**Người tạo:** ${command.cre}`);
        }

        if (advancedInfo.length > 0) {
            embed.fields.push({
                name: '⚙️ Thông tin chi tiết',
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