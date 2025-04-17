import createLogger from '../logger/logger.js'; // Import the logger utility
import Channel from './channel.js';

class Sorter {
    constructor() {
		this.categoryID = process.env.categoryb; // Category ID for archiving
		this.serverid = process.env.guildId; // Guild ID for the server
		this.client = null
		this.logger = createLogger('Sorter-Class'); // Logger instance for this class
		this.channelsID = []; // Array to hold channels IDs
        this.channels= []; // Array to hold channel objects
		this.sortedChannels = []; // Array to hold sorted channels
		this.initialized = false; // Flag to check if the sorter is initialized

    }

	async init() {
		this.logger.info(`[init] Initializing sorter...`);

		this.client = await import('../../bot.js'); // Discord client instance
		this.client = this.client.default || this.client; // Get the default export or the module itself
		this.logger.debug(`[init] Client initialized: ${this.client.user.tag}`);

		const guild = this.client.guilds.cache.get(this.serverid);
        if (!guild) {
            this.logger.error(`Guild with ID ${this.serverid} not found`);
            return;
        }
        const category = guild.channels.cache.get(this.categoryID);
		this.logger.debug(`[init] Category retrieved: ${category.name}`);


		this.channelsID = category.children.cache.map(channel => channel.id);
		this.logger.info(`[init] Channels IDs initialized: ${JSON.stringify(this.channelsID, null, 2)}`);

		// Promise to get channel objects
		const promises = this.channelsID.map(async channelID => {
			this.logger.debug(`[init] Processing channel ID: ${channelID}`);
			const channel = new Channel();
			await channel.initFromID(channelID);
			this.channels.push(channel);
		});
		await Promise.all(promises);
		this.logger.info(`[init] All channels processed`);
		this.logger.debug(`[init] Channels initialized: ${JSON.stringify(this.channels, null, 2)}`);


		let archivedChannels = [];
    	let activeChannels = [];

		this.channels.forEach(channel => {
			if (channel.archived) {
				archivedChannels.push(channel);
			} else {
				activeChannels.push(channel);
			}
		});
		this.logger.debug(`[init] Archived channels: ${JSON.stringify(archivedChannels, null, 2)}`);
		this.logger.debug(`[init] Active channels: ${JSON.stringify(activeChannels, null, 2)}`);

		// Sort archived channels by name
		archivedChannels.sort((a, b) => {
			return a.name.localeCompare(b.name);
		});
		// Sort active channels by name
		activeChannels.sort((a, b) => {
			return a.name.localeCompare(b.name);
		});
		// Merge the two arrays
		const ouputchannels = activeChannels.concat(archivedChannels);

		this.logger.debug(`[init] Sorted channels: ${JSON.stringify(ouputchannels, null, 2)}`);
		this.sortedChannels = ouputchannels;
		this.logger.info(`[init] Sorter initialized`);
		this.initialized = true;
		return true;
	}

	async sort() {
		this.logger.info(`[sort] Sorting channels...`);
		if (!this.initialized) {
			this.logger.error(`[sort] Sorter not initialized`);
			return false;
		}

		// Move channels to the correct position
		for (let i = 0; i < this.sortedChannels.length; i++) {
			const channel = this.sortedChannels[i];
			const position = i;
			this.logger.debug(`Checking channel ${channel.name} for channel position: ${channel.discordChannel.position} - position: ${position}`);

			if (channel.discordChannel.position === position) {
				continue;
			}
			await channel.discordChannel.setPosition(position);
			this.logger.debug(`Moving channel ${channel.name} to position ${position}`);

		}
		this.logger.info(`[sort] Channels sorted successfully`);
	}
}


export default Sorter;
export { Sorter };
