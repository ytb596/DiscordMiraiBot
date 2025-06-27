// Load configuration from config.json
const fs = require('fs');
const path = require('path');

let config;
try {
    const configPath = path.join(__dirname, 'config.json');
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
    console.error('❌ Failed to load config.json:', error.message);
    process.exit(1);
}

module.exports = config;
