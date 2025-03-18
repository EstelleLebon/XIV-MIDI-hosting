const createLogger = require('../../../logger/logger');
const logger = createLogger('editor_channel_id');
const categoryId = process.env.categoryb;
const autodetect_channel_id = (interaction) => {
    logger.info('autodetect_channel_id called');
    const category = interaction.guild.channels.cache.get(categoryId);
    logger.debug(`Category: ${category}`);

    if (!category) {
        logger.error('Category not found');
        return null;
    }

    const userId = interaction.user.id;

    let foundChannel = null;

    category.children.cache.forEach(channel => {
        logger.debug(`Checking channel: ${channel.name}`);
        channel.permissionOverwrites.cache.forEach(overwrite => {
            logger.debug(`Checking overwrite: ${overwrite.id}`);
            if (overwrite.id === userId) {
                foundChannel = channel.id;
                logger.debug(`Found channel: ${channel.name} / ID: ${channel.id}`);
            }
        });
    });

    if (foundChannel) {
        logger.info(`Found channel: ${foundChannel}`);
        return foundChannel;
    } else {
        logger.info('No channel found for the user');
        return null;
    }
};

const editor_channel_id = (interaction) => {
    logger.info('editor_channel_id called');
    try {
        const channelId = autodetect_channel_id(interaction);
        if (channelId) {
            return channelId;
        } else {
            return null;
        }
    } catch (error) {
        logger.error(`Error in editor_channel_id: ${error}`);
        throw error;
    }
};

module.exports = editor_channel_id;