import { z } from 'zod';

import { FastifyTypedInstance } from '@/types';
import { UserModel } from '@/database/schemas/user-schema';
import { checkAuthToken } from '@/http/middlewares/check-auth-token';

export async function listUser(app: FastifyTypedInstance) {
	app.get(
		'/users/:id',
		{
			onRequest: [checkAuthToken],
			schema: {
				tags: ['users'],
				description: 'List a single user',
				params: z.object({
					id: z.string().optional(),
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

			// lean transform moongose response into a simple javascript object
			const user = await UserModel.findOne({ discord_id: id }).lean();

			if (!user) {
				return reply.status(200).send(null);
			}

			return reply.status(200).send(user);
		},
	);
}
