const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
    name: 'check',
    description: 'Tạo biểu đồ số lượng thành viên trong máy chủ',
    aliases: ['server', 'stats', 'members',],
    usage: '',
    cooldown: 5,
    category: 'Tiện ích',
    version: '1.0.0',
    cre: 'vlan-dev',

    async execute(client, message, args) {
        try {
            const guild = message.guild;
            const members = await guild.members.fetch();

            const total = members.size;
            const humans = members.filter(m => !m.user.bot).size;
            const bots = members.filter(m => m.user.bot).size;

            // Tạo canvas
            const width = 600;
            const height = 400;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // Nền
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);

            // Tiêu đề
            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 26px sans-serif';
            ctx.fillText(`📊 Thống kê thành viên - ${guild.name}`, 30, 40);

            // Vẽ biểu đồ cột
            const barWidth = 100;
            const spacing = 50;
            const xStart = 100;
            const yBase = 350;
            const scale = 200 / total;

            const data = [
                { label: 'Người', value: humans, color: '#3498db' },
                { label: 'Bot', value: bots, color: '#e67e22' },
                { label: 'Tổng', value: total, color: '#2ecc71' }
            ];

            data.forEach((item, i) => {
                const x = xStart + i * (barWidth + spacing);
                const barHeight = item.value * scale;

                // Cột
                ctx.fillStyle = item.color;
                ctx.fillRect(x, yBase - barHeight, barWidth, barHeight);

                // Nhãn dưới
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 18px sans-serif';
                ctx.fillText(item.label, x + 10, yBase + 25);

                // Số lượng
                ctx.fillText(item.value, x + 20, yBase - barHeight - 10);
            });

            // Xuất ảnh
            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'server-stats.png' });

            const embed = {
                color: 0x3498db,
                title: '📈 Biểu đồ thành viên máy chủ',
                description: `Máy chủ hiện có **${total} thành viên**, trong đó:\n- 👤 Người: \`${humans}\`\n- 🤖 Bot: \`${bots}\``,
                image: { url: 'attachment://server-stats.png' },
                footer: { text: `MIRAI Bot • Thống kê theo thời gian thực` },
                timestamp: new Date()
            };

            return message.reply({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error(`Lỗi ở lệnh ${this.name}:`, error);
            return message.reply('❌ Đã xảy ra lỗi khi tạo biểu đồ thống kê!');
        }
    }
};