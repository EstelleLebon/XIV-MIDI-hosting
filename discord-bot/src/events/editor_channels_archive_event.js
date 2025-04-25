import { EventEmitter } from 'events';
import createLogger from '../classes/logger/logger.js';
import Archiver from '../classes/archive/archiver.js';
import Sorter from '../classes/archive/sorter.js';
import Channel from '../classes/archive/channel.js';
const logger = createLogger('Editor-Archive-Event');

class CustomEvent extends EventEmitter {}
const editorArchiveEvent = new CustomEvent();
const serverid = process.env.guildId;
const categoryb = process.env.categoryb;
const everyonepermID = process.env.everyonepermID;
const inactiveDays = 30;

/*
const inactivity = async (channel, guild) => {
	const channelID = channel.id;
	const channel0 = guild.channels.cache.get(channelID);
	const list = channel_list(channel0);
	let lastActivity = null;
	for (const channelID of list) {
		const channel = guild.channels.cache.get(channelID);
		const activity = await last_activity(channel);
		if (activity) {
			if (!lastActivity || activity > lastActivity) {
				lastActivity = activity;
			}
		}
	}
	// logger.debug(`Channel ${channelID} last activity: ${lastActivity}`);
	if (lastActivity) {
		const now = new Date();
		const diff = now - lastActivity;
		const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
		// logger.debug(`Channel ${channelID} has been inactive for ${diffDays} days`);
		if (diffDays > inactiveDays) {
			channel.warn = true;
			// logger.debug(`Archiving channel ${channelID} due to inactivity`);
		} else {
			channel.warn = false;
		}
	} else {
		const creationDate = new Date(channel0.createdTimestamp);
		const now = new Date();
		const diff = now - creationDate;
		const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
		// logger.debug(`Channel ${channelID} has been created for ${diffDays} days`);
		if (diffDays > inactiveDays) {
			channel.warn = true;
			// logger.debug(`Archiving channel ${channelID} due to being older than 180 days`);
		} else {
			channel.warn = false;
		}
	}
	logger.debug(`Channel ${channelID} warn status: ${channel.warn}`);
	return channel;
};

const last_activity = async (channel) => {
    if (!channel) {
        logger.error('Channel not found');
        return null;
    }
    if (typeof channel != 'object') {
        logger.error('Channel is not an object');
        return null;
    }

    let lastMessage = channel.lastMessage;

    // Si le dernier message n'est pas dans le cache, essayez de le récupérer à partir de l'API
    if (!lastMessage) {
        try {
            const messages = await channel.messages.fetch({ limit: 1 });
            lastMessage = messages.first();
        } catch (error) {
            logger.error(`Error fetching messages for channel ${channel.id}: ${error}`);
            return null;
        }
    }

    if (!lastMessage) {
        logger.debug('Channel has no last message');
        return null;
    }

    if (!lastMessage.createdTimestamp) {
        logger.debug('Channel last message has no timestamp');
        return null;
    }

    const lastActivity = lastMessage.createdTimestamp;
    logger.debug(`Returning last activity: ${lastActivity}`);
    return new Date(lastActivity);
};

const channel_list = (channel) => {
    if (!channel) {
        logger.error('Channel not found');
        return null;
    }
    if (typeof channel != 'object') {
        logger.error('Channel is not an object');
        return null;
    }
    let output = [];
    output.push(channel.id);
    if (channel.threads) {
        channel.threads.cache.forEach(thread => {
            output.push(thread.id);
        });
    }
    logger.debug(`Returning channels list: ${JSON.stringify(output)}`);
    return output;
}

const channel_map = (category) => {
    if (!category) {
        logger.error('Category ID not found');
        return null;
    }
    let output = [];
    category.children.cache.forEach(channel => {
        logger.debug(`Checking channel: ${channel.name}`);
        const data = {
            id: channel.id,
            url: `https://discord.com/channels/${serverid}/${channel.id}`,
            owners: [],
        };
        let owners = [];
        channel.permissionOverwrites.cache.forEach(overwrite => {
            logger.debug(`Checking overwrite: ${overwrite.id}`);
            if (overwrite.id !== everyonepermID) {
                owners.push(overwrite.id);
            }
        });
        data.owners = owners;
        output.push(data);
    });
    logger.debug(`Returning channels map: ${JSON.stringify(output, null, 2)}`);
    return output;
}

const contact = async (channel, client, D) => {
    if (!channel) {
        logger.error('Channel not found');
        return null;
    }
	logger.debug(`Channel: ${JSON.stringify(channel)}`);
    if (!client) {
        logger.error('Client not found');
        return null;
    }
    if (typeof channel != 'object') {
        logger.error('Channel is not an object');
        return null;
    }
    if (typeof client != 'object') {
        logger.error('Client is not an object');
        return null;
    }
    const owners = channel.owners;
    logger.debug(`Channel owners: ${JSON.stringify(owners)}`);
    const url = channel.url;
    logger.debug(`Channel URL: ${url}`);
	let message = '';
    switch (D) {
        case 0:
            message = `Hello! This is an automated message to inform you that your [channel](${url}) has been inactive for a while.\nIf you wish to keep it, please send a message within the next week in the channel to prevent it from being archived. Thank you!`;
            break;
        case 6:
            message = `Hello! This is an automated message to remind you that your [channel](${url}) has been inactive for a while.\nIf you wish to keep it, please send a message within the 24 next hours in the channel to prevent it from being archived. Thank you!`;
            break;
        case 7:
            message = `Hello! This is an automated message to inform you that your channel:${channel.id} has been archived due to inactivity.\nIf you wish to restore it, please contact an admin. Thank you!`;
            break;
	}
    if (owners != []) {
        for (const owner of owners) {
            logger.debug(`Sending message to owner ${owner}`);
            try {
                const user = await client.users.fetch(owner);
                if (!user) {
                    logger.warn(`User with ID ${owner} not found`);
                    continue;
                }
                logger.debug(`User found: ${user.tag}`);
                await user.send(message);
            } catch (error) {
                logger.error(`Error fetching user with ID ${owner}: ${error}`);
            }
        }
    }
};

const team_contact = async (client, D, inactiveChannels) => {
    if (!client) {
        logger.error('Client not found');
        return null;
    }
    if (typeof client != 'object') {
        logger.error('Client is not an object');
        return null;
    }
    const teamstr = process.env.team;
    const team = teamstr.split(',').map(id => id.trim());
    let message = `Hello! This is an automated message to inform you that the following channels `;
    switch (D) {
        case 0:
            message += `have been inactive for a while and are marked for archiving:\n`;
            break;
        case 7:
            message += `have been archived:\n`;
            break;
        default:
            break;
    }
    inactiveChannels.forEach((channel) => {
        message += `Channel: [${channel.id}](${channel.url}) - `;
        const owners = channel.owners;
        logger.debug(`Channel owners: ${JSON.stringify(channel.owners)}`);
        if (owners.length > 0) {
            message += `Owners: ${channel.owners.join(', ')}\n`;
        } else {
            message += 'NO OWNER\n';
        }
    });
    const messages = [];
    while (message.length > 2000) {
        let part = message.slice(0, 2000);
        const lastNewlineIndex = part.lastIndexOf('\n');
        if (lastNewlineIndex !== -1) {
            part = part.slice(0, lastNewlineIndex + 1);
        }
        messages.push(part);
        message = message.slice(part.length);
    }
    messages.push(message);

    for (const member of team) {
        logger.debug(`Sending message to team member ${member}`);
        try {
            const user = await client.users.fetch(String(member));
            if (!user) {
                logger.warn(`User with ID ${member} not found`);
                continue;
            }
            logger.debug(`User found: ${user.tag}`);
            for (const part of messages) {
                await user.send(part);
            }
        } catch (error) {
            logger.error(`Error fetching user with ID ${member}: ${error}`);
        }
    }
};

const channel_archive = async (channel, guild) => {
    if (!channel) {
        logger.error('Channel not found');
        return null;
    }
    if (typeof channel != 'object') {
        logger.error('Channel is not an object');
        return null;
    }
    const chan = await guild.channels.cache.get(channel.id);
    if (!chan) {
        logger.error(`Channel with ID ${channel.id} not found`);
        return null;
    }
    let name = chan.name;
    const add = "💤"
    name = name.replace('💤', '').replace('💤', '').replace('💤', '').replace('💤', '').replace('💤', '');
    logger.debug(name);
    await chan.setName(add + name);
    logger.info(`Channel ${chan.name} archived`);
    return chan;
}

const channel_unarchive = async (channel, guild) => {
    if (!channel) {
        logger.error('Channel not found');
        return null;
    }
    if (typeof channel != 'object') {
        logger.error('Channel is not an object');
        return null;
    }
    const chan = await guild.channels.cache.get(channel.id);
    if (!chan) {
        logger.error(`Channel with ID ${channel.id} not found`);
        return null;
    }
    let name = chan.name;
    name = name.replace('💤', '').replace('💤', '').replace('💤', '').replace('💤', '').replace('💤', '');
    logger.debug(name);
    await chan.setName(name);
    logger.info(`Channel ${chan.name} archived`);
}

const sort_channels = async (category) => {
    if (!category) {
        logger.error('Category ID not found');
        return null;
    }
    // Get the channels in the category
    let channels = Array.from(category.children.cache.values());
    // Sort channels in 2 category: includes 💤 or not
    let archivedChannels = [];
    let activeChannels = [];
    channels.forEach(channel => {
        if (channel.name.includes('💤')) {
            archivedChannels.push(channel);
        } else {
            activeChannels.push(channel);
        }
    });
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
    // Move channels to the correct position
    for (let i = 0; i < ouputchannels.length; i++) {
        const channel = ouputchannels[i];
        const position = i;
        logger.debug(`Checking channel ${channel.name} for channel position: ${channel.position} - position: ${position}`);

        if (channel.position === position) {
            continue;
        }
        await channel.setPosition(position);
        logger.debug(`Moving channel ${channel.name} to position ${position}`);

    }
}

let isEventRegistered = false;

if (!isEventRegistered) {
    editorArchiveEvent.on('editor_archive_event_D0', async () => {
        logger.info('editor_archive_event_D0 triggered');    

        // Import the client instance
        const { default: client } = await import('../bot.js'); // Ensure correct import

        const guild = client.guilds.cache.get(serverid);
        if (!guild) {
            logger.error(`Guild with ID ${serverid} not found`);
            return;
        }
        const category = guild.channels.cache.get(categoryb);
        const map = channel_map(category);
        const inactiveChannels = [];
        for (const channel of map) {
			const chan = await inactivity(channel, guild);
            logger.debug(`Channel ${chan.id} warn status: ${chan.warn}`);
            if (chan.warn) {
                logger.info(`Channel ${chan.id} is inactive`);
                await contact(chan, client, 0);
                inactiveChannels.push(chan);
            }
        }
        await team_contact(client, 0, inactiveChannels);
    });

	editorArchiveEvent.on('editor_archive_event_D6', async () => {
		logger.info('editor_archive_event_D6 triggered');    

        // Import the client instance
        const { default: client } = await import('../bot.js'); // Ensure correct import

        const guild = client.guilds.cache.get(serverid);
        if (!guild) {
            logger.error(`Guild with ID ${serverid} not found`);
            return;
        }
        const category = guild.channels.cache.get(categoryb);
        const map = channel_map(category);
        for (const channel of map) {
			const chan = await inactivity(channel, guild);
            logger.debug(`Channel ${chan.id} warn status: ${chan.warn}`);
            if (chan.warn) {
                logger.info(`Channel ${chan.id} is inactive`);
                await contact(chan, client, 6);
            }
        }        
    });

	editorArchiveEvent.on('editor_archive_event_D7', async () => {
		logger.info('editor_archive_event_D7 triggered');    

        // Import the client instance
        const { default: client } = await import('../bot.js'); // Ensure correct import

        const guild = client.guilds.cache.get(serverid);
        if (!guild) {
            logger.error(`Guild with ID ${serverid} not found`);
            return;
        }
        const category = guild.channels.cache.get(categoryb);
        const map = channel_map(category);
        const inactiveChannels = [];
        for (const channel of map) {
			const chan = await inactivity(channel, guild);
            // logger.debug(`Channel ${chan.id} warn status: ${chan.warn}`);
            if (chan.warn) {
                logger.info(`Channel ${chan.id} is inactive`);
                await contact(chan, client, 7);
                inactiveChannels.push(chan);
                await channel_archive(chan, guild);
            }
        }
        await sort_channels(category);
        await team_contact(client, 7, inactiveChannels);

    });

    editorArchiveEvent.on('editor_archive_event_U', async (data) => {
        logger.info('editor_archive_event_U triggered');    

        // Import the client instance
        const { default: client } = await import('../../bot.js'); // Ensure correct import

        // Get the guild
        const guild = client.guilds.cache.get(serverid);
        if (!guild) {
            logger.error(`Guild with ID ${serverid} not found`);
            return;
        }
        // Get the category
        const category = guild.channels.cache.get(categoryb);

        logger.debug(`Data received: ${JSON.stringify(data)}`);
        
        // Get the channel
        const channel = guild.channels.cache.get(data.channel_id);
        if (!channel) {
            logger.error(`Channel with ID ${data.channel_id} not found`);
            return;
        }

        // Get the owners
        let owners = [];
        channel.permissionOverwrites.cache.forEach(overwrite => {
            logger.debug(`Checking overwrite: ${overwrite.id}`);
            if (overwrite.id !== everyonepermID) {
                owners.push(overwrite.id);
            }
        });
        logger.debug(`Channel owners: ${JSON.stringify(owners)}`);
        // Check if the author is an owner
        if (owners != []) {
            if (owners.includes(data.author_id) || data.author_id == 'bot') {
                logger.info(`Channel ${data.channel_id} unarchived`);
                await channel_unarchive(channel, guild);
                sort_channels(category);
            }
        }
    });

    // Marquer l'événement comme enregistré
    isEventRegistered = true;
    logger.info('backup_event registered');
}
*/
let isEventRegistered = false;

if (!isEventRegistered) {
    editorArchiveEvent.on('editor_archive_event_D0', async () => {
        logger.info('editor_archive_event_D0 triggered');    
        const archiver = new Archiver();
        await archiver.worker(0);
    });

	editorArchiveEvent.on('editor_archive_event_D6', async () => {
		logger.info('editor_archive_event_D6 triggered');    
        const archiver = new Archiver();
        await archiver.worker(6);
    });

	editorArchiveEvent.on('editor_archive_event_D7', async () => {
		logger.info('editor_archive_event_D7 triggered');    
        const archiver = new Archiver();
        await archiver.worker(7);
        const sorter = new Sorter();
        await sorter.init();
        await sorter.sort();
        logger.info(`Channel has been archived and sorted`);
    });

    editorArchiveEvent.on('editor_archive_event_U', async (data) => {
        logger.info('editor_archive_event_U triggered');    

        const channel = new Channel();
        await channel.initFromID(data.channel_id);
        if (!channel) {
            logger.error(`Channel with ID ${data.channel_id} not found`);
            return;
        }
        logger.debug(`Channel owners: ${JSON.stringify(channel.owners)}`);
        // Check if the author is an owner
        if (channel.owners.length > 0 || data.author_id == 'bot') {
            if (channel.owners.includes(data.author_id) || data.author_id == 'bot') {
                logger.info(`Channel ${data.channel_id} unarchived`);
                await channel.unarchive();
                const sorter = new Sorter();
                await sorter.init();
                await sorter.sort();
                logger.info(`Channel ${data.channel_id} has been unarchived and sorted`);
            }
        }
    });

    // Marquer l'événement comme enregistré
    isEventRegistered = true;
    logger.info('backup_event registered');
}


export { editorArchiveEvent };
export default editorArchiveEvent;