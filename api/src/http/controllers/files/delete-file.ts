import { z } from 'zod';
import { FastifyTypedInstance } from '../../../types.ts';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function deleteFile(app: FastifyTypedInstance) {
	app.delete(
		'/files/:md5',
		{
			onRequest: [],
			schema: {
				tags: ['files'],
				description: 'Delete one file from ID',
				params: z.object({
					md5: z.string(),
				}),
			},
		},

		async (request, reply) => {
			const { md5 } = request.params;
			console.log('Files - DELETE - Request params:', request.params);
			const file = await prisma.file.delete({
				where: {
					md5: md5,
				},
			});
			console.log('Files - DELETE - File deleted:', md5);
			return reply.status(200).send({ message: JSON.stringify(file) });
		},
	);
}