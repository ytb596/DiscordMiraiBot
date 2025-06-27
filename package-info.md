# MIRAI Discord Bot - Package Information

## Project Details
- **Name**: mirai-discord-bot
- **Version**: 2.0.0
- **Description**: Bot Discord hiện đại với tính năng hot-reload và hệ thống quản lý admin phân cấp được việt hóa hoàn toàn
- **Author**: MIRAI Development Team
- **License**: MIT
- **Node.js Version**: >=18.0.0

## Scripts Available
```bash
npm start       # Khởi động bot
npm run dev     # Chế độ development
node index.js   # Chạy trực tiếp
```

## Dependencies
- **discord.js**: ^14.21.0 - Main Discord API wrapper
- **@discordjs/rest**: ^2.5.1 - REST API client for Discord
- **discord-api-types**: ^0.38.13 - TypeScript definitions for Discord API

## Keywords
- discord
- bot
- discord-bot
- hot-reload
- vietnamese
- admin-system
- nodejs
- mirai

## Environment Variables Required
- `DISCORD_TOKEN` - Bot authentication token
- `PREFIX` - Command prefix (default: !)
- `OWNERS` - Comma-separated owner user IDs
- `MAIN_ADMINS` - Comma-separated main admin user IDs
- `SUB_ADMINS` - Comma-separated sub admin user IDs
- `APPROVED_GUILDS` - Comma-separated approved guild IDs
- `BOT_STATUS` - Bot status (online/idle/dnd)
- `BOT_ACTIVITY` - Bot activity text

## Alternative Configuration
Thay vì environment variables, có thể sử dụng file `config.json` với cấu trúc tương tự như trong `config.example.json`.

## Repository Structure
```
├── index.js              # Main entry point
├── mirai.js              # Hot reload system
├── config.js             # Configuration loader
├── modules/
│   ├── commands/         # Bot commands
│   └── cache/           # Cache system
├── utility/
│   ├── logger.js         # Logging system
│   ├── permissions.js    # Permission manager
│   └── Handle_Command/   # Command handler
├── config.example.json   # Example configuration
├── README.md             # Documentation
└── package-info.md       # This file
```