import { SlashCommandBuilder } from "discord.js";
import createLogger from "../../classes/logger/logger.js";
import Backup from "../../classes/backup/backup.js";

const logger = createLogger('Manual-Backup-Command');
const data = new SlashCommandBuilder()
	.setDefaultMemberPermissions(8)
	.setName('manual-backup')
	.setDescription("Backup the server manually.")

const execute = async (interaction) => {
	logger.info(`[execute] Executing manual backup command...`);
	
	await interaction.deferReply({ ephemeral: true });
	const fromDate = new Date();
	fromDate.setDate(1); // Set to the first day of the current month
	fromDate.setMonth(fromDate.getMonth() - 1); // Move to the previous month
	fromDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
	const backup = new Backup(fromDate);
	await backup.startBackup();
	logger.info(`[execute] Manual backup completed.`);
	
	await interaction.editReply({ content: 'Manual backup completed.', ephemeral: true });
}
export { data, execute };
export default {
	data: data,
	execute: execute,
};