const createLogger = require('../../../logger/logger');
const logger = createLogger('Backup-PostMessages');

async function PostFiles(OutputMap, guild) {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', { month: 'long' });
    for (const work of OutputMap) {
        const channel = guild.channels.cache.get(work.backup_channel_id);
        const FileI = work.send_I;
        const FileF = work.send_F;
        const messageI = `Incremental backup for ${work.backup_channel_name} as of the end of ${month} ${year}`;
        const messageF = `Full backup for ${work.backup_channel_name} as of the end of ${month} ${year}`;
        try {
            await channel.send({ content: messageI, files: [FileI] });
            logger.info(`Message sent to channel: ${channel.name}`);
        } catch (error) {
            logger.error(`Error sending message to channel: ${channel.name}`, error);
        }
        try {
            await channel.send({ content: messageF, files: [FileF] });
            logger.info(`Message sent to channel: ${channel.name}`);
        } catch (error) {
            logger.error(`Error sending message to channel: ${channel.name}`, error);
        }
    }
}

module.exports = PostFiles;