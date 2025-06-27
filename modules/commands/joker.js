const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'joker.json');

module.exports = {
    name: 'joker',
    description: 'Hiển thị một câu Joker ngẫu nhiên hoặc thêm câu mới',
    aliases: [],
    usage: '[add <câu> | list [trang]]',
    cooldown: 3,
    category: 'Giải trí',
    version: '1.1',
    cre: 'MiraiDev',

    execute(message, args) {
        // Tạo file nếu chưa có
        try {
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, JSON.stringify([]));
            }
        } catch (err) {
            console.error('Lỗi khi tạo file:', err);
            return message.reply('❌ Không thể tạo file dữ liệu!');
        }

        let jokes;
        try {
            jokes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (err) {
            console.error('Lỗi khi đọc file:', err);
            return message.reply('❌ Không thể đọc dữ liệu câu nói!');
        }

        const subCommand = args[0];

        // Thêm câu mới
        if (subCommand === 'add') {
            const newQuote = args.slice(1).join(' ').trim();
            if (!newQuote) return message.reply('⚠️ Vui lòng nhập nội dung câu cần thêm!');

            if (jokes.includes(newQuote)) {
                return message.reply('⚠️ Câu này đã tồn tại trong danh sách!');
            }

            jokes.push(newQuote);
            try {
                fs.writeFileSync(filePath, JSON.stringify(jokes, null, 2));
            } catch (err) {
                console.error('Lỗi khi ghi file:', err);
                return message.reply('❌ Không thể lưu câu mới!');
            }

            return message.reply('✅ Đã thêm câu Joker mới!');
        }

        // Hiển thị danh sách với phân trang
        if (subCommand === 'list') {
            if (jokes.length === 0) return message.reply('⚠️ Danh sách Joker đang trống!');

            const perPage = 10;
            const totalPages = Math.ceil(jokes.length / perPage);
            const page = parseInt(args[1]) || 1;

            if (page < 1 || page > totalPages) {
                return message.reply(`⚠️ Trang không hợp lệ! Vui lòng chọn từ 1 đến ${totalPages}.`);
            }

            const list = jokes
                .slice((page - 1) * perPage, page * perPage)
                .map((quote, i) => `**${(page - 1) * perPage + i + 1}.** ${quote}`)
                .join('\n');

            return message.reply({
                content: `📜 **Danh sách câu Joker (Trang ${page}/${totalPages}):**\n${list}`
            });
        }

        // Trả về ngẫu nhiên
        if (jokes.length === 0) return message.reply('⚠️ Chưa có câu Joker nào!');
        const random = jokes[Math.floor(Math.random() * jokes.length)];
        return message.reply(`🃏 **Joker nói:**\n> ${random}`);
    }
};