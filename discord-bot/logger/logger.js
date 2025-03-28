const winston = require('winston');
const fs = require('fs');

const createLogger = (moduleName) => {
    const logger = winston.createLogger({

        level: 'debug',

        transports: [
            new winston.transports.Console({

                format: winston.format.combine(
                    winston.format.label({ label: moduleName }),
                    winston.format.colorize(),
                    winston.format.timestamp(),
                    winston.format.printf(({ timestamp, level, message, label }) => {
                        return `${timestamp} [${label}] ${level}: ${message}`;
                    })
                )
            }),
            new winston.transports.File({ 
                filename: './logs/Discord_Bot.log',
                format: winston.format.combine(
                    winston.format.label({ label: moduleName }),
                    winston.format.timestamp(),
                    winston.format.printf(({ timestamp, level, message, label }) => {
                        return `${timestamp} [${label}] ${level}: ${message}`;
                    })
                )
            })
            
        ]
    });


    logger.addSeparator = () => {
        let separator = '------------------------------------------------------------------------------------------------------------------------------------\n';
        separator = separator + separator + separator;

        const content = `\n\n\n${separator}\n\n`;
        logger.transports.forEach((transport) => {
            if (transport instanceof winston.transports.Console || transport instanceof winston.transports.File) {
                transport.log({
                    level: 'info',
                    message: content,
                    [Symbol.for('level')]: '',
                    [Symbol.for('message')]: content
                });
            }
        });
    };

    logger.addSmallSeparator = () => {
        let separator = '------------------------------------------------------------------------------------------------------------------------------------\n';
        const content = `\n${separator}`;
        logger.transports.forEach((transport) => {
            if (transport instanceof winston.transports.Console || transport instanceof winston.transports.File) {
                transport.log({
                    level: 'info',
                    message: content,
                    [Symbol.for('level')]: '',
                    [Symbol.for('message')]: content
                });
            }
        });
    };

    logger.addlineSeparator = () => {
        const content = '------------------------------------------------------------------------------------------------------------------------------------';
        logger.transports.forEach((transport) => {
            if (transport instanceof winston.transports.Console || transport instanceof winston.transports.File) {
                transport.log({
                    level: 'info',
                    message: content,
                    [Symbol.for('level')]: '',
                    [Symbol.for('message')]: content
                });
            }
        });
    };

    return logger;
};

module.exports = createLogger;