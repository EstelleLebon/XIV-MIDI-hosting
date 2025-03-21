const midiParser = require('midi-file-parser');
const createLogger = require('../../../logger/logger');
const logger = createLogger('file_checks');

const checkMidi = async (buffer) => {
    try {
        const midiString = buffer.toString('binary');
        const midi = midiParser(midiString);
        if (midi && midi.header && midi.tracks) {
            logger.debug('MIDI file is valid.');
            return true;
        } else {
            logger.warn('MIDI file is invalid.');
            return false;
        }
    } catch (error) {
        logger.warn('Error parsing MIDI file:', error);
        return false;
    }
};
module.exports = checkMidi;