
module.exports = {
    name: 'qr',
    description: 'Tạo mã QR từ văn bản hoặc URL được cung cấp',
    aliases: ['qrcode', 'qr-code'],
    usage: '<văn_bản_hoặc_url>',
    cooldown: 3,
    category: 'Tiện ích',
    version: '1.0.0',
    cre: 'MiraiDev',

    async execute(client, message, args) {
        try {
            if (!args.length) {
                return message.reply('❌ Vui lòng cung cấp văn bản hoặc URL để tạo mã QR!\n**Ví dụ:** `!qr https://discord.com` hoặc `!qr Hello World`');
            }

            const text = args.join(' ');
            
            // Kiểm tra độ dài văn bản
            if (text.length > 500) {
                return message.reply('❌ Văn bản quá dài! Vui lòng giới hạn trong 500 ký tự.');
            }

            // Mã hóa văn bản để sử dụng trong URL
            const encodedText = encodeURIComponent(text);
            
            // Sử dụng API miễn phí để tạo QR code
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedText}`;

            const embed = {
                color: 0x2ecc71,
                title: '📱 Mã QR',
                description: 'Mã QR đã được tạo thành công!',
                fields: [
                    {
                        name: '📝 Nội dung',
                        value: `\`\`\`${text.length > 100 ? text.substring(0, 97) + '...' : text}\`\`\``,
                        inline: false
                    },
                    {
                        name: '📊 Thông tin',
                        value: `**Kích thước:** 300x300px\n**Độ dài:** ${text.length} ký tự\n**Loại:** ${this.detectContentType(text)}`,
                        inline: false
                    }
                ],
                image: {
                    url: qrUrl
                },
                footer: {
                    text: `MIRAI Bot • Tạo bởi ${message.author.username}`
                },
                timestamp: new Date()
            };

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error executing ${this.name}:`, error);
            return message.reply('❌ Đã xảy ra lỗi khi tạo mã QR!');
        }
    },

    detectContentType(text) {
        // Kiểm tra xem có phải URL không
        if (text.startsWith('http://') || text.startsWith('https://')) {
            return '🌐 URL/Website';
        }
        
        // Kiểm tra email
        if (text.includes('@') && text.includes('.')) {
            return '📧 Email';
        }
        
        // Kiểm tra số điện thoại
        if (/^\+?[\d\s\-\(\)]+$/.test(text) && text.replace(/\D/g, '').length >= 10) {
            return '📞 Số điện thoại';
        }
        
        // Kiểm tra có phải WiFi không
        if (text.startsWith('WIFI:')) {
            return '📶 Thông tin WiFi';
        }
        
        return '📝 Văn bản';
    }
};
