import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import startlog from './classes/logger/logger_file_management.js';
startlog(); // Initialize logging system for file management
import createLogger from './classes/logger/logger.js';
import check_message from './events/on_message.js';
import cron from 'node-cron';
import backup_server from './events/backup-event.js';
import editorArchiveEvent from './events/editor_channels_archive_event.js';

// Initialize logger
const logger = createLogger('BOT');

// Initialize Discord client with necessary intents
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

logger.addSeparator();
logger.info('Starting the bot...');

// Initialize Commands Collection
client.commands = new Collection();
const foldersPath = path.join(path.dirname(new URL(import.meta.url).pathname), 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Event triggered when the bot is ready
client.once(Events.ClientReady, readyClient => {
    client.isReady = true; // Mark the client as ready
    logger.debug(`Client is ready: ${client.isReady}`);
    logger.info(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Dynamically load commands from the commands folder
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath); // Import command file dynamically
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command); // Register command
            logger.debug(`Command ${command.data.name} loaded from ${filePath}`);
        } else {
            logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Schedule the backup_event to trigger on the first day of every month at 00:00
cron.schedule('0 0 1 * *', () => {
    backup_server(); // Trigger the backup event
    logger.info('Scheduled backup_event triggered');
});

// Schedule editor archive events on specific days of the month
cron.schedule('0 12 1 * *', () => {
    editorArchiveEvent.emit('editor_archive_event_D0');
    logger.info('Scheduled editor_archive_event_D0 triggered');
});
cron.schedule('0 12 6 * *', () => {
    editorArchiveEvent.emit('editor_archive_event_D6');
    logger.info('Scheduled editor_archive_event_D6 triggered');
});
cron.schedule('0 12 7 * *', () => {
    editorArchiveEvent.emit('editor_archive_event_D7');
    logger.info('Scheduled editor_archive_event_D7 triggered');
});


/*
// Testing
cron.schedule('* * * * *', () => {
    editorArchiveEvent.emit('editor_archive_event_D7');
    logger.info('Scheduled editor_archive_event_D7 triggered');
});
*/

// Handle incoming messages
client.on(Events.MessageCreate, async message => {
    check_message(message); // Process the message
});

// Handle interactions (e.g., slash commands)
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return; // Ignore non-chat commands
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        logger.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        logger.info(`Command ${interaction.commandName} executed by ${interaction.user.tag}`);
        await command.execute(interaction); // Execute the command
    } catch (error) {
        logger.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// Create an HTTP server that responds to the /status route
const server = http.createServer((req, res) => {
    if (req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Bot is running'); // Respond with bot status
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        logger.debug('not /status'); // Log invalid route access
        res.end('Not Found');
    }
});

server.listen(4444, () => {
    logger.info('HTTP server listening on port 4444'); // Log server start
});

// Log in to Discord with the bot token
client.login(process.env.TOKEN);

export default client; // Export the client instance