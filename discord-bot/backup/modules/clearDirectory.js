const createLogger = require('../../logger/logger');
const logger = createLogger('ClearDirectory');
const path = require('path');
const fs = require('fs');

module.exports = function clearDirectory(directoryPath) {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            logger.error(`Error reading directory ${directoryPath}: ${err}`);
            return;
        }
        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            fs.unlink(filePath, (unlinkError) => {
                if (unlinkError) {
                    logger.error(`Error deleting file ${filePath}: ${unlinkError}`);
                } else {
                    logger.info(`Successfully deleted file ${filePath}`);
                }
            });
        }
    });
}