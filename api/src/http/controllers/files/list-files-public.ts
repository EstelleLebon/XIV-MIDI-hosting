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
          tags: z.array(z.string()).optional().describe('WIP(does not work yet)'),
          instrument: z.preprocess(
            (value) => {
              if (typeof value === 'string') {
                try {
                  return JSON.parse(value);
                } catch {
                  return value;
                }
              }
              return value;
            },
            z.union([
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
            ])
          ).optional().describe('Instrument used in the file. You can use a single instrument, an array of instruments, or multiple occurrences of the instrument parameter.'),
          limit: z.coerce.number().positive().default(100).describe('Max number of records to return'),
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
        limit,
      } = request.query;

      console.log('Query parameters:', request.query);

      const filter: any = {};
      // create a filter only with filled params so this route be more flexible, in the same route you can search for any filter
      if (md5) filter.md5 = md5;
      if (editor) filter.editor = { contains: editor, mode: 'insensitive' }; 
      if (artist) filter.artist = { contains: artist, mode: 'insensitive' }; 
      if (title) filter.title = { contains: title, mode: 'insensitive' };
      if (performer) filter.performer = { contains: performer, mode: 'insensitive' };
      if (tags) filter.tags = { hasSome: tags };
      if (instrument) {
        filter.AND = Array.isArray(instrument)
          ? instrument.map((inst) => ({ tracks: { some: { instrument: inst } } }))
          : [{ tracks: { some: { instrument } } }];
      }
      filter.website = true;

      console.log('Filter object:', filter);

      const files = await prisma.file.findMany({
        where: filter,
        take: limit,
        orderBy: {
          updatedAt: 'desc',
        },
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
        totalRecords,
      };

      return reply.status(200).send(response);
    },
  );
}