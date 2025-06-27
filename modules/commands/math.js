
module.exports = {
    name: 'math',
    description: 'Thực hiện các phép tính toán học cơ bản',
    aliases: ['calc', 'calculate', 'tinh'],
    usage: '<biểu_thức_toán_học>',
    cooldown: 3,
    category: 'Tiện ích',
    version: '1.3.0',
    cre: 'MiraiDev',

    async execute(client, message, args) {
        try {
            if (!args.length) {
                return message.reply('❌ Vui lòng cung cấp biểu thức toán học để tính!\n**Ví dụ:** `!math 2 + 2`, `!math 5 * 3 - 1`');
            }

            const expression = args.join(' ');
            
            // Kiểm tra các ký tự không an toàn
            if (!/^[0-9+\-*/.() ]+$/.test(expression)) {
                return message.reply('❌ Biểu thức chỉ được chứa số, dấu +, -, *, /, (, ) và khoảng trắng!');
            }

            // Kiểm tra các pattern nguy hiểm
            const dangerousPatterns = [
                /[a-zA-Z]/,  // Chữ cái
                /\.\./,      // Hai dấu chấm liên tiếp
                /\+\+/,      // Hai dấu cộng liên tiếp
                /--/,        // Hai dấu trừ liên tiếp
                /\*\*/,      // Hai dấu nhân liên tiếp
                /\/\//       // Hai dấu chia liên tiếp
            ];

            for (const pattern of dangerousPatterns) {
                if (pattern.test(expression)) {
                    return message.reply('❌ Biểu thức không hợp lệ!');
                }
            }

            let result;
            try {
                // Sử dụng Function constructor an toàn hơn eval
                result = Function(`"use strict"; return (${expression})`)();
            } catch (error) {
                return message.reply('❌ Biểu thức toán học không hợp lệ!');
            }

            // Kiểm tra kết quả
            if (!isFinite(result)) {
                return message.reply('❌ Kết quả không hợp lệ (vô cực hoặc NaN)!');
            }

            // Làm tròn kết quả nếu là số thập phân
            if (result % 1 !== 0) {
                result = Math.round(result * 100000000) / 100000000; // Làm tròn 8 chữ số thập phân
            }

            const embed = {
                color: 0x2ecc71,
                title: '🧮 Máy Tính Toán',
                fields: [
                    {
                        name: '📝 Biểu thức',
                        value: `\`${expression}\``,
                        inline: false
                    },
                    {
                        name: '✅ Kết quả',
                        value: `**${result}**`,
                        inline: false
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: `MIRAI Bot • Tính cho ${message.author.username}`
                }
            };

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error executing ${this.name}:`, error);
            return message.reply('❌ Đã xảy ra lỗi khi thực hiện phép tính!');
        }
    }
};
