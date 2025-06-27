const util = require('util');

class Logger {
    constructor() {
        this.colors = {
            reset: '\x1b[0m',
            bright: '\x1b[1m',
            dim: '\x1b[2m',
            
            // Foreground colors
            black: '\x1b[30m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            white: '\x1b[37m',
            
            // Background colors
            bgBlack: '\x1b[40m',
            bgRed: '\x1b[41m',
            bgGreen: '\x1b[42m',
            bgYellow: '\x1b[43m',
            bgBlue: '\x1b[44m',
            bgMagenta: '\x1b[45m',
            bgCyan: '\x1b[46m',
            bgWhite: '\x1b[47m'
        };

        this.levels = {
            error: { color: this.colors.red, icon: '❌', label: 'ERROR' },
            warn: { color: this.colors.yellow, icon: '⚠️ ', label: 'WARN ' },
            info: { color: this.colors.blue, icon: 'ℹ️ ', label: 'INFO ' },
            success: { color: this.colors.green, icon: '✅', label: 'DONE ' },
            debug: { color: this.colors.magenta, icon: '🔍', label: 'DEBUG' },
            command: { color: this.colors.cyan, icon: '⚡', label: 'CMD  ' }
        };
    }

    /**
     * Get formatted timestamp
     * @returns {string} Formatted timestamp
     */
    getTimestamp() {
        const now = new Date();
        return now.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    /**
     * Format log message
     * @param {string} level - Log level
     * @param {string} message - Main message
     * @param {any} data - Additional data
     * @returns {string} Formatted message
     */
    formatMessage(level, message, data = null) {
        const levelConfig = this.levels[level] || this.levels.info;
        const timestamp = this.getTimestamp();
        
        let formatted = `${this.colors.dim}[${timestamp}]${this.colors.reset} `;
        formatted += `${levelConfig.color}${levelConfig.icon} ${levelConfig.label}${this.colors.reset} `;
        formatted += `${this.colors.bright}${message}${this.colors.reset}`;

        if (data !== null) {
            if (typeof data === 'object') {
                formatted += `\n${this.colors.dim}${util.inspect(data, { 
                    colors: true, 
                    depth: 3,
                    compact: false 
                })}${this.colors.reset}`;
            } else {
                formatted += ` ${this.colors.dim}${data}${this.colors.reset}`;
            }
        }

        return formatted;
    }

    /**
     * Log error messages
     * @param {string} message - Error message
     * @param {any} data - Additional data or error object
     */
    error(message, data = null) {
        const formatted = this.formatMessage('error', message, data);
        console.error(formatted);
        
        // Also log stack trace if data is an Error object
        if (data instanceof Error && data.stack) {
            console.error(`${this.colors.red}${this.colors.dim}${data.stack}${this.colors.reset}`);
        }
    }

    /**
     * Log warning messages
     * @param {string} message - Warning message
     * @param {any} data - Additional data
     */
    warn(message, data = null) {
        const formatted = this.formatMessage('warn', message, data);
        console.warn(formatted);
    }

    /**
     * Log info messages
     * @param {string} message - Info message
     * @param {any} data - Additional data
     */
    info(message, data = null) {
        const formatted = this.formatMessage('info', message, data);
        console.log(formatted);
    }

    /**
     * Log success messages
     * @param {string} message - Success message
     * @param {any} data - Additional data
     */
    success(message, data = null) {
        const formatted = this.formatMessage('success', message, data);
        console.log(formatted);
    }

    /**
     * Log debug messages (only in development)
     * @param {string} message - Debug message
     * @param {any} data - Additional data
     */
    debug(message, data = null) {
        if (process.env.NODE_ENV !== 'production') {
            const formatted = this.formatMessage('debug', message, data);
            console.log(formatted);
        }
    }

    /**
     * Log command usage
     * @param {string} message - Command message
     * @param {any} data - Command data
     */
    command(message, data = null) {
        const formatted = this.formatMessage('command', message, data);
        console.log(formatted);
    }

    /**
     * Create a divider line
     * @param {string} title - Optional title for the divider
     * @param {string} color - Color for the divider
     */
    divider(title = null, color = this.colors.cyan) {
        const line = '─'.repeat(60);
        
        if (title) {
            const titlePadding = Math.max(0, (60 - title.length - 2) / 2);
            const paddedTitle = '─'.repeat(Math.floor(titlePadding)) + ` ${title} ` + '─'.repeat(Math.ceil(titlePadding));
            console.log(`${color}${paddedTitle}${this.colors.reset}`);
        } else {
            console.log(`${color}${line}${this.colors.reset}`);
        }
    }

    /**
     * Log a table of data
     * @param {Array} data - Array of objects to display as table
     * @param {string} title - Optional title for the table
     */
    table(data, title = null) {
        if (title) {
            this.divider(title);
        }
        console.table(data);
        if (title) {
            this.divider();
        }
    }

    /**
     * Clear the console
     */
    clear() {
        console.clear();
        this.info('Console cleared');
    }

    /**
     * Log with custom color
     * @param {string} message - Message to log
     * @param {string} color - Color code
     */
    custom(message, color = this.colors.white) {
        console.log(`${color}${message}${this.colors.reset}`);
    }

    /**
     * Create a progress bar in the console
     * @param {number} current - Current progress
     * @param {number} total - Total progress
     * @param {string} label - Label for the progress bar
     * @param {number} width - Width of the progress bar
     */
    progress(current, total, label = 'Progress', width = 30) {
        const percentage = Math.round((current / total) * 100);
        const completed = Math.round((current / total) * width);
        const remaining = width - completed;
        
        const progressBar = '█'.repeat(completed) + '░'.repeat(remaining);
        const progressText = `${this.colors.cyan}${label}: [${progressBar}] ${percentage}%${this.colors.reset}`;
        
        process.stdout.write(`\r${progressText}`);
        
        if (current === total) {
            process.stdout.write('\n');
        }
    }

    /**
     * Log with a box around the message
     * @param {string} message - Message to box
     * @param {string} color - Color for the box
     */
    box(message, color = this.colors.blue) {
        const lines = message.split('\n');
        const maxLength = Math.max(...lines.map(line => line.length));
        const width = maxLength + 4;
        
        const top = '╔' + '═'.repeat(width - 2) + '╗';
        const bottom = '╚' + '═'.repeat(width - 2) + '╝';
        
        console.log(`${color}${top}${this.colors.reset}`);
        
        lines.forEach(line => {
            const padding = ' '.repeat(maxLength - line.length);
            console.log(`${color}║ ${this.colors.reset}${line}${padding}${color} ║${this.colors.reset}`);
        });
        
        console.log(`${color}${bottom}${this.colors.reset}`);
    }

    /**
     * Log startup banner
     * @param {string} name - Application name
     * @param {string} version - Application version
     */
    banner(name, version = '1.0.0') {
        this.clear();
        
        const banner = `
  ███╗   ███╗██╗██████╗  █████╗ ██╗    ██████╗  ██████╗ ████████╗
  ████╗ ████║██║██╔══██╗██╔══██╗██║    ██╔══██╗██╔═══██╗╚══██╔══╝
  ██╔████╔██║██║██████╔╝███████║██║    ██████╔╝██║   ██║   ██║   
  ██║╚██╔╝██║██║██╔══██╗██╔══██║██║    ██╔══██╗██║   ██║   ██║   
  ██║ ╚═╝ ██║██║██║  ██║██║  ██║██║    ██████╔╝╚██████╔╝   ██║   
  ╚═╝     ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝    ╚═════╝  ╚═════╝    ╚═╝   
        `;
        
        console.log(`${this.colors.cyan}${banner}${this.colors.reset}`);
        console.log(`${this.colors.bright}${this.colors.cyan}                    ${name} v${version}${this.colors.reset}`);
        console.log(`${this.colors.dim}                 Discord Bot with Hot Reload${this.colors.reset}\n`);
    }
}

module.exports = new Logger();
