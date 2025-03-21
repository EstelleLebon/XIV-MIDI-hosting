import customEvent from '../../events/backup_event'; // Importer l'événement personnalisé de sauvegarde
import createLogger from '../../logger/logger'; // Importer la fonction de création de logger
import client from '../../bot'; // Importer le client Discord

const logger = createLogger('BackupEventTask'); // Créer un logger pour cet événement

logger.debug('Starting backup task...');

if (!client.isReady()) {
    await new Promise(resolve => client.once('ready', resolve));
}

// Déclencher l'événement de sauvegarde
try {
    customEvent.emit('backup_event', client);
    logger.info('Événement de sauvegarde déclenché automatiquement par PM2');
} catch (error) {
    logger.error(`Error triggering backup event: ${error}`);
}

logger.debug('Backup task completed.');