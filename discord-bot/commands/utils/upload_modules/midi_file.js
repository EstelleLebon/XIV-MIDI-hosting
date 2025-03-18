const createLogger = require('../../../logger/logger');
const logger = createLogger('midi_file');
const midiParser = require('midi-file-parser');

const instrument_check = (trackname, track) => {
    const lowerTrackname = trackname.toLowerCase().replace(/\s/g, '');

    const instruments = {
        'piano': 'Piano',
        'harp': 'Harp',
        'fiddle': 'Fiddle',
        'flute': 'Flute',
        'lute': 'Lute',
        'fife': 'Fife',        
        'oboe': 'Oboe',
        'panpipes': 'Panpipes',
        'clarinet': 'Clarinet',
        'trumpet': 'Trumpet',
        'saxophone': 'Saxophone',
        'sax': 'Saxophone',
        'trombone': 'Trombone',
        'horn': 'Horn',
        'tuba': 'Tuba',
        'violin': 'Violin',
        'viola': 'Viola',
        'cello': 'Cello',
        'doublebass': 'DoubleBass',
        'contrabass': 'DoubleBass',
        'timpani': 'Timpani',
        'bongo': 'Bongo',
        'bassdrum': 'BassDrum',
        'snaredrum': 'SnareDrum',
        'snare': 'SnareDrum',
        'cymbal': 'Cymbal',
        'electricguitarclean': 'ElectricGuitarClean',
        'electricguitarmuted': 'ElectricGuitarMuted',
        'electricguitaroverdriven': 'ElectricGuitarOverdriven',
        'electricguitarpowerchords': 'ElectricGuitarPowerChords',
        'electricguitarspecial': 'ElectricGuitarSpecial',
        'program:electricguitar': 'Program:ElectricGuitar',
        'programelectricguitar': 'Program:ElectricGuitar'
    };

    for (const [key, value] of Object.entries(instruments)) {
        if (lowerTrackname == key) {
            return value;
        }
    }

    if (!track.length) return 'Unknown';

    for (let i = 0; i < track.length; i++) {
        if (track[i].type === 'channel' && track[i].subtype === 'programChange') {
            const programNumbers = {
                1: 'Piano',
                47: 'Harp',
                26: 'Fiddle',
                46: 'Lute',
                73: 'Fife',
                74: 'Flute',
                69: 'Oboe',
                76: 'Panpipes',
                72: 'Clarinet',
                57: 'Trumpet',
                66: 'Saxophone',
                58: 'Trombone',
                61: 'Horn',
                59: 'Tuba',
                41: 'Violin',
                42: 'Viola',
                43: 'Cello',
                44: 'Contrabass',
                48: 'Timpani',
                97: 'Bongo',
                98: 'Bassdrum',
                99: 'Snaredrum',
                100: 'Cymbal',
                28: 'ElectricGuitarClean',
                29: 'ElectricGuitarMuted',
                30: 'ElectricGuitarOverdriven',
                31: 'ElectricGuitarPowerChords',
                32: 'ElectricGuitarSpecial'
            };

            if (programNumbers[track[i].programNumber]) {
                return programNumbers[track[i].programNumber];
            }
        }
    }

    return 'Unknown';
}

const midi_file = (midiBuffer) => {
    let file = [];
    logger.debug('Checking MIDI buffer');
    try {
        const binaryString = midiBuffer.toString('binary');
        const midi = midiParser(binaryString);
        if (midi) {
            let t = 0;
            let trackname = '';
            logger.debug('MIDI buffer is valid.');
            if (midi.tracks) {
                logger.debug('MIDI buffer has tracks.');
                for (let i = 0; i < midi.tracks.length; i++) {
                    if (midi.tracks[i] && midi.tracks[i].length > 0) {
                        logger.debug(`Track ${i} has ${midi.tracks[i].length} events.`);
                        for (let j = 0; j < midi.tracks[i].length; j++) {
                            logger.debug(`Event ${j}: ${midi.tracks[i][j].type}`);
                            if (midi.tracks[i][j].type === 'meta' && midi.tracks[i][j].subtype === 'trackName') {
                                logger.debug(`Track name: ${midi.tracks[i][j].text}`);
                                trackname = midi.tracks[i][j].text;
                            }
                            if (midi.tracks[i][j].type === 'channel' && midi.tracks[i][j].subtype === 'noteOn') {
                                logger.debug(`Track ${i} has note events.`);
                                if (trackname !== '') {
                                    let modifier = 0;
                                    const regex = /([+-]\s?\d+)/;
                                    const match = regex.exec(trackname);
                                    if (match) {
                                        modifier = parseInt(match[1].replace(/\s/g, ''), 10);
                                    }
                                    logger.debug(`Track name: ${trackname}`);
                                    logger.debug(`Modifier: ${modifier}`);

                                    let instrument = '';
                                    instrument = instrument_check(trackname, midi.tracks[i]);

                                    const tmpfile = {
                                        order: t,
                                        name: trackname,
                                        instrument: instrument,
                                        modifier: modifier
                                    };
                                    file.push(tmpfile);
                                    t++;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        logger.warn(`Error parsing MIDI buffer: ${error}`);
    }
    logger.debug(`MIDI file: ${JSON.stringify(file, null, 2)}`);
    return file;
}

exports.midi_file = midi_file;
