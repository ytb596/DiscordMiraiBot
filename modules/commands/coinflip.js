
module.exports = {
    name: 'coinflip',
    description: 'Tung đồng xu và xem kết quả ngẫu nhiên',
    aliases: ['coin', 'flip', 'tungxu'],
    cooldown: 2,
    category: 'Giải trí',
    version: '1.1.0',
    cre: 'MiraiDev',

    async execute(client, message, args) {
        try {
            const isHeads = Math.random() < 0.5;
            const result = isHeads ? 'Mặt ngửa' : 'Mặt úp';
            const emoji = isHeads ? '🌟' : '⚪';

            const embed = {
                color: isHeads ? 0xffd700 : 0xc0c0c0,
                title: '🪙 Tung Đồng Xu',
                description: `${emoji} **${result}**`,
                fields: [
                    {
                        name: '🎯 Kết quả',
                        value: `Đồng xu đã rơi xuống và cho ra kết quả: **${result}**`,
                        inline: false
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: `MIRAI Bot • Tung bởi ${message.author.username}`
                }
            };

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error executing ${this.name}:`, error);
            return message.reply('❌ Đã xảy ra lỗi khi tung đồng xu!');
        }
    }
};
