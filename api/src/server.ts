import { app } from './app.ts';

const port = parseInt(process.env.PORT || '3000', 10);


app.listen({
	host: '0.0.0.0',
	port: port,
}).then(() => {
	console.log(`🚀 HTTP Server Running on port: ${port}!`);
});