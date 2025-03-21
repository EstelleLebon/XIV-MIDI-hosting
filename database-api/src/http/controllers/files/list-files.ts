import { z } from 'zod';

import { FastifyTypedInstance } from '@/types';
import { FileDocument, FileModel } from '@/database/schemas/file-schema';
import { RootFilterQuery } from 'mongoose';
import { checkAuthToken } from '@/http/middlewares/check-auth-token';

export async function listFiles(app: FastifyTypedInstance) {
	app.get(
		'/files',
		{
			onRequest: [checkAuthToken],
			schema: {
				// for swagger config
				tags: ['files'],
				description: 'List files',
				querystring: z.object({
					md5: z.string().optional(),
					editor_discord_id: z.string().optional(),
					editor: z.string().optional(),
					artist: z.string().optional(),
					title: z.string().optional(),
					performer: z
						.enum([
							'Solo',
							'Duet',
							'Trio',
							'Quartet',
							'Quintet',
							'Sextet',
							'Septet',
							'Octet',
						])
						.optional(),
					sources: z.string().optional(),
					comments: z.string().optional(),
					tags: z.array(z.string()).optional(),
					instrument: z
						.enum([
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
						])
						.optional(),
					discord: z.coerce.boolean().optional(),
					website: z.coerce.boolean().optional(),
					editor_channel: z.coerce.boolean().optional(),
					page: z.coerce.number().positive().default(1),
					limit: z.coerce.number().positive().default(100),
				}),
				headers: z.object({
					'auth-token': z.string(),
				}),
				response: {
					200: z.object({
						files: z.array(z.unknown()),
						totalPages: z.number(),
						totalRecords: z.number(),
					}),
				},
			},
		},
		async (request, reply) => {
			const {
				md5,
				editor,
				artist,
				title,
				performer,
				tags,
				instrument,
				discord,
				website,
				editor_channel,
				page,
				limit,
			} = request.query;
			const skip = (page - 1) * limit;

			console.log('Query parameters:', request.query);

			const filter: RootFilterQuery<FileDocument> = {};
			// create a filter only with filled params so this route be more flexible, in the same route you can search for any filter
			Object.assign(filter, md5 && { md5 });
			Object.assign(filter, editor && { editor });
			Object.assign(filter, artist && { artist });
			Object.assign(filter, title && { title });
			Object.assign(filter, performer && { performer });
			Object.assign(filter, tags && { tags: { $in: tags } });
			Object.assign(
				filter,
				instrument && { 'tracks.instrument': instrument },
			);
			Object.assign(filter, discord !== undefined && { discord });
			Object.assign(filter, website !== undefined && { website });
			Object.assign(
				filter,
				editor_channel !== undefined && { editor_channel },
			);

			console.log('Filter object:', filter);

			const files = await FileModel.find(filter)
				.skip(skip)
				.limit(limit)
				.lean();

			const totalRecords = await FileModel.find(filter).countDocuments();

			console.log('Total records:', totalRecords);

			const response = {
				files,
				totalPages: Math.ceil(totalRecords / limit),
				totalRecords,
			};

			return reply.status(200).send(response);
		},
	);
}
