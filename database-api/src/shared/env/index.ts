import { z } from 'zod';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement depuis /env/.env
dotenv.config({ path: '/usr/src/app/env/.env' });

const envSchema = z.object({
    NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
    PORT: z.coerce.number().default(3333),
    API_TOKEN: z.string(),
    DATABASE_URL: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
    console.error('❌ Invalid environment variables', _env.error.format());

    throw new Error('Invalid environment variables.');
}

export const env = _env.data;