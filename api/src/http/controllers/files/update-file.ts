import { z } from 'zod';
import { FastifyTypedInstance } from '../../../types.ts';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function updateFile(app: FastifyTypedInstance) {
	app.put(
		'/files',
		{
			onRequest: [],
			schema: {
				tags: ['files'],
				description: 'Update one file',
				body: z.object({
					md5: z.string().nonempty(),
					editor_discord_id: z.string().nonempty().optional(),
					editor: z.string().nonempty().optional(),
					artist: z.string().nonempty().optional(),
					title: z.string().nonempty().optional(),
					performer: z.string().nonempty().optional(),
					sources: z.string().optional(),
					comments: z.string().optional(),
					tags: z.array(z.string()).optional(),
					song_duration: z.number().optional(),
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
						}).optional(),
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
			},
		},
		async (request, reply) => {
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
				discord,
				website,
				editor_channel,
				discord_message_id,
				discord_link,
				website_file_path,
				website_link,
				editor_channel_id,
				editor_channel_link,
			} = request.body;

			console.log('Files - PUT - Request body:', request.body);

			const dataToUpdate = {
				md5,
				...(editor_discord_id !== undefined && { editor_discord_id }),
				...(editor !== undefined && { editor }),
				...(artist !== undefined && { artist }),
				...(title !== undefined && { title }),
				...(performer !== undefined && { performer }),
				...(sources !== undefined && { sources }),
				...(comments !== undefined && { comments }),
				...(tags !== undefined && { tags }),
				...(song_duration !== undefined && { song_duration }),
				...(tracks !== undefined && { create:tracks }),
				...(discord !== undefined && { discord }),
				...(website !== undefined && { website }),
				...(editor_channel !== undefined && { editor_channel }),
				...(discord_message_id !== undefined && { discord_message_id }),
				...(discord_link !== undefined && { discord_link }),
				...(website_file_path !== undefined && { website_file_path }),
				...(website_link !== undefined && { website_link }),
				...(editor_channel_id !== undefined && { editor_channel_id }),
				...(editor_channel_link !== undefined && { editor_channel_link }),
				updatedAt: new Date(),
			};

			console.log('Files - PUT - Data to update:', dataToUpdate);

			const file = await prisma.file.update({
				where: {
					md5: md5,
				},
				data: dataToUpdate,
			});

			console.log('Files - PUT - File updated:', file);
			return reply.status(200).send({ message: JSON.stringify(file) });
		},
	);
};