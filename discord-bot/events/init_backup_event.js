const EventEmitter = require('events');
const createLogger = require('../logger/logger');
const logger = createLogger('BackupEventINIT');
class CustomEvent extends EventEmitter {}
const customEvent2 = new CustomEvent();
const downloadMap = require('../backup/modules/event/Download_Map_Init');
const download_tool = require('../backup/modules/event/Init_download');
const zip = require('../backup/modules/event/3_ZIP');
const Output_Map = require('../backup/modules/event/4_Output_Map');
const MoveFiles = require('../backup/modules/event/5_Move');
const Clear = require('../backup/modules/event/7_Clear');

let isEvent2Registered = false;

if (!isEvent2Registered) {
    customEvent2.on('backup_event_init', async () => {
        logger.info('backup_event_init triggered');    
        
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
        await Clear(OutputMap);
    
        // Réinitialiser les variables locales
        channelFileMap = [];
        ZipMap = [];
        OutputMap = [];
    
        logger.info('Backup process completed');
    });

    // Marquer l'événement comme enregistré
    isEvent2Registered = true;
    logger.info('backup_event_init registered');
}

module.exports = customEvent2;