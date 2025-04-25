import { REST, Routes } from 'discord.js';

const clientId = process.env.clientId;
const guildId = process.env.guildId;
const TOKEN = process.env.TOKEN;
const rest = new REST().setToken(TOKEN);

(async () => {
    try {
        console.log('Started deleting application (/) commands.');

        // Fetch and log all guild commands
        const guildCommands = await rest.get(
            Routes.applicationGuildCommands(clientId, guildId)
        );
        console.log(`Found ${guildCommands.length} guild commands:`);
        guildCommands.forEach(command => console.log(` - ${command.name}`));

        // Delete all guild commands
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: [] },
        );
        console.log('Successfully deleted all guild commands.');

        // Fetch and log all global commands
        const globalCommands = await rest.get(
            Routes.applicationCommands(clientId)
        );
        console.log(`Found ${globalCommands.length} global commands:`);
        globalCommands.forEach(command => console.log(` - ${command.name}`));

        // Delete all global commands
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: [] },
        );
        console.log('Successfully deleted all global commands.');
    } catch (error) {
        console.error('Error deleting commands:', error);
    }
})();