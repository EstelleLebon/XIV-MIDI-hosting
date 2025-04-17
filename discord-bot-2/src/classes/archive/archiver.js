import createLogger from "../logger/logger.js";
import Channel from "./channel.js";


class Archiver {
    
	constructor() {
		this.categoryID = process.env.categoryb; // Category ID for archiving
		this.serverid = process.env.guildId; // Guild ID for the server
		this.maxInactivity = 90; // Maximum inactivity period in days

		this.logger = createLogger('Archiver-Class'); // Logger instance for this class
		this.client = null

		this.channelsID = []; // Array to hold channels IDs
		this.channels = []; // Array to hold channel objects 

	}

	async worker(D) {
		
		this.logger.info(`[worker] Starting worker with parameter: ${D}`);
		
		// Initialize channels ID
		await this.initChannelsID(); // Initialize channels ID
		this.logger.debug(`[worker] Channels ID: ${JSON.stringify(this.channelsID, null, 2)}`);

		// Init list of promises

		const promises = this.channelsID.map(channelID => {

			this.logger.debug(`[worker] Processing channel ID: ${channelID}`);
			return this.processChannel(channelID, D);
		});
		

		await Promise.all(promises);
		this.logger.info(`[worker] All channels processed`);

		this.logger.info(`[worker] Worker finished`);
		return true;
	}

	async initChannelsID() {

		this.logger.info(`[initChannelsID] Initializing channels ID...`);
		this.client = await import('../../bot.js'); // Discord client instance
		this.client = this.client.default || this.client; // Get the default export or the module itself
		this.logger.debug(`[initChannelsID] Client initialized: ${this.client.user.tag}`);

		const guild = await this.client.guilds.cache.get(this.serverid);
        if (!guild) {
            this.logger.error(`Guild with ID ${this.serverid} not found`);
            return;
        }
        const category = await guild.channels.cache.get(this.categoryID);
		this.logger.debug(`[init] Category retrieved: ${category.name}`);

		const map = [];
		this.logger.debug(`[initChannelsID] Getting channels from category: ${this.categoryID}`);
		category.children.cache.forEach(channel => {
			map.push(channel.id);			
		});
		this.channelsID = map;

		this.logger.info(`[initChannelsID] Channels ID initialized: ${JSON.stringify(this.channelsID, null, 2)}`);

		return this.channelsID;
	}

	async processChannel(channelID, D) {
		this.logger.info(`[processChannel] Processing channel ID: ${channelID}`);
		const channel = new Channel();
		await channel.initFromID(channelID); // Initialize channel object from ID

		if (channel.archived) {
			this.logger.info(`[processChannel] Channel ID ${channelID} is already archived - Skipped.`);
			return;
		}

		this.logger.info(`[processChannel] Channel ID ${channelID} is not archived - Processing...`);
		
		// Compare last activity with today
		const today = new Date();
		const inactivityDays = (today - channel.lastActivity) / (1000 * 60 * 60 * 24);

		if (inactivityDays >= this.maxInactivity) {
			switch (D) {
				case 0:
					// Send Warning
					await channel.contact(D);
					break;
				case 6:
					// Send Reminder
					await channel.contact(D);
					break;
				case 7:
					// Archive Channel + Send Message
					this.logger.info(`[processChannel] Channel ID ${channelID} has exceeded inactivity limit - Archiving...`);
					await channel.archive();
					await channel.contact(D);
					break;

				default:
					this.logger.error(`[processChannel] Invalid parameter: ${D}`);
					break;
			}
		} else {
			this.logger.info(`[processChannel] Channel ID ${channelID} is still active - Not archiving.`);
		}
	}
}


export default Archiver;
export { Archiver };
