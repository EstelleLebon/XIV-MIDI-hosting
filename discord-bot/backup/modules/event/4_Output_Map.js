const createLogger = require('../../../logger/logger');
const logger = createLogger('Backup-OutputMap');
const path = require('path');

async function Output_Map(ZipMap){
    function getformattedDate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.toLocaleString('en-US', { month: 'long' });
        return `${year}-${month}`;
    };
    const formattedDate = getformattedDate();
    const OutputMap = [];
    for (const channel of ZipMap) {
        const output = path.resolve(__dirname, `../../backup/${formattedDate}_${channel.backup_channel_name}_full.zip`);
        const send_I = path.resolve(__dirname, `../../workplace/to_send/incremental/${formattedDate}_${channel.backup_channel_name}_incremental.zip`);
        const send_F = path.resolve(__dirname, `../../workplace/to_send/full/${formattedDate}_${channel.backup_channel_name}_full.zip`);
        const clear_path = channel.input;
        try {
            if (!(OutputMap.some(item => item.backup_channel_id === channel.backup_channel_id))) {
                const push = {
                    "backup_channel_id": channel.backup_channel_id,
                    "backup_channel_name": channel.backup_channel_name,
                    "zip_pathfileI": channel.zip_pathfileI,
                    "zip_pathfileF": channel.zip_pathfileF,
                    "output": output,
                    "send_I": send_I,
                    "send_F": send_F,
                    "clear_path": clear_path
                }
                OutputMap.push(push);
            }
            // logger.debug(`Pushed to the Output map:\n${JSON.stringify(push, null, 4)}\n`);
        } catch (error) {
            logger.error(`Error pushing to OutputMap: ${error}`);
        }
    }
    return OutputMap;
}

module.exports = Output_Map;