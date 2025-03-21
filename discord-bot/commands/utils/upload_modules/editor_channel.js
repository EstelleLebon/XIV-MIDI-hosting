const createLogger = require('../../../logger/logger');
const logger = createLogger('editor_channel_push');

const push_editor_channel = async (file, midiCache, filename) => {
    const client = require('../../../bot');
    const artist = file.artist;
    const title = file.title;
    const performer = file.performer;
    let sources = file.sources;
    if (sources === " ") {
        sources = null;
    }
    let comments = file.comments;
    if (comments === " ") {
        comments = null;
    }

    let message = `New ${performer} uploaded!`;
    message += `\n**Artist:** ${artist}`;
    message += `\n**Title:** ${title}`;
    
    if (comments) {
        message += `\n**Comments:** ${comments}`;
    }

    if (sources) {
        message += `\n**Sources:** ${sources}`;
    }
    if (file.tracks) {
        let i = 0;
        let tmp = [];
        file.tracks.forEach(track => {
            if (track.instrument != "Unknown") {
                i++;
                tmp.push('T' + i + ': ' + track.instrument);
            }
        });        
        if (i > 0) {
            message += `\n**Instruments:** ${tmp.join(' - ')}`;
        }
    }
    const channel_id = file.editor_channel_id
    const filename2 = filename + ".mid";
    logger.debug(`Uploading to editor channel: ${channel_id}`);
    const discord_message = await client.channels.cache.get(channel_id).send({ content: message, files: [{ attachment: midiCache, name: filename2 }] });
    file.link = discord_message.url;
    return file;
}

module.exports = push_editor_channel;