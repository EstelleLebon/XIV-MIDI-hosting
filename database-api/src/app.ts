import { fastify } from 'fastify';
import { fastifyCors } from '@fastify/cors';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { ZodError } from 'zod';
import {
	validatorCompiler,
	serializerCompiler,
	ZodTypeProvider,
	jsonSchemaTransform,
	hasZodFastifySchemaValidationErrors,
	isResponseSerializationError,
} from 'fastify-type-provider-zod';

import { env } from '@/shared/env';
import { logger } from '@/shared/infra/logger';
import { initDatabaseConnection } from '@/shared/infra/database';
import { usersRoutes } from '@/http/controllers/users/routes';
import { filesRoutes } from '@/http/controllers/files/routes';
// import { checkAuthToken } from '@/http/middlewares/check-auth-token';
import { debugRequest } from '@/http/middlewares/debug-request';

export const app = fastify().withTypeProvider<ZodTypeProvider>();

// set zod for routes input validation
app.setValidatorCompiler(validatorCompiler);
// set zod for routes response validation
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, { origin: '*' });

app.register(initDatabaseConnection);

app.register(fastifySwagger, {
	openapi: {
		info: {
			title: 'API',
			version: '1.0.0',
		},
	},
	transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
	routePrefix: '/docs',
});

app.get('/', () => {
	return 'API running';
});

// global token check
// app.addHook('preHandler', checkAuthToken);

// degbug log request data
if (env.NODE_ENV !== 'production') {
	app.addHook('preHandler', debugRequest);
}

app.register(usersRoutes);
app.register(filesRoutes);

// this handles the errors globally, so you don't need to create a try catch in every function you are doing
app.setErrorHandler((error, request, reply) => {
	if (hasZodFastifySchemaValidationErrors(error)) {
		return reply.code(400).send({
			error: 'Response Validation Error',
			message: "Request doesn't match the schema",
			statusCode: 400,
			details: {
				issues: error.validation,
				method: request.method,
				url: request.url,
			},
		});
	}

	if (isResponseSerializationError(error)) {
		return reply.code(500).send({
			error: 'Internal Server Error',
			message: "Response doesn't match the schema",
			statusCode: 500,
			details: {
				issues: error.cause.issues,
				method: error.method,
				url: error.url,
			},
		});
	}

	if (error instanceof ZodError) {
		return reply
			.status(400)
			.send({ message: 'Validation error.', issues: error.format() });
	}

	if (env.NODE_ENV !== 'production') {
		// console.error(error);
		logger.log('error', 'Internal server error', error);
	} else {
		logger.log('error', 'Internal server error', error);
	}

	return reply.status(500).send({ message: 'Internal server error.' });
});
