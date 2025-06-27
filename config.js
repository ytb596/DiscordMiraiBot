// Load configuration from environment variables or config.json
const fs = require('fs');
const path = require('path');

let config;

// Try loading from environment variables first
if (process.env.DISCORD_TOKEN) {
    config = {
        token: process.env.DISCORD_TOKEN,
        prefix: process.env.PREFIX || '!',
        owners: process.env.OWNERS ? process.env.OWNERS.split(',') : [],
        mainAdmins: process.env.MAIN_ADMINS ? process.env.MAIN_ADMINS.split(',') : [],
        subAdmins: process.env.SUB_ADMINS ? process.env.SUB_ADMINS.split(',') : [],
        approvedGuilds: process.env.APPROVED_GUILDS ? process.env.APPROVED_GUILDS.split(',') : [],
        pendingGuilds: process.env.PENDING_GUILDS ? process.env.PENDING_GUILDS.split(',') : [],
        blacklistedGuilds: process.env.BLACKLISTED_GUILDS ? process.env.BLACKLISTED_GUILDS.split(',') : [],
        presence: {
            status: process.env.BOT_STATUS || 'online',
            activity: {
                name: process.env.BOT_ACTIVITY || `${process.env.PREFIX || '!'}menu | MIRAI Bot`,
                type: process.env.BOT_ACTIVITY_TYPE || 'PLAYING'
            }
        }
    };
    console.log('✅ Đã tải cấu hình từ environment variables');
} else {
    // Fallback to config.json
    try {
        const configPath = path.join(__dirname, 'config.json');
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('✅ Đã tải cấu hình từ config.json');
    } catch (error) {
        console.error('❌ Không thể tải config.json:', error.message);
        console.log('💡 Vui lòng cung cấp DISCORD_TOKEN qua environment variable hoặc tạo file config.json');
        process.exit(1);
    }
}

module.exports = config;
