import createLogger from "../logger/logger.js";
import fs from 'fs';

const now = new Date();
const last_month = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const formated_last_month = last_month.toLocaleString('default', { month: 'long', year: 'numeric' });
const year = last_month.getFullYear();

class Mover {
	constructor() {
		this.map = {
			'/usr/src/app/src/backup/send/FULL/1-solo.zip': `/usr/src/app/src/backup/output/${year}-${formated_last_month}-Solo-FULL.zip`,
			'/usr/src/app/src/backup/send/FULL/2-duo.zip': `/usr/src/app/src/backup/output/${year}-${formated_last_month}-Duo-FULL.zip`,
			'/usr/src/app/src/backup/send/FULL/3-trio.zip': `/usr/src/app/src/backup/output/${year}-${formated_last_month}-Trio-FULL.zip`,
			'/usr/src/app/src/backup/send/FULL/4-quartet.zip': `/usr/src/app/src/backup/output/${year}-${formated_last_month}-Quartet-FULL.zip`,
			'/usr/src/app/src/backup/send/FULL/5-quintet.zip': `/usr/src/app/src/backup/output/${year}-${formated_last_month}-Quintet-FULL.zip`,
			'/usr/src/app/src/backup/send/FULL/6-sextet.zip': `/usr/src/app/src/backup/output/${year}-${formated_last_month}-Sextet-FULL.zip`,
			'/usr/src/app/src/backup/send/FULL/7-septet.zip': `/usr/src/app/src/backup/output/${year}-${formated_last_month}-Septet-FULL.zip`,
			'/usr/src/app/src/backup/send/FULL/8-octet.zip': `/usr/src/app/src/backup/output/${year}-${formated_last_month}-Octet-FULL.zip`,
			'/usr/src/app/src/backup/send/FULL/pack.zip': `/usr/src/app/src/backup/output/${year}-${formated_last_month}-Pack-FULL.zip`,
			'/usr/src/app/src/backup/send/FULL/editor.zip': `/usr/src/app/src/backup/output/${year}-${formated_last_month}-Editor-FULL.zip`,
		};
		this.logger = createLogger('Backup-Mover-Class'); // Logger instance for this class
	}

	async worker() {
		this.logger.info(`[worker] Starting mover worker...`);
		const promises = [];
		for (const [key, value] of Object.entries(this.map)) {
			promises.push(this.move(key, value));
		}
		await Promise.all(promises);
		this.logger.info(`[worker] All files have been moved successfully.`);
	}
	
	async move(key, value) {
		this.logger.info(`[move] Copying file from ${key} to ${value}`);
		try {
			await fs.promises.copyFile(key, value); // Copie le fichier au lieu de le déplacer
			this.logger.info(`[move] File copied successfully from ${key} to ${value}`);
		} catch (err) {
			this.logger.error(`[move] Error copying file from ${key} to ${value}: ${err}`);
		}
	}
}

export default Mover;
export { Mover };