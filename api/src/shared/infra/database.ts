import prisma from '@prisma/client';

const database = new prisma.PrismaClient();

export const initDatabaseConnection = async () => {
    await database.$connect();
};

export const closeDatabaseConnection = async () => {
    await database.$disconnect();
}

