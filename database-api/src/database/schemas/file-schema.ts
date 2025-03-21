import { Track } from '@/entities/file';
import { model, Schema, Document } from 'mongoose';

const instruments = [
	'Piano',
	'Harp',
	'Fiddle',
	'Lute',
	'Fife',
	'Flute',
	'Oboe',
	'Panpipes',
	'Clarinet',
	'Trumpet',
	'Saxophone',
	'Trombone',
	'Horn',
	'Tuba',
	'Violin',
	'Viola',
	'Cello',
	'DoubleBass',
	'ElectricGuitarOverdriven',
	'ElectricGuitarClean',
	'ElectricGuitarMuted',
	'ElectricGuitarPowerChords',
	'ElectricGuitarSpecial',
	'Program:ElectricGuitar',
	'BassDrum',
	'SnareDrum',
	'Cymbal',
	'Bongo',
	'Timpani',
	'Unknown',
];

// this represents a blueprint of your file structure in the mongo database
export interface FileDocument extends Document {
	_id: string;
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

const TrackSchema = new Schema<Track>(
	{
		order: {
			type: Number,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		instrument: {
			type: String,
			enum: instruments,
			required: true,
		},
		modifier: {
			type: Number,
			required: true,
		},
	},
	{ versionKey: false, _id: false, timestamps: false },
);

const FileSchema = new Schema<FileDocument>(
	{
		md5: {
			type: String,
			required: true,
			unique: true,
		},
		editor_discord_id: {
			type: String,
			required: true,
		},
		editor: {
			type: String,
			required: true,
		},
		artist: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		performer: {
			type: String,
			required: true,
		},
		sources: {
			type: String,
			required: false,
		},
		comments: {
			type: String,
			required: false,
		},
		tags: {
			type: [String],
		},
		song_duration: {
			type: Number,
			required: true,
		},
		tracks: {
			type: [TrackSchema],
			required: true,
		},
		discord: {
			type: Boolean,
			required: true,
		},
		website: {
			type: Boolean,
			required: true,
		},
		editor_channel: {
			type: Boolean,
			required: true,
		},
		discord_message_id: {
			type: String,
			required: false,
		},
		discord_link: {
			type: String,
			required: false,
		},
		website_file_path: {
			type: String,
			required: false,
		},
		website_link: {
			type: String,
			required: false,
		},
		editor_channel_id: {
			type: String,
			required: false,
		},
		editor_channel_link: {
			type: String,
			required: false,
		},
	},
	{ timestamps: true, versionKey: false, collection: '_dev_files' },
);

const FileModel = model<FileDocument>('files', FileSchema);

export { FileModel };
