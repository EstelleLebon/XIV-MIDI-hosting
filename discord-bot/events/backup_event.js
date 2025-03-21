const EventEmitter = require('events');
const createLogger = require('../logger/logger');
const logger = createLogger('BackupEvent');
class CustomEvent extends EventEmitter {}
const customEvent = new CustomEvent();
const downloadMap = require('../backup/modules/event/1_Download_Map');
const download_tool = require('../backup/modules/event/2_Download');
const zip = require('../backup/modules/event/3_ZIP');
const Output_Map = require('../backup/modules/event/4_Output_Map');
const MoveFiles = require('../backup/modules/event/5_Move');
const PostFiles = require('../backup/modules/event/6_Post');
const Clear = require('../backup/modules/event/7_Clear');

let isEventRegistered = false;

if (!isEventRegistered) {
    customEvent.on('backup_event', async () => {
        logger.info('backup_event triggered');    
        
        // Wait for the client to be ready
        const client = require('../bot'); // Importer le client ici pour éviter les dépendances circulaires
        if (!client.isReady) {
            await new Promise(resolve => client.once('ready', resolve));
        }
    
        const guild = client.guilds.cache.get(process.env.guildId);
        if (!guild) {
            logger.error(`Guild with ID ${process.env.guildId} not found`);
            return;
        }
    
        // Utiliser des variables locales pour éviter les conflits entre les appels
        let channelFileMap = [];
        let ZipMap = [];
        let OutputMap = [];
        
        channelFileMap = await downloadMap(guild);
        ZipMap = await download_tool(channelFileMap);
        let editorsFound = false;
        ZipMap = ZipMap.filter(item => {
            if (item.backup_channel_name === "editors") {
                if (editorsFound) {
                    return false;
                } else {
                    editorsFound = true;
                    return true;
                }
            }
            return true;
        });
        await zip(ZipMap);
        OutputMap = await Output_Map(ZipMap);
        await MoveFiles(OutputMap);
        await PostFiles(OutputMap, guild);
        await Clear(OutputMap);
    
        // Réinitialiser les variables locales
        channelFileMap = [];
        ZipMap = [];
        OutputMap = [];
    
        logger.info('Backup process completed');
    });

    // Marquer l'événement comme enregistré
    isEventRegistered = true;
    logger.info('backup_event registered');
}

module.exports = customEvent;