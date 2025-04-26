const log = '/usr/src/app/src/logs/Discord_Bot.log'; // Path to the log file
import fs from 'fs';
const startlog = async () => {
    console.log('Starting log management...');
    try {
        if (fs.existsSync(log)) {
            console.log('Log file exists, renaming...');
            const timestamp = new Date().toISOString().replace(/:/g, '-'); // Replace colons to make it filesystem-safe
            const oldlog = `/usr/src/app/src/logs/Discord_Bot_${timestamp}.log`;
            fs.renameSync(log, oldlog);
            console.log(`Log file renamed to ${oldlog}`);
        } else {
            console.log('Log file does not exist, creating new log file...');
            fs.writeFileSync(log, '', { flag: 'w' });
            console.log('New log file created.');
        }
    } catch (error) {
        console.error('Error during log management:', error);
    }
    console.log('Log management completed.');
}

export default startlog;