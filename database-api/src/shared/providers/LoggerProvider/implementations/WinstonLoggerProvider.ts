import { createLogger, format, transports, Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { env } from '@/shared/env';
import { ILoggerProvider, logLeveType } from '../models/ILoggerProvider';

const { combine, timestamp, label, printf } = format;

interface ILoggerConfig {
	loggerFileDirectory: string;
	logFileName: string;
	errorLogFileName: string;
	loggerLabel: string;
}

export class WinstonLoggerProvider implements ILoggerProvider {
	private winstonLogger: Logger;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private logConsoleFormat: any; // Format

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private logFileFormat: any;

	private transportError: DailyRotateFile;

	private transportCombined: DailyRotateFile;

	constructor(private config: ILoggerConfig) {
		this.logConsoleFormat = printf(
			({
				level: logLevel,
				message: logMessage,
				label: logLabel,
				timestamp: logTimestamp,
			}) => {
				return `${logTimestamp} [${logLabel}] ${logLevel.toUpperCase()}: ${logMessage}`;
			},
		);

		this.logFileFormat = printf(
			({
				level: logLevel,
				message: logMessage,
				timestamp: logTimestamp,
			}) => {
				return `${logTimestamp} [${logLevel.toUpperCase()}]: ${logMessage}`;
			},
		);

		this.transportError = new DailyRotateFile({
			dirname: this.config.loggerFileDirectory,
			filename: this.config.errorLogFileName
				? `%DATE%_${this.config.errorLogFileName}`
				: `%DATE%_log-error`,
			level: 'error',
			datePattern: 'YYYY-MM-DD',
			extension: '.log',
			maxFiles: '30d',
		});

		this.transportCombined = new DailyRotateFile({
			dirname: this.config.loggerFileDirectory,
			filename: this.config.logFileName
				? `%DATE%_${this.config.logFileName}`
				: `%DATE%_log-combined`,
			datePattern: 'YYYY-MM-DD',
			extension: '.log',
			maxFiles: '30d',
		});

		this.winstonLogger = createLogger({
			level: env.NODE_ENV !== 'production' ? 'verbose' : 'info',
			format: combine(timestamp(), this.logFileFormat),
			transports:
				env.NODE_ENV === 'production'
					? [this.transportError, this.transportCombined]
					: [
							new transports.Console({
								format: combine(
									label({ label: this.config.loggerLabel }),
									timestamp(),
									this.logConsoleFormat,
								),
							}),

							new transports.File({
								dirname: this.config.loggerFileDirectory,
								filename: this.config.errorLogFileName
									? `${this.config.errorLogFileName}.log`
									: 'log-error.log',
								level: 'error',
							}),

							new transports.File({
								dirname: this.config.loggerFileDirectory,
								filename: this.config.logFileName
									? `${this.config.logFileName}.log`
									: 'log-combined.log',
							}),
						],
		});
	}

	log(level: logLeveType, message: string, ...meta: unknown[]): void {
		this.winstonLogger.log(level, message, ...meta);
	}
}
