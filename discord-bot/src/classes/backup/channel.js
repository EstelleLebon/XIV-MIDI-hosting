import createLogger from '../logger/logger.js';
import Message from './message.js';

const solo_octet = [process.env.solo, process.env.duo, process.env.trio, process.env.quartet, process.env.quintet, process.env.sextet, process.env.septet, process.env.octet]
const pack = process.env.pack
const categoryID = process.env.categoryb

let toDate0 = new Date();
toDate0.setDate(1); // Set to the first day of the current month
toDate0.setHours(0, 0, 0, 0);
let fromDate0 = new Date();
fromDate0.setDate(1); // Set to the first day of the current month
fromDate0.setMonth(fromDate0.getMonth() - 1); // Move to the previous month
fromDate0.setHours(0, 0, 0, 0); // Set time to 00:00:00


class Channel {
	constructor(ID, toDate = toDate0, fromDate = fromDate0) {
		this.ID = ID; // ID of the channel
		this.name = null; // Name of the channel
		this.messages = []; // Array to hold messages
		this.type = null; // Type of the channel
		this.serverid = process.env.guildId; // Guild ID for the server
		this.logger = createLogger('Backup-Channel-Class'); // Logger instance for this class
		this.toDate = toDate != null ? toDate : toDate0;
		this.fromDate = fromDate != null ? fromDate : fromDate0;
		this.outputPath = null; // Output path for the backup
		this.logger.debug(`[Channel Constructor] fromDate: ${this.fromDate}, toDate: ${this.toDate}`);
	}



	initOutputPath() {
		this.logger.info(`[initOutputPath] Initializing output path...`);
		this.logger.debug(`[initOutputPath] Channel type: ${this.type}`);
		switch (this.type) {
			case 'solo-octet':
				switch (this.ID) {
					case process.env.solo:
						this.outputPath = `/usr/src/app/src/backup/work/1-solo`;
						break;
					case process.env.duo:
						this.outputPath = `/usr/src/app/src/backup/work/2-duo`;
						break;
					case process.env.trio:
						this.outputPath = `/usr/src/app/src/backup/work/3-trio`;
						break;
					case process.env.quartet:
						this.outputPath = `/usr/src/app/src/backup/work/4-quartet`;
						break;
					case process.env.quintet:
						this.outputPath = `/usr/src/app/src/backup/work/5-quintet`;
						break;
					case process.env.sextet:
						this.outputPath = `/usr/src/app/src/backup/work/6-sextet`;
						break;
					case process.env.septet:
						this.outputPath = `/usr/src/app/src/backup/work/7-septet`;
						break;
					case process.env.octet:
						this.outputPath = `/usr/src/app/src/backup/work/8-octet`;
						break;
					default:
						this.logger.error(`[initOutputPath] Unknown channel ID: ${this.ID}`);
						return;
				}
				break;
			case 'pack':
				this.outputPath = `/usr/src/app/src/backup/work/9-pack`;
						break;
			case 'editor':
				this.outputPath = `/usr/src/app/src/backup/work/0-editor/${this.name.replace(/[^a-zA-Z0-9\-]/g, '')}`;
				break;
			default:
				this.logger.error(`[initOutputPath] Unknown channel type: ${this.type}`);
				return;
		}
		this.logger.info(`[initOutputPath] Output path initialized: ${this.outputPath}`);
	}
	
	async processMessage(message) {
		this.logger.info(`[processMessage] Processing message: ${message.id}`);
		const msg = new Message(message); // Create a new Message instance
		await msg.download(this.outputPath, this.type); // Download the message
		return true;		
	}
	async workerInit() {
		this.client = await import('../../bot.js'); // Discord client instance
		this.client = this.client.default || this.client; // Get the default export or the module itself
		this.logger.debug(`[initFromID] Client initialized: ${this.client.user.tag}`);

		// Fetch the channel from the client
		const channel = await this.client.channels.fetch(this.ID);

		if (!channel) {
			this.logger.error(`[initFromID] Channel with ID ${this.ID} not found`);
			return;
		}

		this.name = channel.name; // Set channel name
		
		// Set channel type
		if (solo_octet.includes(channel.id)) {
			this.type = 'solo-octet';
		}
		else if (pack == channel.id) {
			this.type = 'pack';
		} 
		else if (channel.parentId == categoryID) {
			this.type = 'editor';
		}
		else {
			this.type = 'unknown';
		}
		this.logger.debug(`[initFromID] Channel type: ${this.type}`);

		// Init Output Path
		this.initOutputPath();
		this.logger.debug(`[initFromID] Output path: ${this.outputPath}`);

	}
	async worker() {
		this.logger.info(`[worker] Worker method called for channel: ${this.ID}`);

		// Init settings
		await this.workerInit();

		// Fetch messages and process them in batches of 10, including threads
		const channel = await this.client.channels.fetch(this.ID);
		if (!channel) {
			this.logger.error(`[worker] Channel with ID ${this.ID} not found`);
			return;
		}

		let lastId = null;
		const maxConcurrent = 10;

		while (true) {
			const options = { limit: 10 };
			if (lastId) options.before = lastId;

			const fetchedMessages = await channel.messages.fetch(options);
			this.logger.debug(`[worker] Fetched ${fetchedMessages.size} messages`);
			if (fetchedMessages.size === 0) break;

			const promises = []; // Local array for promises

			for (const message of fetchedMessages.values()) {
				const messageDate = message.createdAt;
				this.logger.debug(`[worker] Message ID: ${message.id}, Date: ${messageDate}`);

				if (messageDate >= this.fromDate && messageDate <= this.toDate) {
					this.logger.debug(`[worker] Message ${message.id} is within date range`);
					promises.push(await this.processMessage(message));

					// Limit concurrent processing
					if (promises.length >= maxConcurrent) {
						await Promise.all(promises);
						promises.length = 0; // Clear the array
					}
				}
			}

			// Wait for remaining promises to resolve
			if (promises.length > 0) {
				await Promise.all(promises);
			}

			lastId = fetchedMessages.last()?.id;
		}

		// Process threads
		const threads = await channel.threads.fetchActive();
		const archivedThreads = await channel.threads.fetchArchived();
		const allThreads = [...threads.threads.values(), ...archivedThreads.threads.values()];

		for (const thread of allThreads) {
			let lastThreadMessageId = null;

			while (true) {
				const options = { limit: 10 };
				if (lastThreadMessageId) options.before = lastThreadMessageId;

				const fetchedThreadMessages = await thread.messages.fetch(options);
				this.logger.debug(`[worker] Fetched ${fetchedThreadMessages.size} messages from thread ${thread.id}`);
				if (fetchedThreadMessages.size === 0) break;

				const threadPromises = []; // Local array for thread promises

				for (const message of fetchedThreadMessages.values()) {
					const messageDate = message.createdAt;
					this.logger.debug(`[worker] Thread Message ID: ${message.id}, Date: ${messageDate}`);

					if (messageDate >= this.fromDate && messageDate <= this.toDate) {
						this.logger.debug(`[worker] Thread Message ${message.id} is within date range`);
						threadPromises.push(await this.processMessage(message));

						// Limit concurrent processing
						if (threadPromises.length >= maxConcurrent) {
							await Promise.all(threadPromises);
							threadPromises.length = 0; // Clear the array
						}
					}
				}

				// Wait for remaining thread promises to resolve
				if (threadPromises.length > 0) {
					await Promise.all(threadPromises);
				}

				lastThreadMessageId = fetchedThreadMessages.last()?.id;
			}
		}

		this.logger.info(`[worker] All messages and threads processed for channel: ${this.name}`);
		return true;
	}
}

export default Channel; // Export the Channel class
export { Channel }; // Export the Channel class for named import