module.exports = {
    name: 'help',
    description: 'Hiển thị tất cả lệnh có sẵn hoặc xem thông tin chi tiết về một lệnh',
    aliases: ['h', 'trogiup', 'lenhh'],
    usage: '[tên lệnh]',
    cooldown: 5,
    category: 'Chính',
    version: '1.8.0',
    cre: 'MiraiDev',

    async execute(client, message, args) {
        const { commands } = client;

        if (!args.length) {
            return this.sendAllCommands(message, commands);
        }

        const commandName = args[0].toLowerCase();
        const command = commands.get(commandName) || commands.find(c => c.aliases && c.aliases.includes(commandName));

        if (!command) {
            return message.reply(`❌ Không tìm thấy lệnh \`${commandName}\`!`);
        }

        return this.sendCommandInfo(message, command);
    },

    sendAllCommands(message, commands) {
        const config = require('../../config');
        const categories = {};

        commands.forEach(command => {
            const category = command.category || 'General';
            if (!categories[category]) categories[category] = [];
            categories[category].push(command);
        });

        const embed = {
            color: 0x3498db,
            title: '📚 Lệnh có sẵn',
            description: `Dùng \`${config.prefix}help <lệnh>\` để xem thông tin chi tiết về một lệnh.`,
            fields: [],
            timestamp: new Date(),
            footer: {
                text: `Tổng số lệnh: ${commands.size} • Tiền tố: ${config.prefix}`
            }
        };

        for (const [category, categoryCommands] of Object.entries(categories)) {
            const commandList = categoryCommands.map(cmd => `\`${cmd.name}\``).join(', ');
            embed.fields.push({
                name: `📁 ${category}`,
                value: commandList,
                inline: false
            });
        }

        return message.reply({ embeds: [embed] });
    },



    sendCommandInfo(message, command) {
        const config = require('../../config');
        const embed = {
            color: 0x2ecc71,
            title: `📝 Lệnh: ${command.name}`,
            fields: [
                {
                    name: '📄 Mô tả',
                    value: command.description || 'Không có mô tả',
                    inline: false
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'MIRAI Bot • Trợ giúp lệnh'
            }
        };

        if (command.aliases && command.aliases.length) {
            embed.fields.push({
                name: '🔗 Tên gọi khác',
                value: command.aliases.map(alias => `\`${alias}\``).join(', '),
                inline: true
            });
        }

        if (command.usage) {
            embed.fields.push({
                name: '💡 Cách dùng',
                value: `\`${config.prefix}${command.name} ${command.usage}\``,
                inline: true
            });
        }

        if (command.cooldown) {
            embed.fields.push({
                name: '⏰ Thời gian chờ',
                value: `${command.cooldown} giây`,
                inline: true
            });
        }

        if (command.version) {
            embed.fields.push({
                name: '🔖 Phiên bản',
                value: command.version,
                inline: true
            });
        }

        if (command.cre) {
            embed.fields.push({
                name: '👨‍💻 Người tạo',
                value: command.cre,
                inline: true
            });
        }

        return message.reply({ embeds: [embed] });
    }
};
