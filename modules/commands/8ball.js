
module.exports = {
    name: '8ball',
    description: 'Hỏi quả cầu thần 8 một câu hỏi và nhận câu trả lời ngẫu nhiên',
    aliases: ['8b', 'ball', 'magic8'],
    usage: '<câu hỏi>',
    cooldown: 3,
    category: 'Giải trí',
    version: '1.2.0',
    cre: 'MiraiDev',

    async execute(client, message, args) {
        try {
            if (!args.length) {
                return message.reply('❌ Bạn cần đặt một câu hỏi cho quả cầu thần 8!');
            }

            const question = args.join(' ');
            const responses = [
                '✅ Chắc chắn rồi!',
                '✅ Không nghi ngờ gì nữa.',
                '✅ Có, chắc chắn.',
                '✅ Bạn có thể tin tưởng vào điều đó.',
                '✅ Theo tôi thấy thì có.',
                '✅ Có khả năng cao.',
                '✅ Triển vọng tốt.',
                '✅ Có.',
                '✅ Các dấu hiệu đều chỉ về có.',
                '⚠️ Trả lời mơ hồ, hãy thử lại.',
                '⚠️ Hỏi lại sau.',
                '⚠️ Tốt hơn là đừng nói cho bạn bây giờ.',
                '⚠️ Không thể dự đoán bây giờ.',
                '⚠️ Tập trung và hỏi lại.',
                '❌ Đừng trông chờ vào điều đó.',
                '❌ Câu trả lời của tôi là không.',
                '❌ Các nguồn tin của tôi nói không.',
                '❌ Triển vọng không tốt lắm.',
                '❌ Rất đáng nghi ngờ.',
                '❌ Không.'
            ];

            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            const embed = {
                color: 0x9b59b6,
                title: '🎱 Quả Cầu Thần 8',
                fields: [
                    {
                        name: '❓ Câu hỏi',
                        value: question,
                        inline: false
                    },
                    {
                        name: '🔮 Câu trả lời',
                        value: randomResponse,
                        inline: false
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: `MIRAI Bot • Hỏi bởi ${message.author.username}`
                }
            };

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error executing ${this.name}:`, error);
            return message.reply('❌ Đã xảy ra lỗi khi hỏi quả cầu thần 8!');
        }
    }
};
