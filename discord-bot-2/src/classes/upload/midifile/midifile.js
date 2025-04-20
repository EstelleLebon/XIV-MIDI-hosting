import error from "../../error/error.js";
import createLogger from "../../logger/logger.js";
import midiFileParser from "midi-file-parser";

class MidiFile {
	constructor(buffer, error = null) {
		this.buffer = buffer;
		this.data = null;
		this.initialized = false;

		this.tracks = [];

		this.logger = createLogger('MidiFile-Class');

		this.error = error;
	}

	async init() {
		try {
			this.logger.debug(`[INIT] Initializing MidiFile class`);
			if (!this.error) {
				this.error = new error(this.logger);
				this.error.init();
				this.logger.debug(`[INIT] ErrorClass initialized`);
			}

			if (!this.buffer) {
				this.logger.error(`[INIT] Buffer is null`);
				this.error.addError(`[MIDIFILECLASS] [INIT] Buffer is null`);
				return // this.error;
			}
			this.logger.debug(`[INIT] Buffer is not null`);
			await this.parse(this.buffer);
			this.logger.debug(`[INIT] Parsed data`);
			this.initialized = true;
		} catch (error) {
			this.logger.error(`[INIT] Error initializing MidiFile class: ${error.message}`);
			this.error.addError(`[MIDIFILECLASS] [INIT] Error initializing MidiFile class: ${error.message}`);
		}
	}


	async parse(midiBuffer) {
		try {
			this.logger.debug(`[parse] Parsing midi file`);
			if (!midiBuffer || !(midiBuffer instanceof Buffer)) {
				this.logger.error(`[parse] Invalid midiBuffer: ${midiBuffer}`);
				this.error.addError(`[MIDIFILECLASS] [parse] Invalid midiBuffer: ${midiBuffer}`);
				return null;
			}
			const binaryString = midiBuffer.toString('binary');
			let parsedData;
			parsedData = midiFileParser(binaryString);
			if (parsedData) {
				this.data = parsedData;
				this.logger.debug(`[parse] Data parsed`);
				return this.data;
			} else {
				this.logger.error(`[parse] Parsed data is null or undefined`);
				this.error.addError(`[MIDIFILECLASS] [parse] Parsed data is null or undefined`);
				return null;
			}
		} catch (error) {
			this.logger.error(`[parse] Error parsing midi file: ${error.message}`);
			this.error.addError(`[MIDIFILECLASS] [parse] Error parsing midi file: ${error.message}`);
		}
	}

	async check_instrument(order, name, modifier, track) {
		try {
			this.logger.debug(`[check_instrument] Checking instrument for order: ${order}`);
			if (!track) {
				this.logger.error(`[check_instrument] Track not found`);
				// this.error.add_error(`Track not found`);
				return false;
			}
			const trackname = name;
			this.logger.debug(`[check_instrument] Track name: ${trackname}`);
			if (!trackname) {
				this.logger.error(`Track name is null`);
				// this.error.add_error(`Track name is null`);
				return false;
			}
			let instrument = 'Unknown';
			instrument = await this.instrument_from_name(trackname, modifier);
			if (!instrument) {
				instrument = await this.instrument_from_control_change(track);
				if (!instrument) {
					return 'Unknown';
				}
			}
			this.logger.debug(`[check_instrument] Instrument: ${instrument}`);
			return instrument;
		} catch (error) {
			this.logger.error(`[check_instrument] Error checking instrument: ${error.message}`);
			this.error.addError(`[MIDIFILECLASS] [check_instrument] Error checking instrument: ${error.message}`);
		}
	}

	async instrument_from_name(name, modifier) {
		try {
			let trackname = name;
			this.logger.debug(`Track name: ${trackname}`);
			this.logger.debug(`Modifier: ${modifier}`);
			const instruments = {
				'piano': 'Piano',
				'grandpiano': 'Piano',
				'accousticgrandpiano': 'Piano',
				'pianos': 'Piano',
				'grandpianos': 'Piano',
				'accousticgrandpianos': 'Piano',

				'harp': 'Harp',
				'orchestralharp': 'Harp',
				'harps': 'Harp',
				'orchestralharps': 'Harp',

				'fiddle': 'Fiddle',
				'pizzicatostring': 'Fiddle',
				'strings': 'Fiddle',
				'pizzicatostrings': 'Fiddle',

				'flute': 'Flute',
				'flutes': 'Flute',

				'lute': 'Lute',
				'guitar': 'Lute',
				'lutes': 'Lute',
				'guitars': 'Lute',

				'fife': 'Fife',        
				'piccolo': 'Fife',
				'ocarina': 'Fife',
				'piccolos': 'Fife',
				'ocarinas': 'Fife',
				'piccoloflute': 'Fife',

				'oboe': 'Oboe',
				'oboes': 'Oboe',

				'panpipes': 'Panpipes',
				'panflute': 'Panpipes',
				'panpipes': 'Panpipes',
				'panflutes': 'Panpipes',

				
				'clarinet': 'Clarinet',
				'clarinets': 'Clarinet',

				'trumpet': 'Trumpet',
				'humpet': 'Trumpet',
				'trumpets': 'Trumpet',
				'humpets': 'Trumpet',

				'saxophone': 'Saxophone',
				'sax': 'Saxophone',
				'altosaxophone': 'Saxophone',
				'altosax': 'Saxophone',
				'sexophone': 'Saxophone',
				'saxophones': 'Saxophone',
				'saxes': 'Saxophone',

				'trombone': 'Trombone',
				'trombones': 'Trombone',
				'tromboner': 'Trombone',
				'tromboners': 'Trombone',

				'horn': 'Horn',
				'horns': 'Horn',
				'frenchhorn': 'Horn',
				'frenchhorns': 'Horn',
				'horny': 'Horn',

				'tuba': 'Tuba',
				'tubas': 'Tuba',
				'booba': 'Tuba',

				'violin': 'Violin',
				'violins': 'Violin',

				'viola': 'Viola',
				'violas': 'Viola',

				'cello': 'Cello',
				'cellos': 'Cello',

				'doublebass': 'DoubleBass',
				'contrabass': 'DoubleBass',
				'bass': 'DoubleBass',

				'timpani': 'Timpani',
				'timpanis': 'Timpani',

				'bongo': 'Bongo',
				'bongos': 'Bongo',

				'bassdrum': 'BassDrum',
				'bassdrums': 'BassDrum',
				'kick': 'BassDrum',
				

				'snaredrum': 'SnareDrum',
				'snare': 'SnareDrum',
				'ricedrum': 'SnareDrum',
				'snaredrums': 'SnareDrum',

				'cymbal': 'Cymbal',
				'cymbals': 'Cymbal',

				'electricguitarclean': 'ElectricGuitarClean',
				'guitarclean': 'ElectricGuitarClean',
				'cleanguitar': 'ElectricGuitarClean',
				'clean': 'ElectricGuitarClean',

				'electricguitarmuted': 'ElectricGuitarMuted',
				'guitarmuted': 'ElectricGuitarMuted',
				'mutedguitar': 'ElectricGuitarMuted',
				'muted': 'ElectricGuitarMuted',

				'electricguitaroverdriven': 'ElectricGuitarOverdriven',
				'guitaroverdriven': 'ElectricGuitarOverdriven',
				'overdrivenguitar': 'ElectricGuitarOverdriven',
				'overdriven': 'ElectricGuitarOverdriven',

				'electricguitarpowerchords': 'ElectricGuitarPowerChords',
				'electricguitarpowerchord': 'ElectricGuitarPowerChords',
				'guitarpowerchords': 'ElectricGuitarPowerChords',
				'guitarpowerchord': 'ElectricGuitarPowerChords',
				'powerchordguitars': 'ElectricGuitarPowerChords',
				'powerchordguitar': 'ElectricGuitarPowerChords',
				'powerchords': 'ElectricGuitarPowerChords',
				'powerchord': 'ElectricGuitarPowerChords',

				'electricguitarspecial': 'ElectricGuitarSpecial',
				'guitarspecial': 'ElectricGuitarSpecial',
				'specialguitar': 'ElectricGuitarSpecial',
				'special': 'ElectricGuitarSpecial',

				'program:electricguitar': 'Program:ElectricGuitar',

				'programelectricguitar': 'Program:ElectricGuitar'
			};
			this.logger.debug(`Track name: ${trackname}`);

			// remove + or - and number from trackname
			trackname = trackname.replace(/([+-]\s?\d+)/, '');

			// remove special characters
			trackname = trackname.replace(/[^a-zA-Z0-9]/g, '');
			// remove numbers
			trackname = trackname.replace(/\d+/g, '');
			// remove spaces
			trackname = trackname.replace(/\s+/g, '');
			// lowercase
			trackname = trackname.toLowerCase();

			this.logger.debug(`Track name after sanitize: ${trackname}`);
			const instrument = instruments[trackname];
			if (!instrument) {
				return false;
			}
			this.logger.debug(`Instrument: ${instrument}`);
			return instrument;
		} catch (error) {
			this.logger.error(`[instrument_from_name] Error checking instrument from name: ${error.message}`);
			this.error.addError(`[MIDIFILECLASS] [instrument_from_name] Error checking instrument from name: ${error.message}`);
			return false;
		}
		return false;
	}

	async instrument_from_control_change(track) {
		try {
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
			for (const event of track) {
				if (event.type === 'channel' && event.subtype === 'controlChange') {
					this.logger.debug(`Control change: ${event.controlNumber}`);
					const program = programNumbers[Number(event.controlNumber)];
					if (program) {
						this.logger.debug(`Program: ${program}`);
						return program;
					} 
				}
			}
			return false;
		} catch (error) {
			this.logger.error(`[instrument_from_control_change] Error checking instrument from control change: ${error.message}`);
			this.error.addError(`[MIDIFILECLASS] [instrument_from_control_change] Error checking instrument from control change: ${error.message}`);
			return false;
		}
	}

	async check_track_modifier (name) {
		try {
			this.logger.debug(`Checking track modifier for name: ${name}`);
			const regex = /([+-]\s?\d+)/;
			const match = regex.exec(name);
			let modifier = null;
			if (match) {
				this.logger.debug(`Track modifier: ${match[1]}`);
				modifier = parseInt(match[1].replace(/\s/g, ''), 10);;
			} else {
				this.logger.debug(`Track modifier not found`);
				modifier = 0;
			}
			return modifier;
		} catch (error) {
			this.logger.error(`[check_track_modifier] Error checking track modifier: ${error.message}`);
			this.error.addError(`[MIDIFILECLASS] [check_track_modifier] Error checking track modifier: ${error.message}`);
			return false;
		}
	}

	async init_track_map() {
		if (!this.data) {
			this.logger.error(`Data is null`);
			this.error.addError(`[MIDIFILECLASS] [init_track_map] Data is null`);
			return null;
		}
		if (!this.data.tracks) {
			this.logger.error(`Tracks are null`);
			this.error.addError(`[MIDIFILECLASS] [init_track_map] Tracks are null`);
			return null;
		}
	
		// Utiliser Promise.all pour attendre toutes les promesses
		try {
			await Promise.all(
				this.data.tracks.map(async (track, i = 0) => {
					await this.init_check_track(track, i);
				})
			);

			// Reassign order to ensure it starts at 0 and increments without gaps
			this.tracks.forEach((track, index) => {
				track.order = index;
			});
			
			this.logger.debug(`All tracks have been processed`);
		} catch (error) {
			this.logger.error(`Error processing tracks: ${error.message}`);
			this.error.addError(`[MIDIFILECLASS] [init_track_map] Error processing tracks: ${error.message}`);
		}
	}

	async init_check_track(track, i) {
		if (!track) {
			this.logger.error(`Track is null`);
			return null;
		}
		if (!track.length) {
			this.logger.error(`Track is empty`);
			return null;
		}
		this.logger.debug(`Track length: ${track.length}`);
		if (track.length === 0) {
			this.logger.error(`Track is empty`);
			return null;
		}
		try {
			this.logger.debug(`Track is not empty`);

			const Track = {
				order: null,
				name: null,
				instrument: null,
				modifier: null
			}
			let namecheck = false;
			let notecheck = false;
			
			for (const event of track) {
				if (namecheck && notecheck) {
					break;
				}
				if (!namecheck) {
					if (event.type === 'meta' && event.subtype === 'trackName') {
						this.logger.debug(`Track name: ${event.text}`);
						Track.name = event.text;
						namecheck = true;
					}
				}
				if (!notecheck) {
					if (event.type === 'channel' && event.subtype === 'noteOn') {
						this.logger.debug(`Note on: ${event.noteNumber}`);
						notecheck = true;
					}
				}
			}
			if (namecheck && notecheck) {
				this.logger.debug(`Track has a note track & a name track`);
				
				Track.order = i;
				i++

				Track.modifier = await this.check_track_modifier(Track.name);
				this.logger.debug(`Track modifier: ${Track.modifier}`);

				Track.instrument = await this.check_instrument(Track.order, Track.name, Track.modifier, track);
				this.logger.debug(`Track instrument: ${Track.instrument}`);

				this.logger.debug(`Track: ${JSON.stringify(Track)}`);
				// add track to trackmap
				this.tracks.push(Track);
			}
		} catch (error) {
			this.logger.error(`Error checking track: ${error.message}`);
			this.error.addError(`[MIDIFILECLASS] [init_check_track] Error checking track: ${error.message}`);
		}

	}

	async duration_from_data() {
		if (!this.data) {
			this.logger.error(`[duration_from_data] Data is null`);
			return 0;
		}
		if (!this.data.header) {
			this.logger.error(`[duration_from_data] Header is null`);
			return 0;
		}
		if (!this.data.header.ticksPerBeat) {
			this.logger.error(`[duration_from_data] Ticks per beat is null`);
			return 0;
		}
		try {
			const ticksPerBeat = this.data.header.ticksPerBeat;
			this.logger.debug(`[duration_from_data] Ticks per beat: ${ticksPerBeat}`);
		
			let totalDuration = 0; // Durée totale en millisecondes
			let currentTempo = 500000; // Tempo par défaut : 120 BPM (500000 µs/beat)
			let lastTick = 0; // Dernier tick traité
		
			// Fusionner tous les événements des pistes en une seule liste triée par temps absolu
			const allEvents = [];
			for (const track of this.data.tracks) {
				let absoluteTime = 0;
				for (const event of track) {
					absoluteTime += event.deltaTime || 0;
					allEvents.push({ ...event, absoluteTime });
				}
			}
		
			// Trier les événements par temps absolu
			allEvents.sort((a, b) => a.absoluteTime - b.absoluteTime);
		
			// Parcourir les événements triés pour calculer la durée
			for (const event of allEvents) {
				const deltaTicks = event.absoluteTime - lastTick;
				lastTick = event.absoluteTime;
		
				// Ajouter la durée pour les ticks écoulés
				totalDuration += (deltaTicks / ticksPerBeat) * (currentTempo / 1000);
		
				// Si l'événement est un changement de tempo, mettre à jour le tempo
				if (event.type === 'meta' && event.subtype === 'setTempo') {
					currentTempo = event.microsecondsPerBeat;
					this.logger.debug(`[duration_from_data] Tempo change: ${currentTempo} µs/beat`);
				}
			}
		
			this.logger.debug(`[duration_from_data] Total duration: ${Math.round(totalDuration)} milliseconds`);
			return Math.round(totalDuration);
		} catch (error) {
			this.logger.error(`[duration_from_data] Error calculating duration: ${error.message}`);
			return 0;
		}
	}
}

export default MidiFile;