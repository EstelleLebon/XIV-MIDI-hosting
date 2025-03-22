import { z } from 'zod';
import { FastifyTypedInstance } from '../../../types.ts';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function deleteUser(app: FastifyTypedInstance) {
	app.delete(
		'/users/:discord_id',
		{
			onRequest: [],
			schema: {
				tags: ['users'],
				description: 'Delete a single user',
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
			console.log('Users - DELETE - Request params:', request.params);
			await prisma.user.delete({
				where: {
					discord_id: discord_id,
				},
			});
			console.log('Users - DELETE - User deleted:', discord_id);
			return reply.status(200).send({ message: 'User deleted' });
		},
	);
}