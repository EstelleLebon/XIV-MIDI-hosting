const createLogger = require('../../../logger/logger');
const logger = createLogger('Backup-ZIP');
const zipper = require('../zipper');

async function zip(ZipMap) {
    for (const channel of ZipMap) {
        const backup_channel_name = channel.backup_channel_name;
        const input = channel.input;
        const outputI = channel.zip_pathfileI;
        const outputF = channel.zip_pathfileF;
        logger.info(`Creating ZIP for channel: ${backup_channel_name}`);
        try {
            await zipper(input, outputI);
            logger.info(`Incremental backup ZIP created for channel: ${backup_channel_name}`);
        } catch (error) {
            logger.error(`Error creating incremental backup ZIP for channel: ${backup_channel_name}`, error);
        }
        try {
            await zipper(input, outputF);
            logger.info(`Full backup ZIP updated for channel: ${backup_channel_name}`);
        } catch (error) {
            logger.error(`Error updating full backup ZIP for channel: ${backup_channel_name}`, error);
        }
    }
}

module.exports = zip;