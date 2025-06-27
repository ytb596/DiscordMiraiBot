
module.exports = {
    name: 'dice',
    description: 'Tung một hoặc nhiều xúc xắc với số mặt tùy chọn',
    aliases: ['roll', 'xucxac', 'tung'],
    usage: '[số_xúc_xắc] [số_mặt]',
    cooldown: 3,
    category: 'Giải trí',
    version: '1.1.0',
    cre: 'MiraiDev',

    async execute(client, message, args) {
        try {
            let numDice = 1;
            let numSides = 6;

            // Parse arguments
            if (args.length >= 1 && !isNaN(args[0])) {
                numDice = parseInt(args[0]);
            }
            if (args.length >= 2 && !isNaN(args[1])) {
                numSides = parseInt(args[1]);
            }

            // Validation
            if (numDice < 1 || numDice > 10) {
                return message.reply('❌ Số xúc xắc phải từ 1 đến 10!');
            }
            if (numSides < 2 || numSides > 100) {
                return message.reply('❌ Số mặt phải từ 2 đến 100!');
            }

            const results = [];
            let total = 0;

            for (let i = 0; i < numDice; i++) {
                const roll = Math.floor(Math.random() * numSides) + 1;
                results.push(roll);
                total += roll;
            }

            const embed = {
                color: 0xe74c3c,
                title: '🎲 Tung Xúc Xắc',
                fields: [
                    {
                        name: '🎯 Kết quả',
                        value: results.map((result, index) => `Xúc xắc ${index + 1}: **${result}**`).join('\n'),
                        inline: false
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: `MIRAI Bot • Tung bởi ${message.author.username}`
                }
            };

            if (numDice > 1) {
                embed.fields.push({
                    name: '📊 Tổng cộng',
                    value: `**${total}** (từ ${numDice} xúc xắc ${numSides} mặt)`,
                    inline: false
                });
            } else {
                embed.description = `🎲 Xúc xắc ${numSides} mặt: **${results[0]}**`;
            }

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error executing ${this.name}:`, error);
            return message.reply('❌ Đã xảy ra lỗi khi tung xúc xắc!');
        }
    }
};
