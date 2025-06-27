
module.exports = {
    name: 'userinfo',
    description: 'Hiển thị thông tin chi tiết về người dùng',
    aliases: ['user', 'ui', 'whois'],
    usage: '[@user]',
    cooldown: 3,
    category: 'Tiện ích',
    version: '1.2.0',
    cre: 'MiraiDev',

    async execute(client, message, args) {
        try {
            let user = message.author;
            let member = message.member;

            // Nếu có mention hoặc user ID
            if (args.length > 0) {
                const mention = message.mentions.users.first();
                if (mention) {
                    user = mention;
                    if (message.guild) {
                        member = await message.guild.members.fetch(user.id).catch(() => null);
                    }
                } else {
                    try {
                        user = await client.users.fetch(args[0]);
                        if (message.guild) {
                            member = await message.guild.members.fetch(user.id).catch(() => null);
                        }
                    } catch (error) {
                        return message.reply('❌ Không tìm thấy người dùng! Vui lòng mention hoặc cung cấp ID hợp lệ.');
                    }
                }
            }

            const embed = {
                color: member?.displayHexColor || 0x3498db,
                title: `👤 Thông tin người dùng: ${user.username}`,
                thumbnail: {
                    url: user.displayAvatarURL({ dynamic: true, size: 256 })
                },
                fields: [
                    {
                        name: '🏷️ Tag',
                        value: user.tag,
                        inline: true
                    },
                    {
                        name: '🆔 ID',
                        value: user.id,
                        inline: true
                    },
                    {
                        name: '🤖 Bot',
                        value: user.bot ? 'Có' : 'Không',
                        inline: true
                    },
                    {
                        name: '📅 Tạo tài khoản',
                        value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
                        inline: false
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: 'MIRAI Bot • User Info'
                }
            };

            // Thông tin member nếu trong guild
            if (member) {
                embed.fields.push(
                    {
                        name: '📅 Tham gia máy chủ',
                        value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
                        inline: false
                    },
                    {
                        name: '🎭 Vai trò cao nhất',
                        value: member.roles.highest.name,
                        inline: true
                    },
                    {
                        name: '🎨 Màu vai trò',
                        value: member.displayHexColor || '#000000',
                        inline: true
                    }
                );

                if (member.nickname) {
                    embed.fields.push({
                        name: '📝 Biệt danh',
                        value: member.nickname,
                        inline: true
                    });
                }

                // Vai trò
                const roles = member.roles.cache
                    .filter(role => role.id !== message.guild.id)
                    .sort((a, b) => b.position - a.position)
                    .map(role => role.toString())
                    .slice(0, 10);

                if (roles.length > 0) {
                    embed.fields.push({
                        name: `🎭 Vai trò (${member.roles.cache.size - 1})`,
                        value: roles.join(' ') + (member.roles.cache.size > 11 ? '...' : ''),
                        inline: false
                    });
                }
            }

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error executing ${this.name}:`, error);
            return message.reply('❌ Đã xảy ra lỗi khi lấy thông tin người dùng!');
        }
    }
};
