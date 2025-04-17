import createLogger from "../logger/logger.js";
import Channel from "./channel.js";
import Zipper from "./zipper.js";
import Poster from "./poster.js"
import Mover from "./mover.js";
import Deleter from "./deleter.js"

const legacylist = [process.env.solo, process.env.duo, process.env.trio, process.env.quartet, process.env.quintet, process.env.sextet, process.env.septet, process.env.octet];
const pack = process.env.pack;
const categoryID = process.env.categoryb;

const fromDate = new Date();
fromDate.setDate(1); // Set to the first day of the current month
fromDate.setMonth(fromDate.getMonth() - 1); // Move to the previous month
fromDate.setHours(0, 0, 0, 0); // Set time to 00:00:00

class Backup {
	constructor(fromDate = fromDate) {
		this.logger = createLogger('Backup-Class'); // Logger instance for this class
		this.fromDate = fromDate;
		this.backuplist = []; // Array to hold backup IDs
		this.initialized = false; // Flag to check if the backup is initialized
		this.client = null; // Discord client instance
		this.logger.debug(`[Backup Constructor] fromDate: ${this.fromDate}`);

	}

	async initBackupList() {

		this.logger.info(`[initBackupList] Initializing backup list...`);
		this.client = await import('../../bot.js'); // Discord client instance
		this.client = this.client.default || this.client; // Get the default export or the module itself
		this.logger.debug(`[initBackupList] Client initialized: ${this.client.user.tag}`);

		// add legacy list to backup list
		this.logger.debug(`[initBackupList] Legacy list: ${legacylist}`);
		this.backuplist = legacylist;
		this.logger.debug(`[initBackupList] Backup list: ${this.backuplist}`);
		// Add the pack to the backup list
		this.logger.debug(`[initBackupList] Pack: ${pack}`);
		this.backuplist.push(pack);
		this.logger.debug(`[initBackupList] Backup list: ${this.backuplist}`);

		// Add each child of the category to the backup list
		const category = await this.client.channels.fetch(categoryID);
		this.logger.debug(`[initBackupList] Fetching children of category: ${category.name}`);
		await category.children.cache.forEach(child => {
			this.backuplist.push(child.id);
		});

		this.logger.debug(`[initBackupList] Backup list after adding children: ${this.backuplist}`);

		// Remove duplicates from the backup list
		this.backuplist = [...new Set(this.backuplist)];
		this.logger.debug(`[initBackupList] Backup list after removing duplicates: ${this.backuplist}`);

		this.initialized = true;
		this.logger.debug(`[initBackupList] Backup list initialized: ${this.backuplist}`);
		return true;
	}
	
	async startBackup() {
		this.logger.info(`[startBackup] Starting backup process...`);
		// Initialize Object
		if (!this.initialized) {
			await this.initBackupList();
		}

		// Initialize download promises
		for (const chan of this.backuplist) {
			this.logger.debug(`[startBackup] Processing backup ID: ${chan}`);
			const channel = new Channel(chan, null, this.fromDate);
			await channel.worker();
			this.logger.info(`[startBackup] Backup completed for ID: ${chan}`);
		}

		// Zip files 
		this.logger.info(`[startBackup] Zipping files...`);
		const zipper = new Zipper();
		await zipper.worker();
		this.logger.info(`[startBackup] Zipping completed`);


		// Post files to discord
		this.logger.info(`[startBackup] Posting files to Discord...`);
		const poster = new Poster(this.client); // Post files to Discord
		await poster.worker();
		this.logger.info(`[startBackup] Posting completed`);

		// move files to backup folder
		this.logger.info(`[startBackup] Moving files to backup folder...`);
		const mover = new Mover(); // Move files to backup folder
		await mover.worker();
		this.logger.info(`[startBackup] Moving completed`);

		// Delete files
		this.logger.info(`[startBackup] Deleting files...`);
		const deleter = new Deleter(); // Delete files
		await deleter.worker();
		this.logger.info(`[startBackup] Deleting completed`);

		this.logger.info(`[startBackup] Backup process completed`);

	}
}


export default Backup;
export { Backup };