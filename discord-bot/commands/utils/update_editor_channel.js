const { SlashCommandBuilder } = require('discord.js');
const createLogger = require('../../logger/logger');
const logger = createLogger('update-editor-channel');
const editor_channel_id_func = require('./upload_modules/editor_channel_id');
const { get_user, update_user } = require('../../utils/user_db_tools');

module.exports = {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(0x0000001000000000)
        .setName('update-editor-channel')
        .setDescription("Update your editor channel ID."),

    async execute(interaction) {
        // Send a message to the user
        await interaction.reply({ content: "Updating editor channel ID...", ephemeral: true });
        const user = interaction.user;
        const editor_channel_id0 = editor_channel_id_func(interaction);
        logger.debug(`User: ${user.id}, Editor Channel ID: ${editor_channel_id0}`);
        if (!editor_channel_id0) {
            await interaction.editReply({ content: "Error updating editor channel ID.", ephemeral: true });
            return;
        }
        try {
            const user0 = await get_user(user.id);
            if (!user0) {
                logger.error(`User not found: ${user.id}`);
                await interaction.editReply({ content: "User not found.", ephemeral: true });
                return;
            }
            user0.editor_channel_id = editor_channel_id0;
            const updated_user = await update_user(user0);
            logger.debug(`Updated user: ${JSON.stringify(updated_user)}`);
        } catch (error) {
            logger.error(`Error updating editor channel ID: ${error}`);
            await interaction.editReply({ content: "Error updating editor channel ID.", ephemeral: true });
            return;
        }
        const link = `https://discord.com/channels/${interaction.guild.id}/${editor_channel_id0}`;
        await interaction.editReply({ content: `Editor channel ID updated to ${link}`, ephemeral: true });
    }
};