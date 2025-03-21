const log = './logs/Discord_Bot.log'
const fs = require('fs');
module.exports.startlog = async () => {
    if (fs.existsSync(log)) {
        const timestamp = new Date().toISOString();
        const oldlog = `./logs/Discord_Bot_${timestamp}.log`;
        fs.renameSync(log, oldlog);
    }
}
