const path = require('path');
const createLogger = require('../../../logger/logger');
const logger = createLogger('Backup-DownloadMap');

const categoryb = process.env.categoryb;

const work = ["solo", "duo", "trio", "quartet", "quintet", "sextet", "septet", "octet", "pack"];
const channelFileMap = [];
const addedChannels = new Set();

async function get_download_map(guild) {
    logger.info('Creating download map');

    // Legacy channels
    for (let i = 0; i < work.length; i++) {
        const b = work[i] + 'b';
        const channelId = process.env[work[i]];
        if (!addedChannels.has(channelId)) {
            const push = {
                "type": "legacy",
                "channel_id": channelId,
                "channel_name": work[i],
                "backup_channel_id": process.env[b],
                "backup_channel_name": work[i],
                "download_path": path.resolve(__dirname, `../../workplace/downloads/${work[i]}`)
            };
            channelFileMap.push(push);
            addedChannels.add(channelId);
            // logger.debug(`Pushed to the download map:\n${JSON.stringify(push, null, 4)}\n`);
        }
    }

    // Editors Category
    if (categoryb) {
        const firstDayOfLastMonth = new Date(2000, 0, 1, 0, 0, 0, 0);
        const categoryChannel = guild.channels.cache.get(categoryb);
        if (categoryChannel) {
            categoryChannel.children.cache.forEach(async channel => {
                if (channel) {
                    const sanitizedChannelName = channel.name.substring(3).replace(/[^a-zA-Z0-9]/g, '_');
                    const channelId = channel.id;
                    if (!addedChannels.has(channelId)) {
                        const push = {
                            "type": "editor",
                            "channel_id": channelId,
                            "channel_name": sanitizedChannelName,
                            "backup_channel_id": process.env.editorb,
                            "backup_channel_name": "editors",
                            "download_path": path.resolve(__dirname, `../../workplace/downloads/Editors/${sanitizedChannelName}`)
                        };
                        channelFileMap.push(push);
                        addedChannels.add(channelId);
                        // logger.debug(`Pushed to the download map:\n${JSON.stringify(push, null, 4)}\n`);
                    }

                    // Threads
                    const threadsAc = await channel.threads.fetchActive();
                    const threadsAr = await channel.threads.fetchArchived();
                    const threads = { threads: [...threadsAc.threads.values(), ...threadsAr.threads.values()] };
                    const lastMonthThreads = threads.threads.filter(thread => {
                        const threadLastActivityDate = thread.lastMessage ? new Date(thread.lastMessage.createdTimestamp) : new Date(thread.createdAt);
                        return threadLastActivityDate >= firstDayOfLastMonth;
                    });

                    for (const thread of lastMonthThreads.values()) {
                        if (thread) {
                            const sanitizedThreadName = thread.name;
                            const threadId = thread.id;
                            if (!addedChannels.has(threadId)) {
                                const push = {
                                    "type": "thread",
                                    "channel_id": threadId,
                                    "channel_name": sanitizedThreadName,
                                    "backup_channel_id": process.env.editorb,
                                    "backup_channel_name": "editors",
                                    "download_path": path.resolve(__dirname, `../../workplace/downloads/Editors/${sanitizedChannelName}/${sanitizedThreadName}`)
                                };
                                channelFileMap.push(push);
                                addedChannels.add(threadId);
                                // logger.debug(`Pushed to the download map:\n${JSON.stringify(push, null, 4)}\n`);
                            }
                        } else {
                            logger.warn(`Thread not found in guild threads`);
                        }
                    }
                } else {
                    logger.warn(`Channel not found in guild channels`);
                }
            });
        } else {
            logger.warn(`categoryb channel not found in guild channels`);
        }
    } else {
        logger.warn('categoryb is not defined in process.env');
    }
    return channelFileMap; // Return the channelFileMap
}

module.exports = get_download_map; // Export the function