import createLogger from "../logger/logger.js";
import fs from "fs";

const now = new Date();
const last_month = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const formated_last_month = last_month.toLocaleString('default', { month: 'long', year: 'numeric' });
const year = last_month.getFullYear();
const prefixurl = `https://discord.com/channels/${process.env.guildId}/`;

class Poster {
	constructor(client) {
		this.client = client;
		this.logger = createLogger('Backup-Poster-Class'); // Logger instance for this class
		this.fullMap = [
			{
				'zip': '/usr/src/app/src/backup/send/FULL/1-solo.zip',
				'channel': process.env.solob,
				'message': `Full backup for [Solo](${prefixurl + process.env.solo}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Solo-FULL.zip`	
			},
			{
				'zip': '/usr/src/app/src/backup/send/FULL/2-duo.zip',
				'channel': process.env.duob,
				'message': `Full backup for [Duo](${prefixurl + process.env.duo}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Duo-FULL.zip`
			},
			{
				'zip': '/usr/src/app/src/backup/send/FULL/3-trio.zip',
				'channel': process.env.triob,
				'message': `Full backup for [Trio](${prefixurl + process.env.trio}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Trio-FULL.zip`
			},
			{
				'zip': '/usr/src/app/src/backup/send/FULL/4-quartet.zip',
				'channel': process.env.quartetb,
				'message': `Full backup for [Quartet](${prefixurl + process.env.quartet}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Quartet-FULL.zip`
			},
			{
				'zip': '/usr/src/app/src/backup/send/FULL/5-quintet.zip',
				'channel': process.env.quintetb,
				'message': `Full backup for [Quintet](${prefixurl + process.env.quintet}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Quintet-FULL.zip`
			},
			{
				'zip': '/usr/src/app/src/backup/send/FULL/6-sextet.zip',
				'channel': process.env.sextetb,
				'message': `Full backup for [Sextet](${prefixurl + process.env.sextet}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Sextet-FULL.zip`
			},
			{
				'zip': '/usr/src/app/src/backup/send/FULL/7-septet.zip',
				'channel': process.env.septetb,
				'message': `Full backup for [Septet](${prefixurl + process.env.septet}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Septet-FULL.zip`
			},
			{
				'zip': '/usr/src/app/src/backup/send/FULL/8-octet.zip',
				'channel': process.env.octetb,
				'message': `Full backup for [Octet](${prefixurl + process.env.octet}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Octet-FULL.zip`
			},
			{
				'zip': '/usr/src/app/src/backup/send/FULL/pack.zip',
				'channel': process.env.packb,
				'message': `Full backup for [Pack](${prefixurl + process.env.pack}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Pack-FULL.zip`
			},
			{
				'zip': '/usr/src/app/src/backup/send/FULL/editor.zip',
				'channel': process.env.editorb,
				'message': `Full backup for Editors channels as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Editors-FULL.zip`
			}
		];		
		this.incrMap = [
			{
				'zip': '/usr/src/app/src/backup/send/INCR/1-solo.zip',
				'channel': process.env.solob,
				'message': `Incremental backup for [Solo](${prefixurl + process.env.solo}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Solo-INCREMENTAL.zip`
			},
			{
				'zip': '/usr/src/app/src/backup/send/INCR/2-duo.zip',
				'channel': process.env.duob,
				'message': `Incremental backup for [Duo](${prefixurl + process.env.duo}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Duo-INCREMENTAL.zip`
			},
			{
				'zip': '/usr/src/app/src/backup/send/INCR/3-trio.zip',
				'channel': process.env.triob,
				'message': `Incremental backup for [Trio](${prefixurl + process.env.trio}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Trio-INCREMENTAL.zip`
			},
			{
				'zip': '/usr/src/app/src/backup/send/INCR/4-quartet.zip',
				'channel': process.env.quartetb,
				'message': `Incremental backup for [Quartet](${prefixurl + process.env.quartet}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Quartet-INCREMENTAL.zip`
			},
			{
				'zip': '/usr/src/app/src/backup/send/INCR/5-quintet.zip',
				'channel': process.env.quintetb,
				'message': `Incremental backup for [Quintet](${prefixurl + process.env.quintet}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Quintet-INCREMENTAL.zip`
			},
			{
				'zip': '/usr/src/app/src/backup/send/INCR/6-sextet.zip',
				'channel': process.env.sextetb,
				'message': `Incremental backup for [Sextet](${prefixurl + process.env.sextet}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Sextet-INCREMENTAL.zip`
			},
			{
				'zip': '/usr/src/app/src/backup/send/INCR/7-septet.zip',
				'channel': process.env.septetb,
				'message': `Incremental backup for [Septet](${prefixurl + process.env.septet}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Septet-INCREMENTAL.zip`
			},
			{
				'zip': '/usr/src/app/src/backup/send/INCR/8-octet.zip',
				'channel': process.env.octetb,
				'message': `Incremental backup for [Octet](${prefixurl + process.env.octet}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Octet-INCREMENTAL.zip`
			},
			{
				'zip': '/usr/src/app/src/backup/send/INCR/pack.zip',
				'channel': process.env.packb,
				'message': `Incremental backup for [Pack](${prefixurl + process.env.pack}) as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Pack-INCREMENTAL.zip`
			},
			{
				'zip': '/usr/src/app/src/backup/send/INCR/editor.zip',
				'channel': process.env.editorb,
				'message': `Incremental backup for Editors channels as of the end of ${formated_last_month}`,
				'filename': `${year}-${formated_last_month}-Editors-INCREMENTAL.zip`
			}
		];
		
	}

	async worker() {
		this.logger.info(`[worker] Starting poster worker...`);
		let promises = [];
		this.incrMap.forEach( async (item) => {
			promises.push(await this.post(item));
		});		
		await Promise.all(promises);
		this.logger.info(`[worker] Poster worker completed for incremental backups.`);

		promises = [];
		this.fullMap.forEach( async (item) => {
			promises.push(await this.post(item));
		});
		await Promise.all(promises);

		this.logger.info(`[worker] Poster worker completed for full backups.`);
		return true;
	}

	async post(item) {
		this.logger.info(`[post] Posting file: ${item.zip} to channel: ${item.channel}`);
		if (!fs.existsSync(item.zip)) {
			this.logger.debug(`[post] File not found: ${item.zip}`);
			return;
		}
		const channel = await this.client.channels.fetch(item.channel);
		if (!channel) {
			this.logger.error(`[post] Channel not found: ${item.channel}`);
			return;
		}
		try {
			await channel.send({
				content: item.message,
				files: [{ attachment: item.zip, name: item.filename }],
			});
			this.logger.info(`[post] File ${item.filename} posted successfully.`);
			return true;

		} catch (error) {
			this.logger.error(`[post] Error posting file ${item.filename}: ${error.message}`);
			return false;
		}
	}
}

export default Poster;
export { Poster };