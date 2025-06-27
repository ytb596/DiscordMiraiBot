# MIRAI Discord Bot

Bot Discord hiện đại với tính năng hot-reload và hệ thống quản lý admin phân cấp được việt hóa hoàn toàn.

## 🚀 Tính năng

- ✅ Hệ thống Hot Reload - tự động tải lại lệnh khi có thay đổi
- ✅ Phân quyền admin 3 cấp độ (Owner > Main Admin > Sub Admin)
- ✅ Bảo vệ máy chủ với hệ thống approve/pending/blacklist
- ✅ Giao diện terminal đẹp với màu sắc và logo MIRAI
- ✅ Cache system với TTL và persistence
- ✅ Logging chi tiết với nhiều level
- ✅ Toàn bộ giao diện tiếng Việt

## 📋 Cài đặt

1. Clone repository này
2. Chạy `npm install` để cài đặt dependencies
3. Cấu hình bot (xem phần dưới)
4. Chạy `node index.js`

## ⚙️ Cấu hình Bot

Bot hỗ trợ **2 cách cấu hình**:

### Phương pháp 1: Environment Variables (Khuyến nghị)

Đặt các biến môi trường sau:

```bash
DISCORD_TOKEN=your_discord_token_here
PREFIX=!
OWNERS=your_user_id_here
MAIN_ADMINS=user_id_1,user_id_2
SUB_ADMINS=user_id_3,user_id_4
APPROVED_GUILDS=guild_id_1,guild_id_2
BOT_STATUS=online
BOT_ACTIVITY=!menu | MIRAI Bot
BOT_ACTIVITY_TYPE=PLAYING
```

### Phương pháp 2: config.json

Tạo file `config.json` từ `config.example.json`:

```bash
cp config.example.json config.json
```

Sau đó chỉnh sửa `config.json`:

```json
{
    "token": "your_discord_token_here",
    "prefix": "!",
    "owners": ["your_user_id_here"],
    "mainAdmins": [],
    "subAdmins": [],
    "approvedGuilds": [],
    "pendingGuilds": [],
    "blacklistedGuilds": [],
    "presence": {
        "status": "online",
        "activity": {
            "name": "!menu | MIRAI Bot",
            "type": "PLAYING"
        }
    }
}
```

## 🔑 Lấy Discord Token

1. Truy cập [Discord Developer Portal](https://discord.com/developers/applications)
2. Tạo ứng dụng mới hoặc chọn ứng dụng hiện có
3. Vào phần "Bot"
4. Copy token từ phần "Token"

## 📝 Các lệnh có sẵn

- `!menu` - Hiển thị menu chính với tất cả lệnh
- `!ping` - Kiểm tra độ trễ bot
- `!status` - Thống kê và thông tin bot
- `!help` - Trợ giúp chi tiết
- `!admin` - Quản lý admin (chỉ owner)
- `!reload` - Tải lại lệnh (chỉ owner)

## 🛡️ Hệ thống phân quyền

### Owner
- Toàn quyền trên bot
- Quản lý main admin và sub admin
- Quản lý máy chủ (approve/blacklist)

### Main Admin
- Sử dụng bot trên mọi máy chủ
- Một số quyền quản lý

### Sub Admin
- Sử dụng bot trên mọi máy chủ
- Quyền hạn hạn chế

### User thường
- Chỉ sử dụng được trên máy chủ đã được approve
- Trên máy chủ chưa approve, chỉ admin mới dùng được

## 🔄 Hot Reload

Bot tự động theo dõi thay đổi trong thư mục `modules/commands/` và tự động tải lại lệnh khi có thay đổi.

## 🎨 Cấu trúc thư mục

```
├── index.js              # Entry point
├── mirai.js              # Hot reload system
├── config.js             # Configuration loader
├── modules/
│   ├── commands/         # Bot commands
│   └── cache/           # Cache system
├── utility/
│   ├── logger.js         # Logging system
│   ├── permissions.js    # Permission manager
│   └── Handle_Command/   # Command handler
└── config.example.json   # Example configuration
```

## 🐛 Troubleshooting

1. **Bot không khởi động**: Kiểm tra DISCORD_TOKEN
2. **Lệnh không hoạt động**: Kiểm tra quyền bot trong máy chủ
3. **Hot reload không hoạt động**: Kiểm tra quyền ghi file

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
- Token Discord có đúng không
- Bot có quyền cần thiết trong máy chủ
- File cấu hình có đúng format không