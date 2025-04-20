const log = './logs/Discord_Bot.log'
import fs from 'fs';
const startlog = async () => {
    if (fs.existsSync(log)) {
        const timestamp = new Date().toISOString();
        const oldlog = `./logs/Discord_Bot_${timestamp}.log`;
        fs.renameSync(log, oldlog);
    }
}

export default startlog;