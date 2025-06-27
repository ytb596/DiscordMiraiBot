module.exports = {
    name: 'ping',
    description: 'Check bot latency and response time',
    aliases: ['latency', 'pong'],
    cooldown: 3,

    async execute(client, message, args) {
        const sent = await message.reply('🏓 Pinging...');
        const timeDiff = sent.createdTimestamp - message.createdTimestamp;
        const wsLatency = client.ws.ping;

        const embed = {
            color: 0x00ff00,
            title: '🏓 Pong!',
            fields: [
                {
                    name: '📨 Message Latency',
                    value: `${timeDiff}ms`,
                    inline: true
                },
                {
                    name: '💓 WebSocket Latency',
                    value: `${wsLatency}ms`,
                    inline: true
                },
                {
                    name: '⏱️ Response Quality',
                    value: this.getLatencyQuality(Math.max(timeDiff, wsLatency)),
                    inline: true
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'Mirai Bot • Ping Command'
            }
        };

        await sent.edit({ content: '', embeds: [embed] });
    },



    getLatencyQuality(latency) {
        if (latency < 100) return '🟢 Excellent';
        if (latency < 200) return '🟡 Good';
        if (latency < 500) return '🟠 Fair';
        return '🔴 Poor';
    }
};
