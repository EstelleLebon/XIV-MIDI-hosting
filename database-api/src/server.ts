import { env } from '@/shared/env';
import { app } from '@/app';

app.listen({
	host: '0.0.0.0',
	port: env.PORT,
}).then(() => {
	console.log(`🚀 HTTP Server Running on port: ${env.PORT}!`);
});