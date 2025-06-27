module.exports = {
    name: 'ping',
    description: 'Kiểm tra độ trễ và thời gian phản hồi của bot',
    aliases: ['delay', 'pong', 'dotrem'],
    cooldown: 3,
    category: 'Chính',
    version: '1.5.0',
    cre: 'MiraiDev',

    async execute(client, message, args) {
        const sent = await message.reply('🏓 Đang kiểm tra...');
        const timeDiff = sent.createdTimestamp - message.createdTimestamp;
        const wsLatency = client.ws.ping;

        const embed = {
            color: 0x00ff00,
            title: '🏓 Pong!',
            fields: [
                {
                    name: '📨 Độ trễ tin nhắn',
                    value: `${timeDiff}ms`,
                    inline: true
                },
                {
                    name: '💓 Độ trễ WebSocket',
                    value: `${wsLatency}ms`,
                    inline: true
                },
                {
                    name: '⏱️ Chất lượng kết nối',
                    value: this.getLatencyQuality(Math.max(timeDiff, wsLatency)),
                    inline: true
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'MIRAI Bot • Lệnh Ping'
            }
        };

        await sent.edit({ content: '', embeds: [embed] });
    },



    getLatencyQuality(latency) {
        if (latency < 100) return '🟢 Xuất sắc';
        if (latency < 200) return '🟡 Tốt';
        if (latency < 500) return '🟠 Khá';
        return '🔴 Kém';
    }
};
