// Template cho lệnh mới - sao chép file này để tạo lệnh mới
module.exports = {
    name: 'template',
    description: 'Mô tả lệnh của bạn ở đây',
    aliases: ['tmp', 'example'], // Tên gọi khác (tùy chọn)
    usage: '[tham_số]', // Cách sử dụng lệnh (tùy chọn)
    cooldown: 3, // Thời gian chờ giữa các lần sử dụng (giây)
    category: 'Chính', // Danh mục: Chính, Hệ thống, Giải trí, v.v.
    version: '1.0.0', // Phiên bản lệnh (BẮT BUỘC)
    cre: 'YourAlias', // Bí danh người tạo (BẮT BUỘC)
    ownerOnly: false, // true nếu chỉ owner mới dùng được (tùy chọn)
    permissions: [], // Quyền Discord cần thiết (tùy chọn)

    async execute(client, message, args) {
        // Lấy config và permissions nếu cần
        const config = require('../../config');
        const permissions = require('../../utility/permissions');
        
        // Kiểm tra quyền hạn (ví dụ)
        // if (!permissions.isAdmin(message.author.id)) {
        //     return message.reply('❌ Bạn không có quyền sử dụng lệnh này!');
        // }

        // Logic của lệnh ở đây
        try {
            // Ví dụ: gửi embed
            const embed = {
                color: 0x00ff00,
                title: '✅ Template Command',
                description: 'Đây là lệnh template mẫu',
                fields: [
                    {
                        name: '📝 Thông tin',
                        value: 'Thay thế nội dung này bằng logic lệnh của bạn',
                        inline: false
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: 'MIRAI Bot • Template Command'
                }
            };

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error executing ${this.name}:`, error);
            return message.reply('❌ Đã xảy ra lỗi khi thực hiện lệnh!');
        }
    }
};

/*
HƯỚNG DẪN SỬ DỤNG TEMPLATE:

1. Sao chép file này với tên mới (vd: mycommand.js)
2. Thay đổi các thuộc tính:
   - name: tên lệnh (phải duy nhất)
   - description: mô tả lệnh
   - version: phiên bản lệnh (BẮT BUỘC)
   - cre: bí danh của bạn (BẮT BUỘC)
   
3. Viết logic lệnh trong hàm execute()
4. Lưu file và bot sẽ tự động tải lại nhờ hot reload

THUỘC TÍNH BẮT BUỘC MỚI:
- version: Phiên bản lệnh (vd: '1.0.0', '2.1.5')
- cre: Bí danh người tạo (vd: 'MiraiDev', 'YourName')

Hai thuộc tính này sẽ hiển thị trong lệnh !menu và !help
*/