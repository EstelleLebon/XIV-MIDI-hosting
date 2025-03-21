const fs = require('fs').promises;
const prefix = '/usr/src/app/websites_files';

async function sendFileToRemote(localFilePath, remoteFilePath) {
    let tmpPath = remoteFilePath.slice(0, remoteFilePath.lastIndexOf('.'))
    let tmpPath2 = tmpPath;
    const extension = remoteFilePath.slice(remoteFilePath.lastIndexOf('.'));

    let check = false;
    let i=0;

    do {
        i ++;
        try {
            console.log('tmpPath:', tmpPath + extension);
            await fs.access(tmpPath + extension);
            console.log('Le fichier existe déjà.');
            tmpPath = tmpPath2 + ` - ${i}`;
        } catch (err) {
            console.log('Le fichier n\'existe pas encore');
            check = true;
        }
    } while (!check);


    let finalPath = tmpPath + extension;
    console.log('finalPath:', finalPath);

    try {
        await fs.writeFile(finalPath, localFilePath);
        console.log('Fichier écrit avec succès.');
    } catch (err) {
        console.error('Erreur lors de l\'écriture du fichier:', err);
    }
    finalPath = finalPath.slice(prefix.length); 
    finalPath = '/files' + finalPath;
    const website_file_path = finalPath;
    console.log('website_file_path:', website_file_path);
    return website_file_path;
}

module.exports = sendFileToRemote;