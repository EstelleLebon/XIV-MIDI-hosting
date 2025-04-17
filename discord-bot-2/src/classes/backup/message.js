import createLogger from "../logger/logger.js";
import fs from 'fs/promises';
import fsSync from 'fs';
import axios from 'axios';

class Message{
	constructor(discordMessage) {
		this.ID = discordMessage.id; // ID of the message
		this.attachments = discordMessage.attachments; // Attachments in the message
		this.fileURL = discordMessage.attachments.map(attachment => attachment.url); // Files in the message
		
		this.discordMessage = discordMessage; // Discord message object

		this.logger = createLogger('Backup-Message-Class');
	}

	async ensureDirectoryExists(directoryPath) {
		try {
			await fs.access(directoryPath);
			this.logger.debug(`[ensureDirectoryExists] Directory exists: ${directoryPath}`);
		} catch (err) {
			this.logger.debug(`[ensureDirectoryExists] Directory does not exist, creating: ${directoryPath}`);
			await fs.mkdir(directoryPath, { recursive: true });
		}
	}

	async download(outputPath, type) {
		this.logger.info(`[download] Downloading message ${this.ID}...`);

		await this.ensureDirectoryExists(outputPath);

		if (!this.attachments || this.attachments.length === 0) {
			this.logger.debug(`[download] No attachments found`);
			return false;
		}

		let ext = [];
		switch (type) {
			case 'solo-octet':
				ext = ['.mid', '.lrc', '.midi'];
				break;
			case 'editor':
				ext = ['.mid', '.lrc', '.midi'];
				break;
			case 'pack':
				ext = ['.zip', '.rar', '.7z'];
				break;
			default:
				this.logger.error(`[download] Unknown type: ${type}`);
				return false;
		}
		this.logger.debug(`[download] Extensions: ${ext}`);

		await Promise.all(this.attachments.map(async (attachmentData) => {
			if (!attachmentData || !attachmentData.name) {
				this.logger.error(`[download] Invalid attachment or attachment has no name - Skipped.`);
				return;
			}

			this.logger.debug(`[download] Downloading attachment: ${attachmentData.name}`);
			if (!ext.some(extension => attachmentData.name.endsWith(extension))) {
				this.logger.debug(`[download] Attachment ${attachmentData.name} does not have a valid extension - Skipped.`);
				return;
			}

			const filePath = `${outputPath}/${attachmentData.name}`;
			let tmpPath = filePath.slice(0, filePath.lastIndexOf('.'));
			let tmpPath2 = tmpPath;
			const extension = filePath.slice(filePath.lastIndexOf('.'));

			let check = false;
			let i = 0;

			do {
				i++;
				try {
					await fs.access(tmpPath + extension);
					tmpPath = tmpPath2 + ` - ${i}`;
				} catch (err) {
					check = true;
				}
			} while (!check);

			const finalPath = tmpPath + extension;
			try {
				const response = await axios({
					method: 'get',
					url: attachmentData.url,
					responseType: 'stream'
				});
				const writer = fsSync.createWriteStream(finalPath);
				response.data.pipe(writer);
				await new Promise((resolve, reject) => {
					writer.on('finish', resolve);
					writer.on('error', reject);
				});
				this.logger.info(`[download] Attachment downloaded: ${finalPath}`);
			} catch (err) {
				this.logger.error(`[download] Error downloading attachment: ${err}`);
			}
		}));

		this.logger.info(`[download] Message downloaded: ${this.ID}`);
		return true;
	}

	toJSON() {
		return {
			'ID': this.ID,
			'attachments': this.attachments,
			'fileURL': this.fileURL,
			'initialized': this.initialized
		};
	}

}

export default Message;
export { Message };