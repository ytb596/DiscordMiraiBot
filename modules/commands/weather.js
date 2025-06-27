
module.exports = {
    name: 'weather',
    description: 'Xem thông tin thời tiết của một thành phố (dữ liệu giả lập)',
    aliases: ['w', 'thoitiet', 'thoi'],
    usage: '<tên_thành_phố>',
    cooldown: 5,
    category: 'Tiện ích',
    version: '1.1.0',
    cre: 'MiraiDev',

    async execute(client, message, args) {
        try {
            if (!args.length) {
                return message.reply('❌ Vui lòng cung cấp tên thành phố!\n**Ví dụ:** `!weather Hà Nội`');
            }

            const city = args.join(' ');
            
            // Dữ liệu thời tiết giả lập
            const weatherConditions = [
                { name: 'Nắng', emoji: '☀️', temp: [25, 35] },
                { name: 'Mây', emoji: '☁️', temp: [20, 28] },
                { name: 'Mưa', emoji: '🌧️', temp: [18, 25] },
                { name: 'Giông', emoji: '⛈️', temp: [22, 27] },
                { name: 'Sương mù', emoji: '🌫️', temp: [15, 22] },
                { name: 'Tuyết', emoji: '❄️', temp: [-5, 5] }
            ];

            const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
            const temperature = Math.floor(Math.random() * (randomCondition.temp[1] - randomCondition.temp[0] + 1)) + randomCondition.temp[0];
            const humidity = Math.floor(Math.random() * 41) + 40; // 40-80%
            const windSpeed = Math.floor(Math.random() * 21) + 5; // 5-25 km/h
            const pressure = Math.floor(Math.random() * 51) + 1000; // 1000-1050 hPa

            const embed = {
                color: this.getWeatherColor(randomCondition.name),
                title: `🌤️ Thời tiết tại ${city}`,
                thumbnail: {
                    url: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=300&h=300&fit=crop'
                },
                fields: [
                    {
                        name: '🌡️ Nhiệt độ',
                        value: `${temperature}°C`,
                        inline: true
                    },
                    {
                        name: '🌤️ Tình trạng',
                        value: `${randomCondition.emoji} ${randomCondition.name}`,
                        inline: true
                    },
                    {
                        name: '💧 Độ ẩm',
                        value: `${humidity}%`,
                        inline: true
                    },
                    {
                        name: '💨 Tốc độ gió',
                        value: `${windSpeed} km/h`,
                        inline: true
                    },
                    {
                        name: '🌊 Áp suất',
                        value: `${pressure} hPa`,
                        inline: true
                    },
                    {
                        name: '👕 Gợi ý trang phục',
                        value: this.getClothingSuggestion(temperature, randomCondition.name),
                        inline: true
                    }
                ],
                footer: {
                    text: 'MIRAI Bot • Dữ liệu thời tiết giả lập • Cập nhật lúc'
                },
                timestamp: new Date()
            };

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error executing ${this.name}:`, error);
            return message.reply('❌ Đã xảy ra lỗi khi lấy thông tin thời tiết!');
        }
    },

    getWeatherColor(condition) {
        const colors = {
            'Nắng': 0xffd700,
            'Mây': 0x87ceeb,
            'Mưa': 0x4682b4,
            'Giông': 0x483d8b,
            'Sương mù': 0xd3d3d3,
            'Tuyết': 0xf0f8ff
        };
        return colors[condition] || 0x3498db;
    },

    getClothingSuggestion(temp, condition) {
        if (temp < 10) return '🧥 Áo khoác dày, khăn quàng';
        if (temp < 20) return '🧥 Áo khoác nhẹ, áo len';
        if (temp < 25) return '👕 Áo dài tay, quần jeans';
        if (temp < 30) return '👕 Áo thun, quần short';
        return '🩳 Quần áo mỏng, kem chống nắng';
    }
};
