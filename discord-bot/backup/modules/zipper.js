const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const createLogger = require('../../logger/logger');
const logger = createLogger('Zipper');

/**
 * Creates or updates a zip archive from the specified input directory.
 *
 * @param {string} inputDir - The directory to zip.
 * @param {string} outputFilePath - The path where the zip file will be saved.
 * @returns {Promise<void>} A promise that resolves when the zip file is created or updated successfully.
 * @throws {Error} If the input directory or output file path is not provided.
 * @throws {Error} If the input directory does not exist.
 */
async function zipper(inputDir, outputFilePath) {
    if (!inputDir || !outputFilePath) {
        const errorMsg = 'Input directory and output file path must be provided.';
        logger.error(errorMsg);
        throw new Error(errorMsg);
    }

    if (!fs.existsSync(inputDir)) {
        const errorMsg = `Input directory ${inputDir} does not exist.`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
    }

    if (fs.existsSync(outputFilePath)) {
        logger.debug(`Output file already exists: ${outputFilePath}`);
        var zip = new AdmZip(outputFilePath);
        logger.info(`Updating ZIP file: ${outputFilePath}`);
    } else {
        logger.info(`Creating ZIP file: ${outputFilePath}`);
        var zip = new AdmZip();
    }

    async function addFilesToZip(dir, baseDir = '') {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.join(baseDir, entry.name);
            if (entry.isDirectory()) {
                await addFilesToZip(fullPath, relativePath);
            } else if (entry.isFile()) {
                // Remove the existing file from the archive if it exists
                const existingEntry = zip.getEntry(relativePath);
                if (existingEntry) {
                    zip.deleteFile(relativePath);
                }
                zip.addLocalFile(fullPath, baseDir);
            }
        }
    }

    logger.info(`Zipping files from ${inputDir} to ${outputFilePath}`);
    await addFilesToZip(inputDir);
    zip.writeZip(outputFilePath);
    logger.info(`ZIP file created or updated: ${outputFilePath}`);
}

module.exports = zipper;