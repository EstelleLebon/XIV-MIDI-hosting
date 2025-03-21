const fs = require('fs'); // Importer le module du système de fichiers
const createLogger = require('../../logger/logger'); // Importer une fonction personnalisée de création de logger
const logger = createLogger('BackupCleaner'); // Créer une instance de logger pour le BackupCleaner
const path = require('path'); // Importer le module de gestion des chemins d'accès

// Exporter la fonction cleanBackups
module.exports = function cleanBackups() {
    logger.info('Starting backup cleanup...');
    const directory = path.resolve(__dirname, `../backup/backup`) // Définir le répertoire à nettoyer
    const maxnumber = 12; // Définir le nombre maximum de fichiers à conserver
    const types = {
        "solo": [], "duo": [], "trio": [], "quartet": [], "quintet": [], "sextet": [], "septet": [], "octet": [], "pack": [], "editors": []
    }; // Définir les types de sauvegardes à nettoyer

    // Lire le contenu du répertoire
    fs.readdir(directory, (err, files) => {
        if (err) {
            // Logger un message d'erreur si la lecture du répertoire échoue
            logger.error(`Failed to read directory: ${err.message}`);
            return;
        }
        logger.info(`Found ${files.length} backup files.`);

        // Classer les fichiers dans les types appropriés
        for (const file of files) {
            if (file.includes('solo')) {
                types["solo"].push(file);
            } else if (file.includes('duo')) {
                types["duo"].push(file);
            } else if (file.includes('trio')) {
                types["trio"].push(file);
            } else if (file.includes('quartet')) {
                types["quartet"].push(file);
            } else if (file.includes('quintet')) {
                types["quintet"].push(file);
            } else if (file.includes('sextet')) {
                types["sextet"].push(file);
            } else if (file.includes('septet')) {
                types["septet"].push(file);
            } else if (file.includes('octet')) {
                types["octet"].push(file);
            } else if (file.includes('packs')) {
                types["packs"].push(file);
            } else if (file.includes('editors')) {
                types["editors"].push(file);
            }
        }
        Object.keys(types).forEach(type => {
            if (types[type].length > 0) {
            logger.info(`Found ${types[type].length} ${type} backup files.`);
            }
        });
        

        // Pour chaque type de sauvegarde, vérifier si le nombre de fichiers dépasse le maximum autorisé
        for (const backup_type in types) {
            const lenght = types[backup_type].length;
            logger.info(`Checking ${backup_type} backups - ${lenght} files found.`);
            if (lenght > maxnumber) {
                // Trier les fichiers par date de modification (mtimeMs)
                types[backup_type].sort((a, b) => a.stats.mtimeMs - b.stats.mtimeMs);
                // Sélectionner les fichiers à supprimer
                const filesToDelete = types[backup_type].slice(0, types[backup_type].length - maxnumber);
                logger.info(`Deleting ${filesToDelete.length} old ${backup_type} backup files...`);
                // Supprimer les fichiers sélectionnés
                filesToDelete.forEach(fileStat => {
                    fs.unlink(fileStat.filePath, err => {
                        if (err) {
                            logger.error(`Failed to delete file: ${err.message}`);
                        } else {
                            logger.info(`Deleted old backup file: ${fileStat.file}`);
                        }
                    });
                });
            }
        }
        logger.info('Backup cleanup complete.');        
    });
};