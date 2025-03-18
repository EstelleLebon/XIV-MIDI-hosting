const createLogger = require('../logger/logger');
const logger = createLogger('check_message');
const serverid = process.env.guildId;
const survey = [process.env.solo, process.env.duo, process.env.trio, process.env.quartet, process.env.quintet, process.env.sextet, process.env.septet, process.env.octet, process.env.pack];
const editorArchiveEvent = require('./editor_channels_archive_event');

async function check_message(message) {
    // Wait for the client to be ready
    const client = require('../bot'); // Importer le client ici pour éviter les dépendances circulaires
    if (!client.isReady) {
        await new Promise(resolve => client.once('ready', resolve));
    }

    const guild = client.guilds.cache.get(serverid);
    if (!guild) {
        logger.error(`Guild with ID ${serverid} not found`);
        return;
    }   

    const categoryID = process.env.categoryb;
    logger.debug(`Category ID: ${categoryID}`);
    logger.debug(`Message channel parent ID: ${message.channel.parent.id}`);
    if (message.channel.parent.id == categoryID) {
        logger.info(`Message received in ${message.channel.name} by ${message.author.tag}`);
        if (message.channel.name.includes('💤')) {
            const data = {
                'channel_name': message.channel.name,
                'channel_id': message.channel.id,
                'author_tag': message.author.tag,
                'author_id': message.author.bot ? 'bot' : message.author.id,
            }
            editorArchiveEvent.emit('editor_archive_event_U', data);
        }
        return;
    }

    if (message.author.bot) return;

    var validity = 0;
    if (survey.includes(message.channel.id)) {
        logger.info(`Message received in ${message.channel.name} by ${message.author.tag}`);
        if (message.attachments.size == 0){
            logger.info('No file uploaded');
            validity = 1;

        } else if (message.channel.id == process.env.pack) {
            for (const attachment of message.attachments.values()) {
                if (!(attachment.name.endsWith('.zip') || attachment.name.endsWith('.7z') || attachment.name.endsWith('.rar'))) {
                    logger.info('Invalid file uploaded');
                    validity = 2;
                }
            }
            
        } else {
            for (const attachment of message.attachments.values()) {
                if (!(attachment.name.endsWith('.mid') || attachment.name.endsWith('.midi') || attachment.name.endsWith('.lrc'))) {
                    logger.info('Invalid file uploaded');
                    validity = 3;
                }
            }
        }
        logger.debug(`Validity: ${validity}`);
        switch (validity) {
            case 1:
                logger.info('No file uploaded - trying to delete message');
                try {
                    await message.delete();
                    logger.info('No file uploaded - message deleted');
                    try {
                        const msgtpm = await message.channel.send(`Messages in this channel must contain a MIDI file attachment(s).`, { reply: message });
                        setTimeout(async () => {
                            try {
                                await msgtpm.delete();
                                logger.info('Temporary message deleted');
                            } catch (error) {
                                logger.error('Error while deleting temporary message', error);
                            }
                        }, 30000);
                    } catch (error) {
                        logger.error(`Error while sending message: ${error}`);
                    }
                } catch (error) {
                    logger.error(`Error while deleting message: ${error}`);
                    
                }
                return;
            case 2:
                logger.info('Invalid file uploaded - trying to delete message');
                try {
                    await message.delete();
                    logger.info('Invalid file uploaded - message deleted');
                    try {
                        const msgtpm = await message.channel.send(`Attachments in this channel must be one of [.zip, .rar, .7z].`, { reply: message });
                        setTimeout(async () => {
                            try {
                                await msgtpm.delete();
                                logger.info('Temporary message deleted');
                            } catch (error) {
                                logger.error('Error while deleting temporary message', error);
                            }
                        }, 30000);
                    } catch (error) {
                        logger.error(`Error while sending message: ${error}`);
                    }
                } catch (error) {
                    logger.error(`Error while deleting message: ${error}`);
                }
                return;
            case 3:
                logger.info('Invalid file uploaded - trying to delete message');
                try {
                    await message.delete();
                    logger.info('Invalid file uploaded - message deleted');
                    try {
                        const msgtpm = await message.channel.send(`Attachments in this channel must be one of [.mid, .midi, .lrc].`, { reply: message });
                        setTimeout(async () => {
                            try {
                                await msgtpm.delete();
                                logger.info('Temporary message deleted');
                            } catch (error) {
                                logger.error('Error while deleting temporary message', error);
                            }
                        }, 30000);
                    } catch (error) {
                        logger.error(`Error while sending message: ${error}`);
                    }
                } catch (error) {
                    logger.error(`Error while deleting message: ${error}`);
                }
                return;
            case 0:
                return;
            default:
                return;
        }
    }
}
module.exports = check_message;