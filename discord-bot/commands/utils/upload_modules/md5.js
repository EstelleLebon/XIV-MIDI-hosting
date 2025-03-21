const { getfilteredfiles } = require("../../../utils/file_db_tools");
const createLogger = require('../../../logger/logger');
const logger = createLogger('md5_check');

const md5_check = async (md5) => {
    return new Promise((resolve, reject) => {
        const filter = { md5: md5 };
        logger.debug(`Applying filter: ${JSON.stringify(filter)}`);
        getfilteredfiles(filter).then((response) => {
            logger.debug(`Files returned: ${JSON.stringify(response)}`);
            const files = response.files;
            if (files && files.length > 0) {
                resolve(files[0]); // Assuming you want the first file that matches the MD5
            } else {
                resolve("File not found");
            }
        }).catch((error) => {
            logger.error(`Error in md5_check: ${error}`);
            reject(error);
        });
    });
}

const handle_md5_result = async (md5, md5status) => {
    logger.debug(`Checking md5: ${md5}`);
    try {
        const check = await md5_check(md5); 
        logger.debug(`Check result: ${JSON.stringify(check)}`);
        if (check !== "File not found") {
            if (check.website && check.editor_channel && check.discord) {
                md5status.globalstatus = false;
                md5status.discordstatus = false;
                md5status.websitestatus = false;
                md5status.editorchannelstatus = false;
                md5status.newfile = false;
            }
            if (!check.discord){
                md5status.discordstatus = true;
            } else {
                md5status.discordstatus = false;
                md5status.newfile = false;
            }
            if (!check.website){
                md5status.websitestatus = true;
            } else {
                md5status.websitestatus = false;
                md5status.newfile = false;
            }
            if (!check.editor_channel){
                md5status.editorchannelstatus = true;
            } else {
                md5status.editorchannelstatus = false;
                md5status.newfile = false;
            }       
            return md5status;
        } else {
            logger.info(`MD5 ${md5} not found in the database.`);
            md5status.globalstatus = true;
            return md5status;
        }
    } catch (error) {
        logger.error(`Error in handle_md5_result: ${error}`);
        throw error;
    }
}

module.exports = { md5_check, handle_md5_result };