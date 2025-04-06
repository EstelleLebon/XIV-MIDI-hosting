import createLogger from '../logger/logger.js';
import editorArchiveEvent from '../../events/on_message.js';



const survey = [process.env.solo, process.env.duo, process.env.trio, process.env.quartet, process.env.quintet, process.env.sextet, process.env.septet, process.env.octet, process.env.pack];

class MessageCheck {
	constructor(message) {
		this.parent = message.channel.parent.id;
		this.channel = message.channel.id;
		this.author = message.author.id;
		this.author_tag = message.author.tag;
		this.validity = 0;
		this.attachments = message.attachments;
		this.message = message;
		this.logger = createLogger('MessageCheck');
		this.client = (async () => {
			const clientModule = await import('../../bot.js');
			const client = clientModule.default || clientModule;
			await new Promise(resolve => {
				if (client.isReady) {
					resolve();
				} else {
					client.once('ready', resolve);
				}
			});
			return client;
		})();
	}

	async check_message() {

		this.logger.info(`[check_message] Message received in ${this.message.channel.name} by ${this.author_tag}`);
		this.logger.debug(`[check_message] Comparing ${this.parent} with ${process.env.categoryb}`);

		if (this.parent == process.env.categoryb) {
			return this.check_archive()
		}

		this.logger.debug(`[check_message] Is bot message: ${this.message.author.bot}`);

		if (this.message.author.bot) return;

		this.logger.debug(`[check_message] Checking if ${this.channel} is in the survey list`);
		this.logger.debug(`[check_message] Survey list: ${survey}`);

		if (survey.includes(this.channel)) {
			return this.check_upload()
		};
	}

	async check_archive() {
		this.logger.info('[check_archive] Checking archive...');
		this.logger.debug(`[check_archive] Channel name: ${this.message.channel.name}`);
		if (this.message.channel.name.includes('💤')) {
			this.logger.info('[check_archive] Channel is archived');
			this.logger.debug(`[check_archive] Channel ID: ${this.channel}`);
			this.logger.debug(`[check_archive] Author ID: ${this.author}`);
			this.logger.debug(`[check_archive] Author tag: ${this.author_tag}`);
			const data = {
				'channel_name': this.message.channel.name,
				'channel_id': this.channel,
				'author_tag': this.author_tag,
				'author_id': this.author,
			}
			this.logger.debug(`[check_archive] Emitting editor_archive_event_U with data: ${JSON.stringify(data)}`);
			editorArchiveEvent.emit('editor_archive_event_U', data);
		}
		return;
	}

	async check_upload() {
		this.logger.info('[check_upload] Checking upload...');
		await this.validitycheck();
		this.logger.debug(`[check_upload] Validity: ${this.validity}`);
		var reply = '';
		switch (this.validity) {
			case 1:
				this.logger.info('[check_upload] No file uploaded - trying to delete message');
				reply = `Messages in this channel must contain a MIDI file attachment(s).`;
				break;
			case 2:
				this.logger.info('[check_upload] Invalid file uploaded - trying to delete message');
				reply = `Messages in this channel must contain a ZIP or RAR file attachment(s).`;
				break;
			case 3:
				this.logger.info('[check_upload] Invalid file uploaded - trying to delete message');
				reply = `Messages in this channel must contain a MIDI or LRC file attachment(s).`;
				break;
		}
		if (this.validity > 0) {
			this.logger.debug(`[check_upload] Deleting message with ID: ${this.message.id}`);
			try {
				await this.warn(reply);
				await this.message.delete(this.message.id);
				this.logger.info('[check_upload] Message deleted');
				
			} catch (error) {
				this.logger.error(`[check_upload] Error while deleting message: ${error}`);
			}
		}
		else {
			this.logger.info('[check_upload] File uploaded is valid');
		}
		this.logger.debug(`[check_upload] Validity check completed`);
		this.logger.debug(`[check_upload] Validity: ${this.validity}`);
		return;
	}

	async delete_message(id) {
		this.logger.debug(`[delete_message] Deleting message with ID: ${id}`);
		const message = await this.message.channel.messages.fetch(id).catch((error) => {
			this.logger.error(`[delete_message] Error fetching message with ID ${id}: ${error}`);
			return null;
		});
		if (message) {
			this.logger.debug(`[delete_message] Message found`);
			try {
				await message.delete();
			}
			catch (error) {
				this.logger.error(`[delete_message] Failed to delete message with ID ${id}: ${error}`);
			}
		} else {
			this.logger.warn(`[delete_message] Message with ID ${id} not found`);
		}
		return;
	}

	async validitycheck() {
		this.logger.debug(`[validitycheck] Checking validity...`);
		this.logger.debug(`[validitycheck] Attachments: ${JSON.stringify(this.attachments)}`);
		this.logger.debug(`[validitycheck] Attachments size: ${this.attachments.size}`);
		if (this.attachments.size == 0) {
			this.logger.info('[validitycheck] No file uploaded');
			this.validity = 1;
		}
		else if (this.channel == process.env.pack) {
			for (const attachment of this.attachments.values()) {
				if (!(attachment.name.endsWith('.zip') || attachment.name.endsWith('.7z') || attachment.name.endsWith('.rar'))) {
					this.logger.info('[validitycheck] Invalid file uploaded');
					this.validity = 2;
				}
			}
		} else {
			for (const attachment of this.attachments.values()) {
				if (!(attachment.name.endsWith('.mid') || attachment.name.endsWith('.midi') || attachment.name.endsWith('.lrc'))) {
					this.logger.info('[validitycheck] Invalid file uploaded');
					this.validity = 3;
				}
			}
		}
		this.logger.debug(`[validitycheck] Validity: ${this.validity}`);
	}

	async warn(message) {
		var msgtmp = null;
		this.logger.debug(`[warn] Warning user ${this.author_tag}...`);
		try {
			msgtmp = await this.message.reply({ content: message });
			this.logger.info('[warn] Warning sent');
		}
		catch (error) {
			this.logger.error(`[warn] Failed to send warning: ${error}`);
		}
		if (msgtmp) {
			setTimeout(async () => {
				try {
					await this.delete_message(msgtmp.id);
					this.logger.info('[warn] Temporary message deleted');
				} catch (error) {
					this.logger.error(`[warn] Failed to delete temporary message: ${error}`);
				}
			}, 120000);
		}
	}
}

export default MessageCheck;