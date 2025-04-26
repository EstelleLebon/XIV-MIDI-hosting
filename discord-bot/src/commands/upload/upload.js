import { SlashCommandBuilder, MessageFlags } from "discord.js";
import createLogger from "../../classes/logger/logger.js";
import Upload from "../../classes/upload/upload.js";
import dbcheck from "../../classes/dbcheck/dbcheck.js";

const logger = createLogger('Upload-Command');

const data = new SlashCommandBuilder()
    .setDefaultMemberPermissions(0x0000001000000000)
    .setName('upload')
    .setDescription("Upload MIDI files.")
    .addAttachmentOption(option => option
        .setName('midi')
        .setDescription('[required] .mid file to upload.')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('band-size')
        .setDescription('[required] Number of performers / tracks.')
        .setRequired(true)
        .addChoices(
            {name: 'solo', value: 'Solo'},
            {name: 'duet', value: 'Duet'},
            {name: 'trio', value: 'Trio'},
            {name: 'quartet', value: 'Quartet'},
            {name: 'quintet', value: 'Quintet'},
            {name: 'sextet', value: 'Sextet'},
            {name: 'septet', value: 'Septet'},
            {name: 'octet', value: 'Octet'},
        )
    )
    .addStringOption(option => option
        .setName('artist')
        .setDescription('[required] Artist of the song.')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('title')
        .setDescription('[required] Title of the song.')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('editor-name')
        .setDescription('[optional] Enter your desired editor name (will be saved as default for future uploads).')
        .setRequired(false)
    )
    /*.addStringOption(option => option
        .setName('tags')
        .setDescription('[optional] Separate tags with commas.')
        .setRequired(false)
    )*/
    .addStringOption(option => option
        .setName('source')
        .setDescription('[optional] Source of the MIDI file.')
        .setRequired(false)
    )
    .addStringOption(option => option
        .setName('comment')
        .setDescription('[optional] Any additional information.')
        .setRequired(false)
    )

const execute = async (interaction) => {
    logger.info(`Upload command executed by ${interaction.user.tag} in ${interaction.guild.name}`);
    logger.debug(`User ID: ${interaction.user.id}`);
    logger.debug(`Channel ID: ${interaction.channel.id}`);
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // check if db is up
    const db = new dbcheck();
    const dbStatus = await db.check();
    if (!dbStatus) {
        logger.error('Database is down, aborting upload.');
        return interaction.editReply({ content: 'Database is down, please try again later.', flags: MessageFlags.Ephemeral });
    }
    logger.debug(`Database status: ${dbStatus}`);
    const work = new Upload(interaction, false);
    logger.debug('Starting upload process...');
    await work.process();
    logger.debug('Upload process completed.');
    }



export { data, execute };
export default {
    data: data,
    execute: execute,
};