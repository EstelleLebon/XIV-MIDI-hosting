import path from 'node:path';

import { WinstonLoggerProvider } from '@/shared/providers/LoggerProvider/implementations/WinstonLoggerProvider';

export const logger = new WinstonLoggerProvider({
	loggerFileDirectory: path.resolve(__dirname, '..', '..', '..', '..', 'log'),
	logFileName: 'log-combined',
	errorLogFileName: 'log-error',
	loggerLabel: 'API',
});
