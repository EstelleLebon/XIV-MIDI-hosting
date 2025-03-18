const createLogger = require('../../logger/logger');
const logger = createLogger('JSONExport');
const path = require('path');
const fs = require('fs');

module.exports = function exportJSON(filePath, data) {
    filePath = path.resolve(__dirname, filePath);
    try {
        let jsonData = [];
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            if (fileContent) {
                jsonData = JSON.parse(fileContent);
            }
        }
        jsonData.push(data);
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
        // logger.verbose(`Successfully wrote to ${filePath}`);
    } catch (error) {
        logger.error(`Error writing to ${filePath}: ${error.message}`);
    }
};