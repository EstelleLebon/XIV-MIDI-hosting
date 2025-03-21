const uploadMap = {
    "solo": process.env.solo,
    "duet": process.env.duo,
    "trio": process.env.trio,
    "quartet": process.env.quartet,
    "quintet": process.env.quintet,
    "sextet": process.env.sextet,
    "septet": process.env.septet,
    "octet": process.env.octet,
}

push_discord = async (file, midiCache, filename) => {
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

    const editor_discord_id = file.editor_discord_id;
    let message = `New ${performer} uploaded by <@${editor_discord_id}>!`;
    message += `\n**Artist:** ${artist}`;
    message += `\n**Title:** ${title}`;
    
    if (comments) {
        message += `\n**Comments:** ${comments}`;
    }

    if (sources) {
        message += `\n**Source:** ${sources}`;
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

    const channel_id = uploadMap[performer.toLowerCase()];
    const filename2 = filename + ".mid";
    const discord_message = await client.channels.cache.get(channel_id).send({ content: message, files: [{ attachment: midiCache, name: filename2 }] });
    file.discord_message_id = discord_message.id;
    file.link = discord_message.url;
    return file;
}

module.exports = push_discord;