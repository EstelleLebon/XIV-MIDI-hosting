const path = require('path');
const fs = require('fs');
const createLogger = require('../../../logger/logger');
const logger = createLogger('Backup-Clear');

async function PostFiles(OutputMap) {
    for (const work of OutputMap) {
        fs.readdir(work.clear_path, (err, files) => {
            if (err) {
                logger.error(`Unable to scan directory: ${err}`);
                return;
            }

            for (const file of files) {
                fs.unlink(`${work.clear_path}/${file}`, err => {
                    if (err) {
                        logger.error(`Unable to delete file: ${err}`);
                    } else {
                        logger.info(`Deleted file: ${file}`);
                    }
                });
            }
        });

        fs.unlink(work.send_I, err => {
            if (err) {
                logger.error(`Unable to delete zip file: ${err}`);
            } else {
                logger.info(`Deleted zip file: ${work.send_I}`);
            }
        });

        fs.unlink(work.send_F, err => {
            if (err) {
                logger.error(`Unable to delete zip file: ${err}`);
            } else {
                logger.info(`Deleted zip file: ${work.send_F}`);
            }
        });
    }

    const editor_path = path.resolve(__dirname, `../../workplace/downloads/Editors/`);
    fs.readdir(editor_path, (err, files) => {
        if (err) {
            logger.error(`Unable to scan directory: ${err}`);
            return;
        }

        for (const file of files) {
            const filePath = path.join(editor_path, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    logger.error(`Unable to stat file: ${err}`);
                    return;
                }

                if (stats.isDirectory()) {
                    fs.rmdir(filePath, { recursive: true }, err => {
                        if (err) {
                            logger.error(`Unable to delete directory: ${err}`);
                        } else {
                            logger.info(`Deleted directory: ${filePath}`);
                        }
                    });
                } else {
                    fs.unlink(filePath, err => {
                        if (err) {
                            logger.error(`Unable to delete file: ${err}`);
                        } else {
                            logger.info(`Deleted file: ${filePath}`);
                        }
                    });
                }
            });
        }
    });
}

module.exports = PostFiles;