module.exports = {
    name: 'help',
    description: 'Display all available commands or get info about a specific command',
    aliases: ['h', 'commands'],
    usage: '[command name]',
    cooldown: 5,

    async execute(client, message, args) {
        const { commands } = client;

        if (!args.length) {
            return this.sendAllCommands(message, commands);
        }

        const commandName = args[0].toLowerCase();
        const command = commands.get(commandName) || commands.find(c => c.aliases && c.aliases.includes(commandName));

        if (!command) {
            return message.reply(`❌ Command \`${commandName}\` not found!`);
        }

        return this.sendCommandInfo(message, command);
    },

    sendAllCommands(message, commands) {
        const config = require('../../config');
        const categories = {};

        commands.forEach(command => {
            const category = command.category || 'General';
            if (!categories[category]) categories[category] = [];
            categories[category].push(command);
        });

        const embed = {
            color: 0x3498db,
            title: '📚 Available Commands',
            description: `Use \`${config.prefix}help <command>\` for detailed information about a command.`,
            fields: [],
            timestamp: new Date(),
            footer: {
                text: `Total Commands: ${commands.size} • Prefix: ${config.prefix}`
            }
        };

        for (const [category, categoryCommands] of Object.entries(categories)) {
            const commandList = categoryCommands.map(cmd => `\`${cmd.name}\``).join(', ');
            embed.fields.push({
                name: `📁 ${category}`,
                value: commandList,
                inline: false
            });
        }

        return message.reply({ embeds: [embed] });
    },



    sendCommandInfo(message, command) {
        const config = require('../../config');
        const embed = {
            color: 0x2ecc71,
            title: `📝 Command: ${command.name}`,
            fields: [
                {
                    name: '📄 Description',
                    value: command.description || 'No description provided',
                    inline: false
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'Mirai Bot • Command Help'
            }
        };

        if (command.aliases && command.aliases.length) {
            embed.fields.push({
                name: '🔗 Aliases',
                value: command.aliases.map(alias => `\`${alias}\``).join(', '),
                inline: true
            });
        }

        if (command.usage) {
            embed.fields.push({
                name: '💡 Usage',
                value: `\`${config.prefix}${command.name} ${command.usage}\``,
                inline: true
            });
        }

        if (command.cooldown) {
            embed.fields.push({
                name: '⏰ Cooldown',
                value: `${command.cooldown} seconds`,
                inline: true
            });
        }

        return message.reply({ embeds: [embed] });
    }
};
