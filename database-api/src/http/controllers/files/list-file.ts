import { z } from 'zod';

import { FastifyTypedInstance } from '@/types';
import { FileModel } from '@/database/schemas/file-schema';
import { checkAuthToken } from '@/http/middlewares/check-auth-token';

export async function listFile(app: FastifyTypedInstance) {
	app.get(
		'/files/:md5',
		{
			onRequest: [checkAuthToken],
			schema: {
				tags: ['files'],
				description: 'List a single file',
				params: z.object({
					md5: z.string(),
				}),
				headers: z.object({
					'auth-token': z.string(),
				}),
				// response: {
				//   200: z
				//     .object({
				//       md5: z.string(),
				//       editor: z.string(),
				//       artist: z.string(),
				//       title: z.string(),
				//       ensembleSize: z.number(),
				//     })
				//     .nullable()
				//     .optional(),
				// },
			},
		},
		async (request, reply) => {
			const { md5 } = request.params;

			// lean transform moongose response into a simple javascript object
			const file = await FileModel.findOne({ md5: md5 }).lean();

			if (!file) {
				return reply.status(200).send(null);
			}

			return reply.status(200).send(file);
		},
	);
}
