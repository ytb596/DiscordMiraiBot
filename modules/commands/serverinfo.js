
module.exports = {
    name: 'serverinfo',
    description: 'Hiển thị thông tin chi tiết về máy chủ Discord hiện tại',
    aliases: ['server', 'guild', 'si'],
    cooldown: 5,
    category: 'Tiện ích',
    version: '1.3.0',
    cre: 'MiraiDev',

    async execute(client, message, args) {
        try {
            if (!message.guild) {
                return message.reply('❌ Lệnh này chỉ có thể sử dụng trong máy chủ Discord!');
            }

            const guild = message.guild;
            const owner = await guild.fetchOwner();

            // Đếm các loại kênh
            const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
            const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
            const categories = guild.channels.cache.filter(c => c.type === 4).size;

            // Đếm các loại thành viên
            await guild.members.fetch();
            const members = guild.members.cache;
            const humans = members.filter(m => !m.user.bot).size;
            const bots = members.filter(m => m.user.bot).size;

            const embed = {
                color: 0x2ecc71,
                title: `🏰 Thông tin máy chủ: ${guild.name}`,
                thumbnail: {
                    url: guild.iconURL({ dynamic: true, size: 256 }) || ''
                },
                fields: [
                    {
                        name: '👑 Chủ sở hữu',
                        value: `${owner.user.tag}`,
                        inline: true
                    },
                    {
                        name: '📊 ID máy chủ',
                        value: guild.id,
                        inline: true
                    },
                    {
                        name: '📅 Ngày tạo',
                        value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
                        inline: true
                    },
                    {
                        name: '👥 Thành viên',
                        value: `**Tổng:** ${guild.memberCount}\n**Người:** ${humans}\n**Bot:** ${bots}`,
                        inline: true
                    },
                    {
                        name: '📺 Kênh',
                        value: `**Text:** ${textChannels}\n**Voice:** ${voiceChannels}\n**Danh mục:** ${categories}`,
                        inline: true
                    },
                    {
                        name: '🎭 Vai trò',
                        value: guild.roles.cache.size.toString(),
                        inline: true
                    },
                    {
                        name: '😀 Emoji',
                        value: guild.emojis.cache.size.toString(),
                        inline: true
                    },
                    {
                        name: '📈 Cấp độ tăng cường',
                        value: `Cấp ${guild.premiumTier} (${guild.premiumSubscriptionCount} boosts)`,
                        inline: true
                    },
                    {
                        name: '🔒 Mức xác minh',
                        value: this.getVerificationLevel(guild.verificationLevel),
                        inline: true
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: 'MIRAI Bot • Server Info'
                }
            };

            if (guild.bannerURL()) {
                embed.image = { url: guild.bannerURL({ dynamic: true, size: 512 }) };
            }

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error executing ${this.name}:`, error);
            return message.reply('❌ Đã xảy ra lỗi khi lấy thông tin máy chủ!');
        }
    },

    getVerificationLevel(level) {
        const levels = {
            0: '🔓 Không có',
            1: '🔒 Thấp',
            2: '🔒 Trung bình',
            3: '🔒 Cao',
            4: '🔒 Rất cao'
        };
        return levels[level] || 'Không xác định';
    }
};
