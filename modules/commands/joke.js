const axios = require('axios');

module.exports = {
    name: 'joke',
    description: 'Lấy một câu quote Joker ngẫu nhiên (API + tự chế)',
    aliases: ['joker', 'caucham', 'trichdan'],
    usage: '',
    cooldown: 3,
    category: 'Giải trí',
    version: '1.1.0',
    cre: 'MiraiDev',

    async execute(client, message, args) {
        const customQuotes = [
            '💣 "Xã hội này không cần người giỏi, chỉ cần người nổi bật!"',
            '🃏 "Cười lên đi... để người ta không thấy nước mắt mày!"',
            '🎭 "Thế giới không điên, nó chỉ đang thích nghi với sự điên!"',
            '☠️ "Tao không phải người xấu... tao chỉ phản ứng lại theo cách của tao!"',
            '🪞 "Muốn làm anh hùng? Vậy sẵn sàng chết vì đám người không biết ơn chưa?"',
            '🔪 "Tao từng muốn thay đổi thế giới. Giờ tao chỉ muốn nhìn nó cháy thôi!"',
            '🫥 "Mày sống thật quá lâu trong vai người tốt, đến mức quên mất cách làm ác!"'
        ];

        try {
            let quote;
            const useCustom = Math.random() < 0.3; // 30% tỉ lệ dùng câu tự chế

            if (useCustom) {
                quote = customQuotes[Math.floor(Math.random() * customQuotes.length)];
            } else {
                const res = await axios.get('https://adidaphat.site/text/joker');
                quote = res.data?.data || customQuotes[Math.floor(Math.random() * customQuotes.length)];
            }

            const embed = {
                color: 0x9b59b6,
                title: '🃏 Joker nói rằng...',
                description: `> *${quote}*`,
                footer: {
                    text: `MIRAI Bot • Câu nói Joker`,
                },
                timestamp: new Date()
            };

            return message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(`Lỗi khi thực thi lệnh ${this.name}:`, error);

            // Fallback hoàn toàn nếu lỗi API
            const fallbackQuote = customQuotes[Math.floor(Math.random() * customQuotes.length)];

            const fallbackEmbed = {
                color: 0xe74c3c,
                title: '🃏 Joker nói nhỏ...',
                description: `> *${fallbackQuote}*`,
                footer: {
                    text: `MIRAI Bot • (Chế độ dự phòng)`,
                },
                timestamp: new Date()
            };

            return message.reply({ embeds: [fallbackEmbed] });
        }
    }
};