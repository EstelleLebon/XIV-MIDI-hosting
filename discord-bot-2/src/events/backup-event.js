import Backup from "../classes/backup/backup.js";



async function backup_server() {
	const fromDate = new Date();
	fromDate.setDate(1); // Set to the first day of the current month
	fromDate.setMonth(fromDate.getMonth() - 1); // Move to the previous month
	fromDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
	const backup = new Backup(fromDate);
	await backup.startBackup();
	logger.info(`[execute] Manual backup completed.`);
}

export default backup_server;
