
module.exports = {
    name: 'choose',
    description: 'Chọn ngẫu nhiên một tùy chọn từ danh sách được cung cấp',
    aliases: ['pick', 'select', 'chon'],
    usage: '<tùy_chọn_1> <tùy_chọn_2> [tùy_chọn_3...]',
    cooldown: 2,
    category: 'Tiện ích',
    version: '1.0.0',
    cre: 'MiraiDev',

    async execute(client, message, args) {
        try {
            if (args.length < 2) {
                return message.reply('❌ Bạn cần cung cấp ít nhất 2 tùy chọn để tôi có thể chọn!');
            }

            // Tách các tùy chọn bằng dấu phẩy hoặc dấu cách
            let options = [];
            const joined = args.join(' ');
            
            if (joined.includes(',')) {
                options = joined.split(',').map(option => option.trim()).filter(option => option.length > 0);
            } else {
                options = args;
            }

            if (options.length < 2) {
                return message.reply('❌ Bạn cần cung cấp ít nhất 2 tùy chọn để tôi có thể chọn!');
            }

            const randomChoice = options[Math.floor(Math.random() * options.length)];

            const embed = {
                color: 0x3498db,
                title: '🎯 Lựa Chọn Ngẫu Nhiên',
                fields: [
                    {
                        name: '📝 Các tùy chọn',
                        value: options.map((option, index) => `${index + 1}. ${option}`).join('\n'),
                        inline: false
                    },
                    {
                        name: '✨ Lựa chọn của tôi',
                        value: `**${randomChoice}**`,
                        inline: false
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: `MIRAI Bot • Chọn cho ${message.author.username}`
                }
            };

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error executing ${this.name}:`, error);
            return message.reply('❌ Đã xảy ra lỗi khi chọn tùy chọn!');
        }
    }
};
