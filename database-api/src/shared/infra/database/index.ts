import mongoose from 'mongoose';

import { env } from '@/shared/env';

export const initDatabaseConnection = async (): Promise<void> => {
	if (mongoose.connection.readyState === 0) {
		await mongoose.connect(env.DATABASE_URL);
	}
};

export const closeDatabaseConnection = async (): Promise<void> => {
	await mongoose.connection.close();
};
