import { SlashCommandBuilder } from "discord.js";
import createLogger from "../../classes/logger/logger.js";
import Backup from "../../classes/backup/backup.js";

const logger = createLogger('Init-Backup-Command');
const data = new SlashCommandBuilder()
	.setDefaultMemberPermissions(8)
	.setName('init-backup')
	.setDescription("Initialize backup folders.")

	
const execute = async (interaction) => {
	logger.info(`[execute] Executing init backup command...`);
	await interaction.deferReply({ ephemeral: true });
	// set from to Date 1990-01-01
	let fromDate = new Date('1990-01-01');
	fromDate.setHours(0, 0, 0, 0);
	

	const backup = new Backup(fromDate, true);
	await backup.startBackup();
	logger.info(`[execute] Init backup completed.`);
	
	await interaction.editReply({ content: 'Init backup completed.', ephemeral: true });
}
export { data, execute };
export default {
	data: data,
	execute: execute,
};