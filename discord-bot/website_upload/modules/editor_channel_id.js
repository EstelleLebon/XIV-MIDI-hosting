const createLogger = require('../../logger/logger');
const { get_user, update_user } = require('../../utils/user_db_tools');
const logger = createLogger('editor_channel_id_web');
const categoryId = process.env.categoryb;


const autodetect_channel_id = (userId) => {
    logger.info('autodetect_channel_id called');
    const category = interaction.guild.channels.cache.get(categoryId);
    logger.debug(`Category: ${category}`);

    if (!category) {
        logger.error('Category not found');
        return null;
    }
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

const editor_channel_id = (userId) => {
    logger.info('editor_channel_id called');
    try {
        const channelId = autodetect_channel_id(userId);
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

const checkEditorChannel = async (editor_channel, editor_discord_id) => {
    logger.info('checkEditorChannel called');
    if (editor_channel === true) {
        logger.debug('editor_channel is true');
        await get_user(editor_discord_id)
        .then( async (user) => {
            if (user) {
                if (user.editor_channel_id) {
                    logger.debug('User has editor_channel_id');
                    return user.editor_channel_id;
                } else {
                    logger.debug('User does not have editor_channel_id');
                    const channel_id = editor_channel_id(editor_discord_id);
                    if (channel_id) {
                        logger.debug(`Channel ID: ${channel_id}`);
                        user.editor_channel_id = channel_id;
                        await update_user(user)
                        return channel_id;
                    } else {
                        return null;
                    }
                }
            } else {
                return null;
            }
        });
    } else {
        return true;
    }
};

module.exports = checkEditorChannel;