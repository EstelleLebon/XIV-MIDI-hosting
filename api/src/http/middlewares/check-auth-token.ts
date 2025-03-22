import { FastifyReply, FastifyRequest } from 'fastify';

export async function checkAuthToken(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const authToken = request.headers['auth-token'];

	if (!authToken) {
		return reply
			.status(401)
			.send({ message: 'auth-token header is missing' });
	}

	if (process.env.API_TOKEN !== authToken) {
		return reply.status(401).send({ message: 'Unauthorized.' });
	}
}
