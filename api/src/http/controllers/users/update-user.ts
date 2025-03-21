import { z } from 'zod';
import { FastifyTypedInstance } from '../../../types.ts';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function updateUser(app: FastifyTypedInstance) {
    app.put(
        '/users',
        {
            onRequest: [],
            schema: {
                tags: ['users'],
                description: 'Update a single user',
                body: z.object({
                    discord_id: z.string(),
                    discord_name: z.string().optional(),
                    editor_name: z.string().optional(),
                    editor_channel_id: z.string().optional(),
                    admin: z.boolean().optional(),
                    editor_role: z.boolean().optional(),
                }),
            },
        },

        async (request, reply) => {
            const {
                discord_id,
                discord_name,
                editor_name,
                editor_channel_id,
                admin,
                editor_role,
            } = request.body;

            // Filtrer les champs optionnels qui sont undefined
            const dataToUpdate = {
                ...(discord_name !== undefined && { discord_name }),
                ...(editor_name !== undefined && { editor_name }),
                ...(editor_channel_id !== undefined && { editor_channel_id }),
                ...(admin !== undefined && { admin }),
                ...(editor_role !== undefined && { editor_role }),
            };

            try {
                const user = await prisma.user.update({
                    where: {
                        discord_id: discord_id,
                    },
                    data: dataToUpdate,
                });

                return reply.status(200).send({ message: JSON.stringify(user) });
            } catch (error) {
                console.error(error);
                return reply.status(500).send({ error: 'Error updating user' });
            }
        },
    );
}