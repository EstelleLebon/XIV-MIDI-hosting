import { z } from 'zod';

import { FastifyTypedInstance } from '@/types';
import { UserModel } from '@/database/schemas/user-schema';
import { checkAuthToken } from '@/http/middlewares/check-auth-token';

export async function deleteUser(app: FastifyTypedInstance) {
	app.delete(
		'/users/:id',
		{
			onRequest: [checkAuthToken],
			schema: {
				tags: ['users'],
				description: 'Delete a single user',
				params: z.object({
					id: z.string(),
				}),
				headers: z.object({
					'auth-token': z.string(),
				}),
			},
		},
		async (request, reply) => {
			const { id } = request.params;

			const user = await UserModel.findOneAndDelete({ discord_id: id });

			if (!user) {
				return reply.status(404).send({ message: 'User not found' });
			}

			return reply.status(200).send({ message: 'User deleted' });
		},
	);
}
