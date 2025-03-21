const { SlashCommandBuilder } = require('discord.js'); // Import the necessary discord.js classes
const customEvent = require('../../events/backup_event'); // Import the custom event
const createLogger = require('../../logger/logger'); // Import the logger
const logger = createLogger('BackupCommand'); // Create a logger with the name of this file 
const teamstr = process.env.team_id
const team_IDs = teamstr.split(',').map(id => id.trim());

module.exports = {
    data: new SlashCommandBuilder()
        .setName('backup')
        .setDescription("[ADMIN] Manually backup the server.")
        .setDefaultMemberPermissions(8) // Set default permissions for administrators (8 corresponds to ADMINISTRATOR)
        ,

    async execute(interaction) {
        // Check if the user has administrator permission
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            logger.warn(`User ${interaction.user.tag} / ${interaction.user.id} attempted to use the command without permission.`);
            return interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
        }
        if (!team_IDs.includes(interaction.user.id)) {
            logger.warn(`User ${interaction.user.tag} / ${interaction.user.id} attempted to use the command without permission.`);
            logger.warn(`Allowed users: ${team_IDs.join(', ')}`);
            return interaction.reply({ content: "This command can only be used by the bot admins.\nContact <@514764375106781194> for any query.", ephemeral: true });
        }

        // Trigger the custom event
        try {
            customEvent.emit('backup_event');
            logger.info(`Backup command executed by ${interaction.user.tag} / ${interaction.user.id}`);
            return interaction.reply({ content: "The backup process has been triggered.", ephemeral: true });
        } catch (error) {
            logger.error(`Error executing backup command: ${error.message}`);
            return interaction.reply({ content: "An error occurred while executing the backup command.", ephemeral: true });
        }
    },
};