import createLogger from '../logger/logger.js'; // Import the logger utility
import editorArchiveEvent from '../../events/editor_channels_archive_event.js' // Import the event emitter for archive events

// Define the survey channels using environment variables
const survey = [process.env.solo, process.env.duo, process.env.trio, process.env.quartet, process.env.quintet, process.env.sextet, process.env.septet, process.env.octet, process.env.pack];

class MessageCheck {
	constructor(message) {
		// Initialize properties from the message object
		this.parent = message.channel.parent.id; // Parent category ID of the channel
		this.channel = message.channel.id; // Channel ID
		this.author = message.author.id; // Author ID
		this.author_tag = message.author.tag; // Author tag (username#discriminator)
		this.validity = 0; // Validity flag for message attachments
		this.attachments = message.attachments; // Attachments in the message
		this.message = message; // The message object
		this.logger = createLogger('MessageCheck'); // Logger instance for this class

		// Asynchronously load the bot client
		this.client = (async () => {
			const clientModule = await import('../../bot.js'); // Dynamically import the bot module
			const client = clientModule.default || clientModule; // Get the default export or the module itself
			await new Promise(resolve => {
				// Wait for the bot client to be ready
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
		// Log the received message details
		this.logger.info(`[check_message] Message received in ${this.message.channel.name} by ${this.author_tag}`);
		this.logger.debug(`[check_message] Comparing ${this.parent} with ${process.env.categoryb}`);

		// Check if the message is in the archive category
		if (this.parent == process.env.categoryb) {
			return this.check_archive();
		}

		// Ignore messages sent by bots
		this.logger.debug(`[check_message] Is bot message: ${this.message.author.bot}`);
		if (this.message.author.bot) return;

		// Check if the channel is part of the survey list
		this.logger.debug(`[check_message] Checking if ${this.channel} is in the survey list`);
		this.logger.debug(`[check_message] Survey list: ${survey}`);
		if (survey.includes(this.channel)) {
			return this.check_upload();
		}
	}

	async check_archive() {
		// Log the archive check process
		this.logger.info('[check_archive] Checking archive...');
		this.logger.debug(`[check_archive] Channel name: ${this.message.channel.name}`);

		// Check if the channel name indicates it is archived
		if (this.message.channel.name.includes('💤')) {
			this.logger.info('[check_archive] Channel is archived');
			this.logger.debug(`[check_archive] Channel ID: ${this.channel}`);
			this.logger.debug(`[check_archive] Author ID: ${this.author}`);
			this.logger.debug(`[check_archive] Author tag: ${this.author_tag}`);

			// Prepare data for the archive event
			const data = {
				'channel_name': this.message.channel.name,
				'channel_id': this.channel,
				'author_tag': this.author_tag,
				'author_id': this.author,
			};
			this.logger.debug(`[check_archive] Emitting editor_archive_event_U with data: ${JSON.stringify(data)}`);
			editorArchiveEvent.emit('editor_archive_event_U', data); // Emit the archive event
		}
		return;
	}

	async check_upload() {
		// Log the upload check process
		this.logger.info('[check_upload] Checking upload...');
		await this.validitycheck(); // Perform validity check on attachments
		this.logger.debug(`[check_upload] Validity: ${this.validity}`);

		// Prepare a reply message based on the validity result
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

		// If the message is invalid, warn the user and delete the message
		if (this.validity > 0) {
			this.logger.debug(`[check_upload] Deleting message with ID: ${this.message.id}`);
			try {
				await this.warn(reply); // Send a warning to the user
				await this.message.delete(this.message.id); // Delete the message
				this.logger.info('[check_upload] Message deleted');
			} catch (error) {
				this.logger.error(`[check_upload] Error while deleting message: ${error}`);
			}
		} else {
			this.logger.info('[check_upload] File uploaded is valid');
		}
		this.logger.debug(`[check_upload] Validity check completed`);
		this.logger.debug(`[check_upload] Validity: ${this.validity}`);
		return;
	}

	async delete_message(id) {
		// Log the message deletion process
		this.logger.debug(`[delete_message] Deleting message with ID: ${id}`);
		const message = await this.message.channel.messages.fetch(id).catch((error) => {
			this.logger.error(`[delete_message] Error fetching message with ID ${id}: ${error}`);
			return null;
		});

		// If the message exists, delete it
		if (message) {
			this.logger.debug(`[delete_message] Message found`);
			try {
				await message.delete();
			} catch (error) {
				this.logger.error(`[delete_message] Failed to delete message with ID ${id}: ${error}`);
			}
		} else {
			this.logger.warn(`[delete_message] Message with ID ${id} not found`);
		}
		return;
	}

	async validitycheck() {
		// Log the validity check process
		this.logger.debug(`[validitycheck] Checking validity...`);
		this.logger.debug(`[validitycheck] Attachments: ${JSON.stringify(this.attachments)}`);
		this.logger.debug(`[validitycheck] Attachments size: ${this.attachments.size}`);

		// Check if there are no attachments
		if (this.attachments.size == 0) {
			this.logger.info('[validitycheck] No file uploaded');
			this.validity = 1;
		}
		// Check if the channel requires ZIP/RAR files
		else if (this.channel == process.env.pack) {
			for (const attachment of this.attachments.values()) {
				if (!(attachment.name.endsWith('.zip') || attachment.name.endsWith('.7z') || attachment.name.endsWith('.rar'))) {
					this.logger.info('[validitycheck] Invalid file uploaded');
					this.validity = 2;
				}
			}
		} else {
			// Check if the channel requires MIDI/LRC files
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
		// Log the warning process
		var msgtmp = null;
		this.logger.debug(`[warn] Warning user ${this.author_tag}...`);
		try {
			msgtmp = await this.message.reply({ content: message }); // Send a warning message
			this.logger.info('[warn] Warning sent');
		} catch (error) {
			this.logger.error(`[warn] Failed to send warning: ${error}`);
		}

		// Delete the warning message after 2 minutes
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

export default MessageCheck; // Export the MessageCheck class