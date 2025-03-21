import { z } from 'zod';
import { FastifyTypedInstance } from '@/types';
import { checkAuthToken } from '@/http/middlewares/check-auth-token';
import { FileModel } from '@/database/schemas/file-schema';

export async function updateFile(app: FastifyTypedInstance) {
	app.put(
		'/files',
		{
			onRequest: [checkAuthToken],
			schema: {
				tags: ['files'],
				description: 'Update file record',
				// this validates the request data format any error will be caught in the app.setErrorHandler on app.ts file
				body: z.object({
					md5: z.string().nonempty(),
					editor_discord_id: z.string().optional(),
					editor: z.string().optional(),
					artist: z.string().optional(),
					title: z.string().optional(),
					performer: z.string().optional(),
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
							modifier: z.number().min(0),
						}),
					).optional(),
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

			const file = await FileModel.findOne({ md5: md5 });

			if (!file) {
				return reply.status(404).send({ message: 'File not found' });
			}

			// Update fields only if they are provided in the request
			if (editor_discord_id !== undefined)
				file.editor_discord_id = editor_discord_id;
			if (editor !== undefined) file.editor = editor;
			if (artist !== undefined) file.artist = artist;
			if (title !== undefined) file.title = title;
			if (performer !== undefined) file.performer = performer;
			if (sources !== undefined) file.sources = sources;
			if (comments !== undefined) file.comments = comments;
			if (tags !== undefined) file.tags = tags;
			if (song_duration !== undefined) file.song_duration = song_duration;
			if (tracks !== undefined) file.tracks = tracks;
			if (discord !== undefined) file.discord = discord;
			if (website !== undefined) file.website = website;
			if (editor_channel !== undefined)
				file.editor_channel = editor_channel;
			if (discord_message_id !== undefined)
				file.discord_message_id = discord_message_id;
			if (discord_link !== undefined) file.discord_link = discord_link;
			if (website_file_path !== undefined)
				file.website_file_path = website_file_path;
			if (website_link !== undefined) file.website_link = website_link;
			if (editor_channel_id !== undefined)
				file.editor_channel_id = editor_channel_id;
			if (editor_channel_link !== undefined)
				file.editor_channel_link = editor_channel_link;
			file.updatedAt = new Date();

			await file.save();

			return reply.status(200).send(file);
		},
	);
}
