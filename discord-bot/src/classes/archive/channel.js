import createLogger from '../logger/logger.js'; // Import the logger utility

const everyonepermID = process.env.everyonepermID; // ID for the @everyone role

class Channel {
    
    constructor() {

		this.id = '';
        this.name = '';
		this.url = '';
        this.owners = [];
		this.parentid = '';
		this.archived = null;
		this.lastActivity = null;
		

		this.discordChannel = null;

		this.client = null; // Discord client instance
		this.logger = createLogger('Channel');
		this.logger.info(`[constructor()] Channel class initialized`);
    }

	async initFromID(ID) {
		this.logger.info(`[initFromID] Initializing channel from ID...`);
		this.logger.debug(`[initFromID] Channel ID: ${ID}`);

		this.client = await import('../../bot.js'); // Discord client instance
		this.client = this.client.default || this.client; // Get the default export or the module itself
		this.logger.debug(`[initFromID] Client initialized: ${this.client.user.tag}`);

		this.discordChannel = this.client.channels.cache.get(ID);
		if (!this.discordChannel) {
			this.logger.error(`[initFromID] Channel not found`);
			return false;
		}
		this.name = this.discordChannel.name;
		this.id = this.discordChannel.id;
		this.parentid = this.discordChannel.parentId;
		this.url = this.discordChannel.url;
		this.archived = this.isArchived();
		await this.initOwners();
		this.lastActivity = await this.initLastActivity();
		this.logger.debug(`[initFromID] Channel initialized: ${JSON.stringify(this.toJSON(), null, 2)}`);
		return true;
	}


	isArchived() {
		this.logger.debug(`[isArchived] Checking if channel is archived...`);
		if (this.discordChannel) {
			this.archived = this.discordChannel.name.includes('💤');
			this.logger.debug(`[isArchived] Channel is archived: ${this.archived}`);
			return this.archived;
		}
		this.logger.error(`[isArchived] Channel not initialized`);
		return false;
	}

	async initLastActivity() {
		this.logger.info(`[initLastActivity] Initializing last activity...`);
		if (!this.discordChannel) {
			this.logger.error(`[initLastActivity] Channel not found`);
			return false;
		}


		let lastMessage = this.discordChannel.lastMessage;

		// Si le dernier message n'est pas dans le cache, essayez de le récupérer à partir de l'API
		if (!lastMessage) {
			try {
				const messages = await this.discordChannel.messages.fetch({ limit: 1 });
				lastMessage = messages.first();
			} catch (error) {
				this.logger.error(`Error fetching messages for channel ${this.discordChannel.id}: ${error}`);
				// return old date
				this.lastActivity = new Date('1990-01-01T00:00:00Z');
				return this.lastActivity; // return old date
			}
		}

		if (!lastMessage) {
			this.logger.debug('Channel has no last message');
			// return old date
			this.lastActivity = new Date('1990-01-01T00:00:00Z');
			return this.lastActivity; // return old date
		}

		if (!lastMessage.createdTimestamp) {
			this.logger.debug('Channel last message has no timestamp');
			// return old date
			this.lastActivity = new Date('1990-01-01T00:00:00Z');
			return this.lastActivity; // return old date
		}

		const lastActivity = lastMessage.createdTimestamp;
		this.logger.debug(`Returning last activity: ${lastActivity}`);
		this.lastActivity = new Date(lastActivity);
		return this.lastActivity; // return last activity as Date object
	}

	async initOwners() {
		this.logger.info(`[initOwners] Initializing channel owners...`);
		this.logger.debug(`[initOwners] Channel ID: ${this.id}`);
		
		this.discordChannel.permissionOverwrites.cache.forEach(overwrite => {
            this.logger.debug(`Checking overwrite: ${overwrite.id}`);
            if (overwrite.id !== everyonepermID) {
                this.owners.push(overwrite.id);
            }
        });
		this.logger.info(`[initOwners] Owners initialized: ${JSON.stringify(this.owners, null, 2)}`);
	}


	async archive() {
		this.logger.info(`[archive] Archiving channel...`);
		

		if (!this.discordChannel) {
			this.logger.error(`[archive] Channel not initialized`);
			return false;
		}

		if (this.archived) {
			this.logger.error(`[archive] Channel is already archived`);
			return false;
		}

		this.logger.debug(`[archive] Channel ID: ${this.id}`);

		this.logger.debug(`[archive] Channel name before archiving: ${this.name}`);
		
		this.logger.debug(`[archive] Check : ${this.name.includes('💤')}`);

		if (this.name.includes('💤')) {
			this.logger.error(`[archive] Channel name already includes '💤'`);
			this.archived = true;
			this.logger.info(`[archive] Channel archiving process ended`);
			return false;
		} else {
			this.name = `💤${this.name}`;
			this.logger.debug(`[archive] Setting channel name to: ${this.name}`);
			await this.discordChannel.setName(`${this.name}`);
			this.logger.debug(`[archive] Channel name after archiving: ${this.name}`);
			this.archived = true;
			this.logger.info(`[archive] Channel archived`);
			return true;
		}	
	}

	async unarchive() {
		this.logger.info(`[unarchive] Unarchiving channel...`);
		

		if (!this.discordChannel) {
			this.logger.error(`[unarchive] Channel not initialized`);
			return false;
		}

		if (!this.archived) {
			this.logger.error(`[unarchive] Channel is not archived`);
			return false;
		}

		this.logger.debug(`[unarchive] Channel ID: ${this.id}`);

		this.logger.debug(`[unarchive] Channel name before unarchiving: ${this.name}`);
		
		if (this.name.includes('💤')) {
			this.name = this.name.replace('💤', '');
			await this.discordChannel.setName(`${this.name}`);
			this.logger.debug(`[unarchive] Channel name after unarchiving: ${this.name}`);
			this.archived = false;
			this.logger.info(`[unarchive] Channel unarchived`);
			return true;
		} else {
			this.logger.error(`[unarchive] Channel name does not include '💤'`);
			this.archived = false;
			this.logger.info(`[unarchive] Channel unarchiving process ended`);
			return false;
		}
	}


	async contact(D) {
		this.logger.info(`[contact] Contacting channel owners...`);
		

		if (!this.discordChannel) {
			this.logger.error('Channel not initialized');
			return null;
		}

		let message = '';
		switch (D) {
			case 0:
				message = `Hello! This is an automated message to inform you that your [channel](${this.url}) has been inactive for a while.\nIf you wish to keep it, please send a message in your channel within the next week to prevent it from being archived.\nThank you!`;
				break;
			case 6:
				message = `Hello! This is an automated message to remind you that your [channel](${this.url}) has been inactive for a while.\nIf you wish to keep it, please send a message in your channel within the next 24 hours to prevent it from being archived.\nThank you!`;
				break;
			case 7:
				message = `Hello! This is an automated message to inform you that your [channel](${this.url}) has been archived due to inactivity.\nIf you wish to restore it, please send a message in your channel or through bot upload command.\nThank you!`;
				break;
		}
		this.logger.debug(`[contact] Message: ${message}`);
		this.logger.debug(`[contact] Owners: ${this.owners}`);
		if (this.owners.length > 0) {
			for (const owner of this.owners) {
				this.logger.debug(`Sending message to owner ${owner}`);
				try {
					const user = await this.client.users.fetch(owner);
					if (!user) {
						this.logger.warn(`User with ID ${owner} not found`);
						continue;
					}
					this.logger.debug(`User found: ${user.tag}`);
					await user.send(message);
				} catch (error) {
					this.logger.error(`Error fetching user with ID ${owner}: ${error}`);
					continue;
				}
			}
		}
	}


	toJSON() {
		return {
			id: this.id,
			name: this.name,
			owners: this.owners,
			parentid: this.parentid,
			archived: this.archived
		};
	}
}

export default Channel;
export { Channel };
