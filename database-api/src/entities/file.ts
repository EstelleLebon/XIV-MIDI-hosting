// this represents a blueprint of your file structure in the app

export type Instrument =
	| 'Piano'
	| 'Harp'
	| 'Fiddle'
	| 'Lute'
	| 'Fife'
	| 'Flute'
	| 'Oboe'
	| 'Panpipes'
	| 'Clarinet'
	| 'Trumpet'
	| 'Saxophone'
	| 'Trombone'
	| 'Horn'
	| 'Tuba'
	| 'Violin'
	| 'Viola'
	| 'Cello'
	| 'DoubleBass'
	| 'ElectricGuitarOverdriven'
	| 'ElectricGuitarClean'
	| 'ElectricGuitarMuted'
	| 'ElectricGuitarPowerChords'
	| 'ElectricGuitarSpecial'
	| 'ElectricGuitar'
	| 'Program:ElectricGuitar'
	| 'BassDrum'
	| 'SnareDrum'
	| 'Cymbal'
	| 'Bongo'
	| 'Timpani'
	| 'Unknown';

export type Track = {
	order: number;
	name: string;
	instrument: Instrument;
	modifier: number;
};

export interface File {
	id: string;
	md5: string;
	editor_discord_id: string;
	editor: string;
	artist: string;
	title: string;
	performer: string;
	sources?: string;
	comments?: string;
	tags?: string[];
	song_duration: number;
	tracks: Track[];
	discord: boolean;
	website: boolean;
	editor_channel: boolean;
	discord_message_id?: string;
	discord_link?: string;
	website_file_path?: string;
	website_link?: string;
	editor_channel_id?: string;
	editor_channel_link?: string;
	createdAt: Date;
	updatedAt: Date;
}
