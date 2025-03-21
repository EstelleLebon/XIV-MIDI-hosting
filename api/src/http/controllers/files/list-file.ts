import { z } from 'zod';
import { FastifyTypedInstance } from '../../../types.ts';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listFile(app: FastifyTypedInstance) {
	app.get(
		'/files/:md5',
		{
			onRequest: [],
			schema: {
				tags: ['files'],
				description: 'List one file from md5',
				params: z.object({
					md5: z.string(),
				}),
				// response: {
				//   200: z
				//     .object({
				//       name: z.string(),
				//       discordUserId: z.string(),
				//     })
				//     .nullable()
				//     .optional(),
				// },
			},
		},

		async (request, reply) => {
			const { md5 } = request.params;
			console.log('Files - GET - Request params:', request.params);
			const file = await prisma.file.findUnique({
				where: {
					md5: md5,
				},
			});
			console.log('Files - GET - File found:', file);
			return reply.status(200).send({ message: JSON.stringify(file) });
		},
	);
}