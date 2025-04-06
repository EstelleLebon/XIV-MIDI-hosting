import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import startlog from './classes/logger/logger_file_management.js';
startlog();
import createLogger from './classes/logger/logger.js';
import check_message from './events/on_message.js';
import cron from 'node-cron';
// import customEvent from './events/backup_event.js';
// import editorArchiveEvent from './events/editor_channels_archive_event.js';

const logger = createLogger('BOT');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

logger.addSeparator();
logger.info('Starting the bot...');

client.commands = new Collection();
const foldersPath = path.join(path.dirname(new URL(import.meta.url).pathname), 'commands');
const commandFolders = fs.readdirSync(foldersPath);

client.once(Events.ClientReady, readyClient => {
    client.isReady = true; // Ajoutez cette ligne pour définir la propriété isReady
    logger.debug(`Client is ready: ${client.isReady}`);
    logger.info(`Ready! Logged in as ${readyClient.user.tag}`);
});

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            logger.debug(`Command ${command.data.name} loaded from ${filePath}`);
        } else {
            logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Planifier l'événement backup_event pour qu'il se déclenche tous les premiers jours du mois à 00:00
cron.schedule('0 0 1 * *', () => {
    customEvent.emit('backup_event');
    logger.info('Scheduled backup_event triggered');
});


// Planifier l'événement editorArchiveEvent pour qu'il se déclenche toutes les minutes
cron.schedule('0 12 1 * *', () => {
    // editorArchiveEvent.emit('editor_archive_event_D0');
    logger.info('Scheduled editor_archive_event_D0 triggered');
});
cron.schedule('0 12 7 * *', () => {
    // editorArchiveEvent.emit('editor_archive_event_D6');
    logger.info('Scheduled editor_archive_event_D6 triggered');
});
cron.schedule('0 12 8 * *', () => {
    // editorArchiveEvent.emit('editor_archive_event_D7');
    logger.info('Scheduled editor_archive_event_D7 triggered');
});

client.on(Events.MessageCreate, async message => {
    check_message(message);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        logger.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        logger.info(`Command ${interaction.commandName} executed by ${interaction.user.tag}`);
        await command.execute(interaction);
    } catch (error) {
        logger.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// Créer un serveur HTTP qui répond à la route /status
const server = http.createServer((req, res) => {
    if (req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Bot is running');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        logger.debug('not /status');
        res.end('Not Found');
    }
});

server.listen(4444, () => {
    logger.info('HTTP server listening on port 4444');
});

client.login(process.env.TOKEN);

export default client; // Exporter le client