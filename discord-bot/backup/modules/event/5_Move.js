const fs = require('fs');
const createLogger = require('../../../logger/logger');
const logger = createLogger('Backup-MoveFiles');

async function MoveFiles(OutputMap) {
    for (const channel of OutputMap) {
        const zip_pathfileI = channel.zip_pathfileI;
        const zip_pathfileF = channel.zip_pathfileF;
        const output = channel.output;
        const send_I = channel.send_I;
        const send_F = channel.send_F;
        try {
            fs.renameSync(zip_pathfileI, send_I);
            logger.info(`Moved ${zip_pathfileI} to ${send_I}`);
        } catch (err) {
            logger.error(`Failed to move ${zip_pathfileI} to ${send_I}: ${err.message}`);
        }
        try {
            fs.copyFileSync(zip_pathfileF, send_F);
            logger.info(`Copied ${zip_pathfileF} to ${send_F}`);
        } catch (err) {
            logger.error(`Failed to copy ${zip_pathfileF} to ${send_F}: ${err.message}`);
        }
        try {
            fs.copyFileSync(zip_pathfileF, output);
            logger.info(`Copied ${zip_pathfileF} to ${output}`);
        } catch (err) {
            logger.error(`Failed to copy ${zip_pathfileF} to ${output}: ${err.message}`);
        }
    }
}

module.exports = MoveFiles;