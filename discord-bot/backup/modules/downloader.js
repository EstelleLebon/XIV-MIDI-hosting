/**
 * Télécharge les messages d'un canal Discord entre deux dates et les enregistre dans un fichier.
 * @param {Date} startDate - La date de début pour le téléchargement des messages.
 * @param {Date} endDate - La date de fin pour le téléchargement des messages.
 * @param {string} channelId - L'ID du canal Discord à partir duquel télécharger les messages.
 * @param {string} filePath - Le chemin du fichier où enregistrer les messages téléchargés.
 */


async function downloader(startDate, endDate, channelId, downloadPath) {
    const client = require('../../bot'); // Importer le client ici pour éviter les dépendances circulaires
    const fs = require('fs');
    const path = require('path');
    const createLogger = require('../../logger/logger');
    const logger = createLogger('Downloader');
    const batch = require('./batch'); // Importer la fonction batch

    // Attendre que le client soit prêt
    if (!client.isReady) {
        await new Promise(resolve => client.once('ready', resolve));
    }
    const channel = await client.channels.fetch(channelId);
    // logger.debug(`Downloading messages from channel ${channel.name}`);

    let messages = [];
    let lastId;
    var i = 0;
    while (true) {
        //logger.debug(`Fetching messages batch ${i++}`);
        const options = { limit: 100 };
        if (lastId) {
            options.before = lastId;
            //logger.debug(`Fetching messages before ID: ${lastId}`);
        }

        const fetchedMessages = await channel.messages.fetch(options);
        if (fetchedMessages.size === 0) {
            //logger.debug('No more messages to fetch.');
            break;
        }

        messages = messages.concat(Array.from(fetchedMessages.values()));
        lastId = fetchedMessages.last().id;
        //logger.debug(`Last message ID: ${lastId}`);

        if (new Date(fetchedMessages.last().createdTimestamp) < new Date(startDate)) {
            //logger.debug('Reached the start date.');
            break;
        }
    }

    messages = messages.filter(message => {
        const messageDate = new Date(message.createdTimestamp);
        const start = startDate instanceof Date ? startDate : new Date(startDate);
        const end = endDate instanceof Date ? endDate : new Date(endDate);
        return messageDate >= start && messageDate <= end;
    });

    if (messages.length === 0) {
        return 'No attachments found to download.';
    }

    let downloaded = false;

    // Diviser les messages en lots de 10
    const messageBatches = batch(messages, 10);
    const ext = ['.mid', '.midi', '.lrc', '.zip', '.7z', '.rar'];
    for (const messageBatch of messageBatches) {
        await Promise.all(messageBatch.map(async (message) => {
            // Traiter chaque message dans le lot
            const attachments = Array.from(message.attachments.values());
            for (const attachment of attachments) {
                if (ext.some(e => attachment.name.endsWith(e))) {
                    const filePath = path.join(downloadPath, attachment.name);

                    // Assurer que le répertoire de destination existe
                    if (!fs.existsSync(path.dirname(filePath))){
                        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
                    }

                    const response = await fetch(attachment.url);
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    await fs.promises.writeFile(filePath, buffer);
                    logger.info(`Downloaded ${attachment.name} to ${filePath}`);
                    downloaded = true;
                }
            }
        }));
    }

    if (!downloaded) {
        return 'No attachments found to download.';
    }

    return 'Attachments downloaded successfully.';
}

module.exports = downloader;