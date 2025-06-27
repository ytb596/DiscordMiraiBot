
module.exports = {
    name: 'avatar',
    description: 'Hiển thị avatar của bạn hoặc người dùng được chỉ định',
    aliases: ['av', 'pfp', 'anh'],
    usage: '[@user]',
    cooldown: 3,
    category: 'Tiện ích',
    version: '1.1.0',
    cre: 'MiraiDev',

    async execute(client, message, args) {
        try {
            let user = message.author;

            // Nếu có mention hoặc user ID
            if (args.length > 0) {
                const mention = message.mentions.users.first();
                if (mention) {
                    user = mention;
                } else {
                    // Thử fetch user bằng ID
                    try {
                        user = await client.users.fetch(args[0]);
                    } catch (error) {
                        return message.reply('❌ Không tìm thấy người dùng! Vui lòng mention hoặc cung cấp ID hợp lệ.');
                    }
                }
            }

            const embed = {
                color: 0x3498db,
                title: `🖼️ Avatar của ${user.username}`,
                description: `Avatar của ${user.tag}`,
                image: {
                    url: user.displayAvatarURL({ dynamic: true, size: 512 })
                },
                fields: [
                    {
                        name: '🔗 Liên kết',
                        value: `[PNG](${user.displayAvatarURL({ format: 'png', size: 512 })}) | [JPG](${user.displayAvatarURL({ format: 'jpg', size: 512 })}) | [WEBP](${user.displayAvatarURL({ format: 'webp', size: 512 })})`,
                        inline: false
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: 'MIRAI Bot • Avatar Command'
                }
            };

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error executing ${this.name}:`, error);
            return message.reply('❌ Đã xảy ra lỗi khi lấy avatar!');
        }
    }
};
