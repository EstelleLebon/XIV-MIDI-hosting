import { z } from 'zod';

import { FastifyTypedInstance } from '@/types';
import { checkAuthToken } from '@/http/middlewares/check-auth-token';
import { UserModel } from '@/database/schemas/user-schema';

export async function updateUser(app: FastifyTypedInstance) {
	app.put(
		'/users/:id',
		{
			onRequest: [checkAuthToken],
			schema: {
				tags: ['users'],
				description: 'Update a single user',
				params: z.object({
					id: z.string().optional(),
				}),
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
			const { id } = request.params;
			const {
				discord_id,
				discord_name,
				editor_name,
				editor_channel_id,
				admin,
				editor_role,
			} = request.body;

			const user = await UserModel.findOne({ discord_id: id });

			if (!user) {
				return reply.status(404).send({ message: 'User not found' });
			}

			// Update fields only if they are provided in the request
			if (discord_id !== undefined) user.discord_id = discord_id;
			if (discord_name !== undefined) user.discord_name = discord_name;
			if (editor_name !== undefined) user.editor_name = editor_name;
			if (editor_channel_id !== undefined)
				user.editor_channel_id = editor_channel_id;
			if (admin !== undefined) user.admin = admin;
			if (editor_role !== undefined) user.editor_role = editor_role;
			user.updatedAt = new Date();

			await user.save();

			return reply.status(200).send(user);
		},
	);
}
