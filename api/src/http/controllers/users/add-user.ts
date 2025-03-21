import { z } from 'zod';
import { FastifyTypedInstance } from '../../../types.ts';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function addUser(app: FastifyTypedInstance) {
	app.post(
		'/users',
		{
			onRequest: [],
			schema: {
				tags: ['users'],
				description: 'Add a single user',
				body: z.object({
					discord_id: z.string(),
					discord_name: z.string(),
					editor_name: z.string(),
					editor_channel_id: z.string().optional(),
					admin: z.boolean(),
					editor_role: z.boolean(),
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
			const {
				discord_id,
				discord_name,
				editor_name,
				editor_channel_id,
				admin,
				editor_role,
			} = request.body;

			const user = await prisma.user.create({
				data: {
					discord_id,
					discord_name,
					editor_name,
					editor_channel_id,
					admin,
					editor_role,
				},
			});

			return reply.status(201).send({ message: JSON.stringify(user) });
		},			
	);
}