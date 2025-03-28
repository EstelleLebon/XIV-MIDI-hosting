import { fastify } from 'fastify';
import { ZodError } from 'zod';
import {
  validatorCompiler,
  serializerCompiler,
  ZodTypeProvider,
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
  jsonSchemaTransform,
} from 'fastify-type-provider-zod';
import { initDatabaseConnection } from './shared/infra/database.ts';
import { usersPrivateRoutes } from './http/controllers/users/routes/index.ts';
import { filesPublicRoutes } from './http/controllers/files/routes/public/index.ts';
import { filesPrivateRoutes } from './http/controllers/files/routes/private/index.ts';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

export const app = fastify().withTypeProvider<ZodTypeProvider>();

// set zod for routes input validation
app.setValidatorCompiler(validatorCompiler);

// set zod for routes response validation
app.setSerializerCompiler(serializerCompiler);

// register the database connection
app.register(initDatabaseConnection);

// register swagger
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

// register GET / route (return running message)
app.get('/', () => {
  return 'API running';
});

// Routes registration logic
if (process.env.public == 'true') {
  app.register(filesPublicRoutes);
} else {
  app.register(usersPrivateRoutes);
  app.register(filesPrivateRoutes);
}

// this handles the errors globally
app.setErrorHandler((error, request, reply) => {
  // handle validation errors
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

  // handle response serialization errors
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

  // handle other errors
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: error.format() });
  }

  // handle no production errors
  if (process.env.NODE_ENV !== 'production') {
    // console.error(error);
    console.log('error', 'Internal server error', error);
  } else {
    console.log('error', 'Internal server error', error);
  }

  // default error message
  return reply.status(500).send({ message: 'Internal server error.' });
});