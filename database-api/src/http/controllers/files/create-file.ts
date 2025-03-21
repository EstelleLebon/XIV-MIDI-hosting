import { z } from 'zod';

import { FastifyTypedInstance } from '@/types';
import { checkAuthToken } from '@/http/middlewares/check-auth-token';
import { FileModel } from '@/database/schemas/file-schema';

export async function createFile(app: FastifyTypedInstance) {
	app.post(
		'/files',
		{
			onRequest: [checkAuthToken],
			schema: {
				tags: ['files'],
				description: 'Create file record',
				// this validates the request data format any error will be caught in the app.setErrorHandler on app.ts file
				body: z.object({
					md5: z.string().nonempty(),
					editor_discord_id: z.string().nonempty(),
					editor: z.string().nonempty(),
					artist: z.string().nonempty(),
					title: z.string().nonempty(),
					performer: z.string().nonempty(),
					sources: z.string().optional(),
					comments: z.string().optional(),
					tags: z.array(z.string()).optional(),
					song_duration: z.number(),
					tracks: z.array(
						z.object({
							order: z.number().min(0),
							name: z.string().nonempty(),
							instrument: z.enum([
								'Piano',
								'Harp',
								'Fiddle',
								'Lute',
								'Fife',
								'Flute',
								'Oboe',
								'Panpipes',
								'Clarinet',
								'Trumpet',
								'Saxophone',
								'Trombone',
								'Horn',
								'Tuba',
								'Violin',
								'Viola',
								'Cello',
								'DoubleBass',
								'ElectricGuitarOverdriven',
								'ElectricGuitarClean',
								'ElectricGuitarMuted',
								'ElectricGuitarPowerChords',
								'ElectricGuitarSpecial',
								'ElectricGuitar',
								'Program:ElectricGuitar',
								'BassDrum',
								'SnareDrum',
								'Cymbal',
								'Bongo',
								'Timpani',
								'Unknown',
							]),
							modifier: z.number(),
						}),
					),
					discord: z.boolean().optional(),
					website: z.boolean().optional(),
					editor_channel: z.boolean().optional(),
					discord_message_id: z.string().optional(),
					discord_link: z.string().optional(),
					website_file_path: z.string().optional(),
					website_link: z.string().optional(),
					editor_channel_id: z.string().optional(),
					editor_channel_link: z.string().optional(),
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
			try {
				const {
					md5,
					editor_discord_id,
					editor,
					artist,
					title,
					performer,
					sources,
					comments,
					tags,
					song_duration,
					tracks,
					discord = false,
					website = false,
					editor_channel = false,
					discord_message_id,
					discord_link,
					website_file_path,
					website_link,
					editor_channel_id,
					editor_channel_link,
				} = request.body;

				console.log('Files - POST - Request body:', request.body);

				const file = await FileModel.create({
					md5,
					editor_discord_id,
					editor,
					artist,
					title,
					performer,
					sources,
					comments,
					tags,
					song_duration,
					tracks,
					discord,
					website,
					editor_channel,
					discord_message_id,
					discord_link,
					website_file_path,
					website_link,
					editor_channel_id,
					editor_channel_link,
				});

				console.log('Files - POST - Created file:', file);

				return reply.status(201).send(file);
			} catch (error) {
				console.error('Files - POST - Error creating file:', error);
				return reply
					.status(500)
					.send({ message: 'Internal server error' });
			}
		},
	);
}
