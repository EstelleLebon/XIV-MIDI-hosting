import { FastifyRequest } from 'fastify';

import { logger } from '@/shared/infra/logger';

export async function debugRequest(request: FastifyRequest) {
	logger.log('info', 'Request Debug', JSON.stringify(request.body, null, 2));
}
