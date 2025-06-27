# MIRAI Discord Bot

## Overview

MIRAI is a modern Discord bot built with Node.js and discord.js v14, featuring a sophisticated hot-reload command system and comprehensive utility framework. The bot is designed for scalability and ease of development with automatic command discovery, file watching, and beautiful terminal logging.

## System Architecture

### Core Framework
- **Runtime**: Node.js 20
- **Discord Library**: discord.js v14 with REST API support
- **Module System**: CommonJS with dynamic imports for hot-reload functionality
- **Configuration**: Environment-based with fallback defaults

### Bot Architecture
- **Client Setup**: Configured with essential gateway intents (Guilds, Messages, Content, Members)
- **Command System**: Dual support for prefix commands and slash commands
- **Hot Reload**: Real-time command reloading without bot restart via file watching
- **Caching**: In-memory cache with optional persistence and TTL management

## Key Components

### 1. Mirai Core System (`mirai.js`)
- **Purpose**: Central command management and hot-reload orchestration
- **Features**: 
  - Automatic command discovery from `modules/commands/`
  - File watching for real-time updates
  - Command registration and deployment
  - Beautiful terminal banner display

### 2. Command Handler (`utility/Handle_Command/`)
- **Purpose**: Command execution pipeline with security and performance features
- **Features**:
  - Cooldown management
  - Permission checking
  - Usage statistics tracking
  - Error handling and user feedback

### 3. Cache System (`modules/cache/`)
- **Purpose**: High-performance caching with persistence options
- **Features**:
  - In-memory storage with configurable TTL
  - LRU eviction strategy
  - Persistent cache to disk
  - Automatic cleanup intervals

### 4. Logger Utility (`utility/logger.js`)
- **Purpose**: Colorized, structured logging system
- **Features**:
  - Multiple log levels (error, warn, info, success, debug, command)
  - Timestamp formatting
  - Color-coded output with emojis
  - Structured data support

### 5. Configuration System (`config.js`)
- **Purpose**: Flexible configuration management with dual support
- **Features**:
  - Priority-based loading: Environment variables first, then config.json fallback
  - Complete configuration via environment variables or JSON file
  - Guild-specific settings support
  - Bot presence configuration
  - Owner and admin permissions management

## Data Flow

### Command Processing Flow
1. Message received → Prefix validation → Command lookup
2. Permission check → Cooldown validation → Cache statistics
3. Command execution → Response handling → Error management
4. Logging and analytics → Cooldown application

### Hot Reload Flow
1. File change detected → Command invalidation → Module re-import
2. Command re-registration → Client update → Success notification
3. Error handling and rollback if reload fails

### Slash Command Flow
1. Interaction received → Command lookup → Permission validation
2. Deferred reply (if needed) → Command execution → Response
3. Error handling with user-friendly messages

## External Dependencies

### Core Dependencies
- **discord.js**: ^14.21.0 - Main Discord API wrapper
- **@discordjs/rest**: ^2.5.1 - REST API client for Discord
- **discord-api-types**: ^0.38.13 - TypeScript definitions for Discord API

### Runtime Dependencies
- **Node.js**: 20.x - JavaScript runtime
- **File System**: Native fs module for file operations
- **Path**: Native path module for cross-platform path handling

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 module
- **Auto-install**: Dependencies installed via workflow on startup
- **Environment Variables**: 
  - `DISCORD_TOKEN`: Bot authentication token
  - `CLIENT_ID`: Discord application ID
  - `PREFIX`: Command prefix (default: `!`)
  - `OWNERS`: Comma-separated list of owner user IDs

### Production Considerations
- Bot token security through environment variables
- Graceful error handling and recovery
- Logging for debugging and monitoring
- Cache persistence for data continuity

### File Structure
```
├── index.js              # Main entry point
├── mirai.js              # Core hot-reload system
├── config.js             # Configuration management
├── package.json          # Dependencies and scripts
├── utility/
│   ├── logger.js         # Logging system
│   └── Handle_Command/   # Command processing
├── modules/
│   ├── commands/         # Bot commands
│   └── cache/           # Cache system
└── .replit              # Replit configuration
```

## Changelog

```
Changelog:
- June 27, 2025. Initial setup with hot reload system
- June 27, 2025. Removed slash commands, using prefix commands only
- June 27, 2025. Changed from environment variables to config.json
- June 27, 2025. Added comprehensive menu command with pagination
- June 27, 2025. Implemented advanced admin system with main/sub admin levels
- June 27, 2025. Added guild protection system with approve/blacklist/pending
- June 27, 2025. Created permission manager with multi-level access control
- June 27, 2025. Enhanced terminal display with large MIRAI logo
- June 27, 2025. Added comprehensive status command with performance metrics
- June 27, 2025. Updated configuration system to support both environment variables and config.json
- June 27, 2025. Added flexible configuration with priority: env vars first, then config.json fallback
- June 27, 2025. Added version and creator (cre) attributes to all commands
- June 27, 2025. Updated menu and help commands to display version and creator information
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```