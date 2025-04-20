import createLogger from "../logger/logger.js";
import fs from 'fs';


class Deleter {
	constructor() {
		this.logger = createLogger('Backup-Deleter-Class'); // Logger instance for this class
		this.map = [
			'/usr/src/app/src/backup/send/INCR/1-solo.zip',
			'/usr/src/app/src/backup/send/INCR/2-duo.zip',
			'/usr/src/app/src/backup/send/INCR/3-trio.zip',
			'/usr/src/app/src/backup/send/INCR/4-quartet.zip',
			'/usr/src/app/src/backup/send/INCR/5-quintet.zip',
			'/usr/src/app/src/backup/send/INCR/6-sextet.zip',
			'/usr/src/app/src/backup/send/INCR/7-septet.zip',
			'/usr/src/app/src/backup/send/INCR/8-octet.zip',
			'/usr/src/app/src/backup/send/INCR/pack.zip',
			'/usr/src/app/src/backup/send/INCR/editor.zip',
			'/usr/src/app/src/backup/work'
		]
	}

	async worker() {
		this.logger.info(`[worker] Starting deleter worker...`);
		const promises = [];
		for (const path of this.map) {
			promises.push(await this.delete(path));
		}
		await Promise.all(promises);
		this.logger.info(`[worker] All files have been deleted successfully.`);
	}

	async delete(path) {
		this.logger.info(`[delete] Deleting path: ${path}`);
		try {
			const stats = await fs.promises.stat(path).catch(() => null);
			if (!stats) {
				this.logger.info(`[delete] Path does not exist: ${path}`);
				return;
			}
			if (stats.isDirectory()) {
				this.logger.info(`[delete] Deleting directory: ${path}`);
				await fs.promises.rm(path, { recursive: true });
			} else {
				this.logger.info(`[delete] Deleting file: ${path}`);
				await fs.promises.unlink(path);
			}
			this.logger.info(`[delete] Deleted successfully: ${path}`);
		} catch (err) {
			this.logger.error(`[delete] Error deleting ${path}: ${err}`);
		}
	}
}

export default Deleter
export { Deleter }