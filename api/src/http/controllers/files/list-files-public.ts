import { z } from 'zod';
import { FastifyTypedInstance } from '../../../types.ts';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listFilesPublic(app: FastifyTypedInstance) {
  app.get(
    '/files',
    {
      onRequest: [],
      schema: {
        // for swagger config
        tags: ['files'],
        description: 'List files',
        querystring: z.object({
          md5: z.string().optional().describe('MD5 hash of the file'),
          editor: z.string().optional().describe('MIDI editor name'),
          artist: z.string().optional().describe('Artist of the song'),
          title: z.string().optional().describe('Title of the song'),
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
            .optional().describe('Band size'),
          sources: z.string().optional().describe('Sources of the file'),
          comments: z.string().optional().describe('Comments about the file'),
          tags: z.array(z.string()).optional().describe('WIP(does not work yet)'),
          instrument: z.union([
            z.enum([
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
            z.array(
              z.enum([
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
            ),
          ]).optional().describe('Instrument used in the file. You can use a single instrument or an array of instruments (AND filter).'),
          discord: z.coerce.boolean().optional().describe('Is the file shared on Discord?'),
          website: z.coerce.boolean().optional().describe('Is the file shared on the website?'),
          editor_channel: z.coerce.boolean().optional().describe('Is the file shared on the personal editor channel?'),
          page: z.coerce.number().positive().default(1).describe('Page number for pagination'),
          limit: z.coerce.number().positive().default(100).describe('Number of records per page'),
        }),
        response: {
          200: z.object({
            files: z.array(z.object(
              {
                artist: z.string(),
                title: z.string(),
                editor: z.string(),                
                performer: z.string(),
                sources: z.string(),
                comments: z.string(),
                tags: z.array(z.string()),
                song_duration: z.number(),
                tracks: z.array(
                  z.object({
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
      if (editor) filter.editor = editor;
      if (artist) filter.artist = artist;
      if (title) filter.title = title;
      if (performer) filter.performer = performer;
      if (tags) filter.tags = { hasSome: tags };
      if (instrument) {
        filter.AND = Array.isArray(instrument)
          ? instrument.map((inst) => ({ tracks: { some: { instrument: inst } } }))
          : [{ tracks: { some: { instrument } } }];
      }
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

      // Format the files to remove unnecessary fields
      const formattedFiles = files.map((file) => {
        const {
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
          createdAt,
          updatedAt,
        } = file;
        return {
          artist,
          title,
          editor,          
          performer,
          sources,
          comments,
          tags,
          song_duration,
          tracks: tracks.map((track) => ({
            order: track.order,
            name: track.name,
            instrument: track.instrument,
            modifier: track.modifier,
          })),
          discord,
          website,
          editor_channel,
          discord_message_id,
          discord_link,
          website_file_path,
          website_link,
          editor_channel_id,
          editor_channel_link,
          createdAt,
          updatedAt,
        };
      });

      const response = {
        files: formattedFiles, // Renamed from formattedFiles to files to match the schema
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords,
      };

      return reply.status(200).send(response);
    },
  );
}