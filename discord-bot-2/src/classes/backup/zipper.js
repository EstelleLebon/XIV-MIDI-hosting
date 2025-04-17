import fs from 'fs';
import path from 'path';
import createLogger from "../logger/logger.js";
import AdmZip from "adm-zip";

class Zipper {
	constructor() {
		this.fullMap = {
			'/usr/src/app/src/backup/work/1-solo': '/usr/src/app/src/backup/send/FULL/1-solo.zip',
			'/usr/src/app/src/backup/work/2-duo': '/usr/src/app/src/backup/send/FULL/2-duo.zip',
			'/usr/src/app/src/backup/work/3-trio': '/usr/src/app/src/backup/send/FULL/3-trio.zip',
			'/usr/src/app/src/backup/work/4-quartet': '/usr/src/app/src/backup/send/FULL/4-quartet.zip',
			'/usr/src/app/src/backup/work/5-quintet': '/usr/src/app/src/backup/send/FULL/5-quintet.zip',
			'/usr/src/app/src/backup/work/6-sextet': '/usr/src/app/src/backup/send/FULL/6-sextet.zip',
			'/usr/src/app/src/backup/work/7-septet': '/usr/src/app/src/backup/send/FULL/7-septet.zip',
			'/usr/src/app/src/backup/work/8-octet': '/usr/src/app/src/backup/send/FULL/8-octet.zip',
			'/usr/src/app/src/backup/work/9-pack': '/usr/src/app/src/backup/send/FULL/pack.zip',
			'/usr/src/app/src/backup/work/0-editor': '/usr/src/app/src/backup/send/FULL/editor.zip',
		};
		this.incrMap = {
			'/usr/src/app/src/backup/work/1-solo': '/usr/src/app/src/backup/send/INCR/1-solo.zip',
			'/usr/src/app/src/backup/work/2-duo': '/usr/src/app/src/backup/send/INCR/2-duo.zip',
			'/usr/src/app/src/backup/work/3-trio': '/usr/src/app/src/backup/send/INCR/3-trio.zip',
			'/usr/src/app/src/backup/work/4-quartet': '/usr/src/app/src/backup/send/INCR/4-quartet.zip',
			'/usr/src/app/src/backup/work/5-quintet': '/usr/src/app/src/backup/send/INCR/5-quintet.zip',
			'/usr/src/app/src/backup/work/6-sextet': '/usr/src/app/src/backup/send/INCR/6-sextet.zip',
			'/usr/src/app/src/backup/work/7-septet': '/usr/src/app/src/backup/send/INCR/7-septet.zip',
			'/usr/src/app/src/backup/work/8-octet': '/usr/src/app/src/backup/send/INCR/8-octet.zip',
			'/usr/src/app/src/backup/work/9-pack': '/usr/src/app/src/backup/send/INCR/pack.zip',
			'/usr/src/app/src/backup/work/0-editor': '/usr/src/app/src/backup/send/INCR/editor.zip',

		}
		this.logger = createLogger('Backup-Zipper-Class'); // Logger instance for this class
	}

	async worker() {
		this.logger.info(`[worker] Starting zipper worker...`);
		let promises = [];
		for (const [key, value] of Object.entries(this.fullMap)) {
			promises.push(await this.zip(key, value));
		}
		await Promise.all(promises);
		promises = [];
		for (const [key, value] of Object.entries(this.incrMap)) {
			promises.push(await this.zip(key, value));
		}
		await Promise.all(promises);
		this.logger.info(`[worker] Zipper worker completed.`);
		return true;
	}

	async zip(key, value) {
		async function addFilesToZip(dir, baseDir = '') {
			const entries = await fs.promises.readdir(dir, { withFileTypes: true });
			for (const entry of entries) { // Remplacement de forEach par for...of
				const fullPath = path.join(dir, entry.name);
				const relativePath = path.join(baseDir, entry.name);
				if (entry.isDirectory()) {
					await addFilesToZip(fullPath, relativePath);
				} else if (entry.isFile()) {
					// Remove the existing file from the archive if it exists
					const existingEntry = zip.getEntry(relativePath);
					if (existingEntry) {
						zip.deleteFile(relativePath);
					}
					zip.addLocalFile(fullPath, baseDir);
				}
			}
		}
		if (!fs.existsSync(key)) {
			this.logger.debug(`[zip] Directory does not exist: ${key}`);
			return false;
		}
		let zip;
		this.logger.info(`[zip] Zipping ${key} to ${value}`);
		try {		
			if (fs.existsSync(value)) {
				this.logger.info(`[zip] File exists, editing: ${value}`);
				zip = new AdmZip(value); 
			} else {
				this.logger.info(`[zip] File does not exist, creating: ${value}`);
				zip = new AdmZip();
			}
			await addFilesToZip(key);
			this.logger.info(`[zip] Added files to zip: ${key}`);
			zip.writeZip(value);

		} catch (error) {
			this.logger.error(`[zip] Error zipping ${key}: ${error}`);
		}

	}

	

}

export default Zipper;
export { Zipper };