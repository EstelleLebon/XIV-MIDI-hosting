import { z } from 'zod';
import { FastifyTypedInstance } from '../../../types.ts';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listFiles(app: FastifyTypedInstance) {
  app.get(
    '/files',
    {
      onRequest: [],
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
        response: {
          200: z.object({
            files: z.array(z.object(
              {
                id: z.number(),
                md5: z.string(),
                editor_discord_id: z.string(),
                editor: z.string(),
                artist: z.string(),
                title: z.string(),
                performer: z.string(),
                sources: z.string(),
                comments: z.string(),
                tags: z.array(z.string()),
                song_duration: z.number(),
                tracks: z.array(
                  z.object({
                    id: z.number(),
                    order: z.number(),
                    name: z.string(),
                    instrument: z.string(),
                    modifier: z.number(),
                  }),
                ),
                discord: z.boolean().nullable(),
                website: z.boolean().nullable(),
                editor_channel: z.boolean().nullable(),
                discord_message_id: z.string().nullable(),
                discord_link: z.string().nullable(),
                website_file_path: z.string().nullable(),
                website_link: z.string().nullable(),
                editor_channel_id: z.string().nullable(),
                editor_channel_link: z.string().nullable(),
                createdAt: z.date(),
                updatedAt: z.date(),
              },
            )),
            totalPages: z.number(),
            totalRecords: z.number(),
          }),
        },
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
        tags,
        instrument,
        discord,
        website,
        editor_channel,
        page,
        limit = 999999999,
      } = request.query;
      const skip = (page - 1) * limit;

      console.log('Query parameters:', request.query);

      const filter: any = {};
      // create a filter only with filled params so this route be more flexible, in the same route you can search for any filter
      if (md5) filter.md5 = md5;
      if (editor_discord_id) filter.editor_discord_id = editor_discord_id;
      if (editor) filter.editor = editor;
      if (artist) filter.artist = artist;
      if (title) filter.title = title;
      if (performer) filter.performer = performer;
      if (tags) filter.tags = { hasSome: tags };
      if (instrument) filter.tracks = { some: { instrument } };
      if (discord !== undefined) filter.discord = discord;
      if (website !== undefined) filter.website = website;
      if (editor_channel !== undefined) filter.editor_channel = editor_channel;

      console.log('Filter object:', filter);

      const files = await prisma.file.findMany({
        where: filter,
        skip: skip,
        take: limit,
        include: {
          tracks: true,
        },
      });

      const totalRecords = await prisma.file.count({
        where: filter,
      });

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