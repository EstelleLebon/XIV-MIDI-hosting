import { z } from 'zod';
import { FastifyTypedInstance } from '../../../types.ts';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listUser(app: FastifyTypedInstance) {
	app.get(
		'/users/:discord_id',
		{
			onRequest: [],
			schema: {
				tags: ['users'],
				description: 'List one user from discord ID',
				params: z.object({
					discord_id: z.string(),
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
			const { discord_id } = request.params;
			console.log('Users - GET - Request params:', request.params);
			const user = await prisma.user.findUnique({
				where: {
					discord_id: discord_id,
				},
			});
			console.log('Users - GET - User found:', user);
			return reply.status(200).send(user);
		},
	);
}