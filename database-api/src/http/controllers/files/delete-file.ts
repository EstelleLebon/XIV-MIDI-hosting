import { z } from 'zod';

import { FastifyTypedInstance } from '@/types';
import { checkAuthToken } from '@/http/middlewares/check-auth-token';
import { FileModel } from '@/database/schemas/file-schema';

export async function deleteFile(app: FastifyTypedInstance) {
	app.delete(
		'/files/:md5',
		{
			onRequest: [checkAuthToken],
			schema: {
				tags: ['files'],
				description: 'Delete file record',
				params: z.object({
					md5: z.string().nonempty(),
				}),
				headers: z.object({
					'auth-token': z.string(),
				}),
			},
		},
		async (request, reply) => {
			const { md5 } = request.params;

			const file = await FileModel.findOneAndDelete({ md5: md5 });

			if (!file) {
				return reply.status(404).send({ message: 'File not found' });
			}

			return reply.status(200).send({ message: 'File deleted' });
		},
	);
}
