const { SlashCommandBuilder } = require('discord.js'); // Import the necessary discord.js classes
const createLogger = require('../../logger/logger'); // Import the logger
const customEvent2 = require('../../events/init_backup_event');
const logger = createLogger('BackupCommandINIT'); // Create a logger with the name of this file 
const teamstr = process.env.team_id
const team_IDs = teamstr.split(',').map(id => id.trim());


module.exports = {
    data: new SlashCommandBuilder()
        .setName('backupinit')
        .setDescription("[ADMIN] DO NOT USE !!! Manually initialize backup folders for bot .")
        .setDefaultMemberPermissions(8), // Set default permissions for administrators (8 corresponds to ADMINISTRATOR)

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
            customEvent2.emit('backup_event_init');
            logger.info(`Backup command INIT executed by ${interaction.user.tag} / ${interaction.user.id}`);
            return interaction.reply({ content: "Backup folders initialized.", ephemeral: true });
        } catch (error) {
            logger.error(`Error executing backup command: ${error.message}`);
            return interaction.reply({ content: "An error occurred while executing the backup command.", ephemeral: true });
        }

    },
};