const path = require('path');
const createLogger = require('../../../logger/logger');
const logger = createLogger('Backup-DownloadTool');

var work = {"solo" : false, "duo" : false, "trio" : false, "quartet" : false, "quintet" : false, "sextet" : false, "septet" : false, "octet" : false, "pack" : false, "editor" : false};


async function download_tool(channelFileMap) {
    const downloader = require('../downloader');
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    startDate.setMonth(startDate.getMonth());
    endDate.setDate(1);
    endDate.setHours(0, 0, 0, 0);

    
    const ZipMap = [];
    await Promise.all(channelFileMap.map(async (channel) => {
        var check = await downloader(startDate, endDate, channel.channel_id, channel.download_path);
        if (check === 'Attachments downloaded successfully.'){
            const backup_channel_id = channel.backup_channel_id;
            const backup_channel_name = channel.backup_channel_name;
            logger.info(`Attachments downloaded successfully from channel ${channel.channel_name} to ${channel.download_path}`);
            if (channel.type === "legacy"){
                const input = channel.download_path;
                const zip_pathfileI = path.resolve(__dirname, `../../output/incremental/${channel.backup_channel_name}_incremental.zip`);
                const zip_pathfileF = path.resolve(__dirname, `../../output/full/${channel.backup_channel_name}_full.zip`);
                try {
                    const push = {
                        "backup_channel_name": backup_channel_name,
                        "backup_channel_id": backup_channel_id,
                        "input": input,
                        "zip_pathfileI": zip_pathfileI,
                        "zip_pathfileF": zip_pathfileF
                    }
                    ZipMap.push(push);
                    work[channel.channel_name] = true;
                    // logger.debug(`Pushed to the ZIP map:\n${JSON.stringify(push, null, 4)}\n`);
                } catch (error) {   
                    logger.error(`Error pushing to ZipMap: ${error}`);
                } 
            } else if (channel.type === "editor"){
                if (!work["editor"]){
                    const input = path.resolve(__dirname, `../../workplace/downloads/Editors/`);
                    const zip_pathfileI = path.resolve(__dirname, `../../output/incremental/Editors_incremental.zip`);
                    const zip_pathfileF = path.resolve(__dirname, `../../output/full/Editors_full.zip`);
                    try {
                        const push = {
                            "backup_channel_name": backup_channel_name,
                            "backup_channel_id": backup_channel_id,
                            "input": input,
                            "zip_pathfileI": zip_pathfileI,
                            "zip_pathfileF": zip_pathfileF
                        }
                        ZipMap.push(push);
                        work[channel.channel_name] = true;
                        logger.debug(`Pushed to the ZIP map:\n${JSON.stringify(push, null, 4)}\n`);
                    } catch (error) {   
                        logger.error(`Error pushing to ZipMap: ${error}`);
                    } 
                }
            }
        }
    }));
    return ZipMap;
}

module.exports = download_tool; // Export the function