import createLogger from './classes/logger/logger.js';
import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

const logger = createLogger('DeployCommands');
const clientId = process.env.clientId;
const guildId = process.env.guildId;
const TOKEN = process.env.TOKEN;

logger.addSeparator();
logger.info('Starting command deployment...');

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(path.dirname(new URL(import.meta.url).pathname), 'commands');
const commandFolders = fs.readdirSync(foldersPath);
logger.debug(`Found ${commandFolders.length} command folders.`);

for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    logger.debug(`Found ${commandFiles.length} command files in folder ${folder}.`);
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            logger.info(`Loaded command ${command.data.name} from file ${file}.`);
        } else {
            logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Construct and prepare an instance of the REST module
logger.debug(`Preparing REST instance with token ${TOKEN}.`);
const rest = new REST().setToken(TOKEN);

// and deploy your commands!
(async () => {
    try {
        logger.debug(`Started refreshing ${commands.length} application (/) commands.`);
        logger.debug(`Commands: ${JSON.stringify(commands, null, 2)}`);
        // The put method is used to fully refresh all commands in the guild with the current set
        logger.debug(`Deploying commands to guild ${guildId}.`);
        logger.debug(`Client ID: ${clientId}.`);
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        logger.error(error);
    }
})();