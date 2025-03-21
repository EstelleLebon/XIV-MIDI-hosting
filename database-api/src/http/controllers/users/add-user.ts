import { z } from 'zod';

import { FastifyTypedInstance } from '@/types';
import { UserModel } from '@/database/schemas/user-schema';
import { checkAuthToken } from '@/http/middlewares/check-auth-token';

export async function addUser(app: FastifyTypedInstance) {
	app.post(
		'/users',
		{
			onRequest: [checkAuthToken],
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
				headers: z.object({
					'auth-token': z.string(),
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

			const user = await UserModel.create({
				discord_id,
				discord_name,
				editor_name,
				editor_channel_id,
				admin,
				editor_role,
			});

			return reply.status(200).send(user);
		},
	);
}
