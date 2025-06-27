const mirai = require('../../mirai');

module.exports = {
    name: 'reload',
    description: 'Reload all commands or a specific command',
    aliases: ['r'],
    usage: '[command name]',
    cooldown: 5,
    category: 'System',
    ownerOnly: true,

    async execute(client, message, args) {
        // Check if user is bot owner
        const config = require('../../config');
        if (!config.owners.includes(message.author.id)) {
            return message.reply('❌ This command is restricted to bot owners only!');
        }

        const startTime = Date.now();

        if (!args.length) {
            // Reload all commands
            try {
                await mirai.reloadAllCommands();
                const endTime = Date.now();
                
                const embed = {
                    color: 0x2ecc71,
                    title: '🔄 Commands Reloaded',
                    description: `✅ Successfully reloaded all commands!`,
                    fields: [
                        {
                            name: '📊 Statistics',
                            value: `Commands: ${client.commands.size}\nReload Time: ${endTime - startTime}ms`,
                            inline: true
                        }
                    ],
                    timestamp: new Date(),
                    footer: {
                        text: 'Mirai Bot • Reload System'
                    }
                };

                return message.reply({ embeds: [embed] });
            } catch (error) {
                return message.reply(`❌ Failed to reload commands: ${error.message}`);
            }
        }

        // Reload specific command
        const commandName = args[0].toLowerCase();
        const command = client.commands.get(commandName);

        if (!command) {
            return message.reply(`❌ Command \`${commandName}\` not found!`);
        }

        try {
            await mirai.reloadCommand(`${commandName}.js`);
            const endTime = Date.now();

            const embed = {
                color: 0x2ecc71,
                title: '🔄 Command Reloaded',
                description: `✅ Successfully reloaded \`${commandName}\`!`,
                fields: [
                    {
                        name: '⏱️ Reload Time',
                        value: `${endTime - startTime}ms`,
                        inline: true
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: 'Mirai Bot • Reload System'
                }
            };

            return message.reply({ embeds: [embed] });
        } catch (error) {
            return message.reply(`❌ Failed to reload command \`${commandName}\`: ${error.message}`);
        }
    }
};
