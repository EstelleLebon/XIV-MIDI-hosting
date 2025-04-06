import axios from "axios";
import crypto from "crypto";
import fs from "node:fs/promises";
import path from "path";
const discordbdd = process.env.discordbdd;
import createLogger from "../logger/logger.js";
// import error from "../error/error.js";
import MidiFile from "../midifile/midifile.js";

class File {
	constructor(interaction, stream = null) {
		this.interaction = interaction; // Clone the interaction object
		this.stream = stream;
		this.logger = createLogger('File-Class');

		this.filename = null;
		this.md5 = null;
		this.editor_discord_id = interaction.user.id;
		this.editor = null;
		this.artist = null;
		this.title = null;
		this.performer = null;
		this.sources = null;
		this.comments = null;
		this.tags = null;
		this.song_duration = null;
		this.tracks = null;
		this.discord = null;
		this.website = null;
		this.editor_channel = null;
		this.discord_message_id = null;
		this.discord_link = null;
		this.website_file_path = null;
		this.website_link = null;
		this.editor_channel_id = null;
		this.editor_channel_link = null;

		this.existfile = false;
		this.pushes = { discord: 0, website: 0, editor: 0, };
		this.initialized = false;
		this.buffer = null;
		this.filename = null;
		this.midifile = null;
		this.discordpushed = false;
		this.websitepushed = false;
		this.websitefilepushed = false;
		this.editor_channel_pushed = false;
		this.databasepushed = false;
		this.pushed = false;
	}

	async init() {
		// Init error stream
		// this.error = new error(this.interaction, this.logger, this.stream);
		this.logger.info(`[INIT] Initializing file class`);

		// Init buffer
		const buffer = await this.init_buffer();
		if (!buffer) {
			this.logger.error(`[INIT] Buffer is null`);
			// this.error.add_error(`Buffer is null`);
		}

		// Init md5 hash
		const md5 = await this.init_md5();
		if (!md5) {
			this.logger.error(`[INIT] MD5 is null`);
			// this.error.add_error(`MD5 is null`);
		}

		// Check if file already exists in database
		const tmpfiledata = await this.get_files({ md5: this.md5 });
		const tmpfile = tmpfiledata[0];
		this.logger.debug(`[INIT] File: ${JSON.stringify(tmpfile)}`);
		if (tmpfile) {
			// Get file from database
			this.logger.info(`[INIT] File already exists`);
			this.existfile = true;
			await this.get_file_and_init({ md5: this.md5 });
		} else {
			// Get file from interaction
			this.logger.info(`[INIT] File does not exist`);
			this.existfile = false;
			await this.init_from_interaction();
		}

		// Init MidiFile object
		this.logger.debug(`[INIT] Initializing MidiFile class`);
		this.midifile = new MidiFile(this.buffer, this.stream);
		await this.midifile.init();
		await this.midifile.init_track_map();

		// Get tracks
		this.logger.debug(`[INIT] Getting tracks`);
		this.tracks = this.midifile.tracks;
		this.logger.debug(`[INIT] Tracks: ${JSON.stringify(this.tracks)}`);

		// Get song duration
		this.logger.debug(`[INIT] Getting song duration`);
		this.song_duration = await this.midifile.duration_from_data();
		this.logger.debug(`[INIT] Song duration: ${this.song_duration}`);

		// Get pushes
		this.logger.debug(`[INIT] Getting pushes`);
		this.pushes = await this.init_pushes();
		this.logger.debug(`[INIT] Pushes: ${JSON.stringify(this.pushes)}`);

		// Get final pushes
		this.logger.debug(`[INIT] Getting final pushes`);
		this.pushes = await this.init_final_pushes();
		this.logger.debug(`[INIT] Final pushes: ${JSON.stringify(this.pushes)}`);

		// Get filename
		this.logger.debug(`[INIT] Getting filename`);
		this.filename = await this.init_filename();
		this.logger.debug(`[INIT] Filename: ${this.filename}`);
	
		// DONE
		this.logger.debug(`[INIT] File initialized`);
		this.initialized = true;

	}

	async init_from_interaction() {
		this.logger.info(`[init_from_interaction] Initializing file from interaction`);
		if (!this.interaction) {
			this.logger.error(`[init_from_interaction] Interaction is null`);
			// this.error.add_error(`Interaction is null`);
		}
		if (!this.interaction.options) {
			this.logger.error(`[init_from_interaction] Options are null`);
			// this.error.add_error(`Options are null`);
		}
		if (!this.interaction.user) {
			this.logger.error(`[init_from_interaction] User is null`);
			// this.error.add_error(`User is null`);
		}
		if (!this.interaction.user.id) {
			this.logger.error(`[init_from_interaction] User id is null`);
			// this.error.add_error(`User id is null`);
		}
		this.editor_discord_id = this.interaction.user.id;

		
		if (!this.interaction.user.tag) {
			this.logger.error(`[init_from_interaction] User tag is null`);
			// this.error.add_error(`User tag is null`);
		}

		const editor_discord_id = this.interaction.user.id;
		if (!editor_discord_id) {
			this.logger.error(`[init_from_interaction] Editor discord id is null`);
			// this.error.add_error(`Editor discord id is null`);
		}

		
		const artist = await this.init_artist();
		if (!artist) {
			this.logger.error(`[init_from_interaction] Artist is null`);
			// this.error.add_error(`Artist is null`);
		}

		const title = await this.init_title();
		if (!title) {
			this.logger.error(`[init_from_interaction] Title is null`);
			// this.error.add_error(`Title is null`);
		}

		const performer = await this.init_performer();
		if (!performer) {
			this.logger.error(`[init_from_interaction] Performer is null`);
			// this.error.add_error(`Performer is null`);
		}

		const sources = await this.init_sources();
		if (!sources) {
			this.logger.error(`[init_from_interaction] Sources are null`);
			// this.error.add_error(`Sources are null`);
		}

		const comments = await this.init_comments();
		if (!comments) {
			this.logger.error(`[init_from_interaction] Comments are null`);
			// this.error.add_error(`Comments are null`);
		}

		const tags = await this.init_tags();
		if (tags === null || tags === undefined) {
			this.logger.debug(`[init_from_interaction] Tags are null`);
			// this.error.add_error(`Tags are null`);
		}
	}

	async sanitize(string) {
		if (!string) {
			this.logger.error(`[sanitize] String is null`);
			return null;
		}
		if (!typeof string === 'string') {
			this.logger.error(`[sanitize] String is not a string`);
			return null;
		}		
		return string.replace(/_/g, ' ').replace(/[^a-zA-Z0-9 \-]/g, '');
	}

	async init_buffer() {
		if (!this.interaction) {
			this.logger.error(`[init_buffer] Interaction is null`);
			return null;
		}
		if (!this.interaction.options) {
			this.logger.error(`[init_buffer] Options are null`);
			return null;
		}
		this.logger.debug(`[init_buffer] Getting buffer from interaction`);
		var midi = null;
		try {
			midi = this.interaction.options.getAttachment('midi');
		} catch (error) {
			this.logger.error(`[init_buffer] Error getting midi from interaction: ${error}`);
			return null;
		}
		if (!midi) {
			this.logger.error(`[init_buffer] Midi is null`);
			return null;
		}
		if (!midi.url) {
			this.logger.error(`[init_buffer] Midi url is null`);
			return null;
		}
		this.logger.info(`[init_buffer] Getting buffer from ${midi.url}`);
        const response = await fetch(midi.url);
        const midiBuffer = await response.arrayBuffer();
        const midiCache = Buffer.from(midiBuffer);
		this.buffer = midiCache;
		if (!this.buffer) {
			this.logger.error(`[init_buffer] Buffer is null`);
			return null;
		}
		this.logger.debug(`[init_buffer] Buffer size: ${this.buffer.length}`);
		return this.buffer;
	}

	async init_md5() {
		if (!this.buffer) {
			this.logger.error(`[init_md5] Buffer is null`);
			return null;
		}
		this.logger.info(`[init_md5] Getting md5 from buffer`);
		const hash = crypto.createHash('md5');
		hash.update(this.buffer);
		this.md5 = hash.digest('hex');
		this.logger.debug(`[init_md5] MD5: ${this.md5}`);
		return this.md5;
	}

	async init_artist() {
		if (!this.interaction) {
			this.logger.error(`[init_artist] Interaction is null`);
			return null;
		}
		if (!this.interaction.options) {
			this.logger.error(`[init_artist] Options are null`);
			return null;
		}
		this.logger.debug(`[init_artist] Getting artist from interaction`);
		const artist = this.interaction.options.getString('artist');
		if (!artist) {
			this.logger.error(`[init_artist] Artist is null`);
			return null;
		}
		this.artist = await this.sanitize(artist);
		this.logger.debug(`[init_artist] Artist: ${this.artist}`);
		return this.artist;
	}

	async init_title() {
		if (!this.interaction) {
			this.logger.error(`[init_title] Interaction is null`);
			return null;
		}
		if (!this.interaction.options) {
			this.logger.error(`[init_title] Options are null`);
			return null;
		}
		this.logger.debug(`[init_title] Getting title from interaction`);
		const title = this.interaction.options.getString('title');
		if (!title) {
			this.logger.error(`[init_title] Title is null`);
			return null;
		}
		this.title = await this.sanitize(title);
		this.logger.debug(`[init_title] Title: ${this.title}`);
		return this.title;
	}

	async init_performer() {
		if (!this.interaction) {
			this.logger.error(`[init_performer] Interaction is null`);
			return null;
		}
		if (!this.interaction.options) {
			this.logger.error(`[init_performer] Options are null`);
			return null;
		}
		this.logger.debug(`[init_performer] Getting performer from interaction`);
		const performer = this.interaction.options.getString('band-size');
		if (!performer) {
			this.logger.error(`[init_performer] Performer is null`);
			return null;
		}
		this.performer = performer;
		this.logger.debug(`[init_performer] Performer: ${this.performer}`);
		return this.performer;
	}

	async init_sources() {
		if (!this.interaction) {
			this.logger.error(`[init_sources] Interaction is null`);
			return null;
		}
		if (!this.interaction.options) {
			this.logger.error(`[init_sources] Options are null`);
			return null;
		}
		this.logger.debug(`[init_sources] Getting sources from interaction`);
		const sources = await this.interaction.options.getString('source');
		if (!sources) {
			this.logger.debug(`[init_sources] Sources are null`);
			this.sources = " ";
			return this.sources;
		}
		if (typeof sources !== 'string') {
			this.logger.error(`[init_sources] Sources is not a string: ${typeof sources}`);
			return null;
		}
		this.sources = sources;
		this.logger.debug(`[init_sources] Sources: ${this.sources}`);
		return this.sources;
	}

	async init_comments() {
		if (!this.interaction) {
			this.logger.error(`[init_comments] Interaction is null`);
			return null;
		}
		if (!this.interaction.options) {
			this.logger.error(`[init_comments] Options are null`);
			return null;
		}
		this.logger.debug(`[init_comments] Getting comments from interaction`);
		const comments = this.interaction.options.getString('comment');
		if (!comments) {
			this.logger.debug(`[init_comments] Comments are null`);
			this.comments = " ";
			return this.comments;
		}
		this.comments = comments;
		this.logger.debug(`[init_comments] Comments: ${this.comments}`);
		return this.comments;
	}

	async init_tags() {
		return [];
		if (!this.interaction) {
			this.logger.error(`[init_tags] Interaction is null`);
			return null;
		}
		if (!this.interaction.options) {
			this.logger.error(`[init_tags] Options are null`);
			return null;
		}
		this.logger.debug(`[init_tags] Getting tags from interaction`);
		const tags = this.interaction.options.getString('tags');
		if (!tags) {
			this.logger.debug(`[init_tags] Tags are null`);
			this.tags = [];
			return this.tags;
		}
		this.tags = tags.split(',').map(tag => tag.trim());
		this.tags = this.tags.filter(tag => tag !== '');
		this.tags = this.tags.map(tag => tag.toLowerCase());
		this.logger.debug(`[init_tags] Tags: ${this.tags}`);
		return this.tags;
	}

	async init_pushes() {
		const pushes = { discord: 0, website: 0, editor: 0, };
		if (this.existfile) {
			this.logger.debug(`[init_pushes] File already exists`);
			if (this.discord) {
				this.discord = true
				this.pushes.discord = -1
				pushes.discord = -1
			} else {
				this.pushes.discord = 2
				pushes.discord = 2
			}
			if (this.website) {
				this.website = true
				this.pushes.website = -1
				pushes.website = -1
			} else {
				this.pushes.website = 2
				pushes.website = 2
			}
			if (this.editor_channel) {
				this.editor_channel = true
				this.pushes.editor = -1
				pushes.editor = -1
			} else {
				this.pushes.editor = 2
				pushes.editor = 2
			}
		} else {
			this.pushes.discord = 1
			pushes.discord = 1
			this.pushes.website = 1
			pushes.website = 1
			this.pushes.editor = 1
			pushes.editor = 1
		}
		this.logger.debug(`[init_pushes] Pushes: ${JSON.stringify(pushes)}`);
		return this.pushes;
	}

	async init_final_pushes() {
		if (this.interaction) {
			this.logger.debug(`[init_final_pushes] Getting pushes from interaction`);
			const pushes = this.interaction.options.getString('push-options');
			if (!pushes) {
				this.logger.debug(`[init_final_pushes] Pushes are null`);
				this.pushes.website = -3;
				this.pushes.editor = -3;
				this.discord = true;
				return this.pushes;
			}

			this.logger.debug(`[init_final_pushes] Pushes: ${pushes}`);
			if (! pushes.includes('discord')) {
				this.pushes.discord = -2;
			} else {
				this.discord = true;
			}
			if (! pushes.includes('website')) {
				this.pushes.website = -2;
			} else {
				this.website = true;
			}
			if (! pushes.includes('editor channel')) {
				this.pushes.editor = -2;
			} else {
				this.editor_channel = true;
			}
			return this.pushes;
		}
	}

	async init_filename() {
		const filename = `${await this.sanitize(this.artist)} - ${await this.sanitize(this.title)} - ${await this.sanitize(this.performer)} - ${await this.sanitize(this.editor)}.mid`;
		this.filename = filename;
		this.logger.debug(`[init_filename] Filename: ${this.filename}`);
		return this.filename;
	}

	async push(preview) {
		this.logger.info(`[push] Pushing file`);

		if (this.discord) {
			await this.push_discord(preview);
		}

		if (this.website) {
			await this.push_website(preview);
		}

		if (this.editor_channel) {
			await this.push_editor_channel(preview);
		}

		await this.push_database(preview);

		this.pushed = true;
		return this.pushed;
	}

	async push_discord(preview) {
		this.logger.info(`[push_discord] Pushing file to discord`);
		const uploadMap = {
			"solo": process.env.solo,
			"duet": process.env.duo,
			"trio": process.env.trio,
			"quartet": process.env.quartet,
			"quintet": process.env.quintet,
			"sextet": process.env.sextet,
			"septet": process.env.septet,
			"octet": process.env.octet,
		}
		this.logger.debug(`[push_discord] Upload map: ${JSON.stringify(uploadMap)}`);
		this.logger.debug(`[push_discord] Performer: ${this.performer.toLowerCase()}`);

		const client = await import('../../bot.js');
		this.logger.debug(`[push_discord] Client: ${client ? 'Loaded' : 'Not loaded'}`);

		const channelID = uploadMap[this.performer.toLowerCase()];
		this.logger.debug(`[push_discord] Channel ID: ${channelID}`);

		let duration = "";
		this.logger.debug(`File duration: ${this.song_duration}`);
		if (this.song_duration) {
			const minutes = String(Math.floor(Number(this.song_duration) / 60));
			const seconds = String(Number(Math.floor(this.song_duration)) % 60);
			duration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
		} else {
			duration = "0:00";
		}
		this.logger.debug(`Duration: ${duration}`);

		let channel = null;
		try {
			channel = await client.default.channels.fetch(channelID);
			this.logger.debug(`[push_discord] Channel: ${channel.id}`);
		} catch (error) {
			this.logger.error(`[push_discord] Error getting channel: ${error}`);
		}

		let message = `New ${this.performer} uploaded by ${this.editor}:`;
		message += `\n**Artist:** ${this.artist}`;
		message += `\n**Title:** ${this.title}`;
		if (this.sources != null && this.sources != undefined && this.sources != '' && this.sources != ' ') {
			message += `\n**Sources:** ${this.sources}`;
		}
		if (this.comments != null && this.comments != undefined && this.comments != '' && this.comments != ' ') {
			message += `\n**Comments:** ${this.comments}`;
		}
		if (this.tags != null && this.tags != undefined && this.tags.length > 0) {
			message += `\n**Tags:** ${this.tags.join(', ')}`;
		}
		message += `\n**Duration:** ${duration}`;
		if (this.tracks != null && this.tracks != undefined && this.tracks.length > 0) {
			const tpm = [];
			let i = 1;
			this.tracks.forEach((track) => {
				tpm.push(`T${i}: ${track.instrument}`);
				i++;
			});
			message += `\n**Instruments:** ${tpm.join(' - ')}`;
		}
		this.logger.debug(`[push_discord] Message: ${message}`);
		const messagesent = await channel.send({ content: message, files: [{ attachment: this.buffer, name: this.filename }] });
		this.discord_message_id = messagesent.id;
		this.discord_link = messagesent.url;

		await preview.embed.updateEmbedField('Discord Push:', `[link](${this.discord_link})`);
		await preview.updatePreview();

		this.discordpushed = true;
		this.discord = true;
	}

	async push_website(preview) {
		switch (this.performer.toLowerCase()) {
			case "solo":
				this.website_file_path = `/files/1_solos/${this.filename}`;
				break;
			case "duet":
				this.website_file_path = `/files/2_duets/${this.filename}`;
				break;
			case "trio":
				this.website_file_path = `/files/3_trios/${this.filename}`;
				break;
			case "quartet":
				this.website_file_path = `/files/4_quartets/${this.filename}`;
				break;
			case "quintet":
				this.website_file_path = `/files/5_quintets/${this.filename}`;
				break;
			case "sextet":
				this.website_file_path = `/files/6_sextets/${this.filename}`;
				break;
			case "septet":
				this.website_file_path = `/files/7_septets/${this.filename}`;
				break;
			case "octet":
				this.website_file_path = `/files/8_octets/${this.filename}`;
				break;
			default:
				throw new Error(`Unknown performer type: ${this.performer}`);
				break;
		}
		this.logger.debug(`[push_website] File path: ${this.website_file_path}`);

		this.website_link = `/file/${this.md5}`;
		this.logger.debug(`[push_website] File link: ${this.website_link}`);

		this.logger.debug(`[push_website] Pushing file to website`);
		await this.push_website_file();

		const website_url = process.env.websiteurl;
		this.logger.debug(`[push_website] Website URL: ${website_url}`);
		const link = website_url.slice(0, -1) + this.website_link;
		this.logger.debug(`[push_website] Link: ${link}`);

		await preview.embed.updateEmbedField('Website Push:', `[link](${link})`);
		await preview.updatePreview();

		this.websitepushed = true;
		this.website = true;
		this.logger.debug(`[push_website] File pushed to website`);
	}

	async push_website_file() {
		const prefix = '/usr/src/app/src/websites_files';
		let sendpath = "";
		this.logger.debug(`[push_website_file] Prefix: ${prefix}`);
		this.logger.debug(`[push_website_file] Filename: ${this.filename}`);
		this.logger.debug(`[push_website_file] Performer: ${this.performer.toLowerCase()}`);
		let perfo = null
		
		switch (this.performer.toLowerCase()) {
			case "solo":
				sendpath = `${prefix}/1_solos/${this.filename}`;
				perfo = "/1_solos";
				break;
			case "duet":
				sendpath = `${prefix}/2_duets/${this.filename}`;
				perfo = "/2_duets";
				break;
			case "trio":
				sendpath = `${prefix}/3_trios/${this.filename}`;
				perfo = "/3_trios";
				break;
			case "quartet":
				sendpath = `${prefix}/4_quartets/${this.filename}`;
				perfo = "/4_quartets";
				break;
			case "quintet":
				sendpath = `${prefix}/5_quintets/${this.filename}`;
				perfo = "/5_quintets";
				break;
			case "sextet":
				sendpath = `${prefix}/6_sextets/${this.filename}`;
				perfo = "/6_sextets";
				break;
			case "septet":
				sendpath = `${prefix}/7_septets/${this.filename}`;
				perfo = "/7_septets";
				break;
			case "octet":
				sendpath = `${prefix}/8_octets/${this.filename}`;
				perfo = "/8_octets";
				break;
			default:
				throw new Error(`Unknown performer type: ${this.performer}`);
				break;
		}
		this.logger.debug(`[push_website_file] Sendpath: ${sendpath}`);

		let tmpPath = sendpath.slice(0, sendpath.lastIndexOf('.'))
		let tmpPath2 = tmpPath;
		const extension = sendpath.slice(sendpath.lastIndexOf('.'));

		this.logger.debug(`[push_website_file] tmpPath: ${tmpPath}`);
		this.logger.debug(`[push_website_file] tmpPath2: ${tmpPath2}`);
		this.logger.debug(`[push_website_file] Extension: ${extension}`);

		let check = false;
		let i=0;

		do {
			i ++;
			try {
				this.logger.debug(`[push_website_file] tmpPath: ${tmpPath + extension}`);
				await fs.access(tmpPath + extension);
				this.logger.debug('[push_website_file] File exists, trying again');
				tmpPath = tmpPath2 + ` - ${i}`;
			} catch (err) {
				this.logger.debug('[push_website_file] File does not exist, continuing');
				check = true;
			}
		} while (!check);


		const finalPath = tmpPath + extension;
		this.logger.debug(`[push_website_file] Final path: ${finalPath}`);
		const remove = prefix + perfo;
		this.logger.debug(`[push_website_file] Remove: ${remove}`);
		this.website_file_path = finalPath.replace(remove, '');
		this.logger.debug(`[push_website_file] Website file path: ${this.website_file_path}`);

		const directory = path.dirname(finalPath);
		try {
			await fs.mkdir(directory, { recursive: true });
			this.logger.debug(`[push_website_file] Directory created or already exists: ${directory}`);
		} catch (err) {
			this.logger.error(`[push_website_file] Error creating directory: ${err}`);
		}


		try {
			await fs.writeFile(finalPath, this.buffer);
			this.logger.debug('[push_website_file] File written successfully');
		} catch (err) {
			this.logger.error(`[push_website_file] Error writing file: ${err}`);
		}
	}

	async push_editor_channel(preview) {
		const client = await import('../../bot.js');
		const channel = await client.default.channels.fetch(this.editor_channel_id);

		let message = `New ${this.performer} uploaded:`;
		message += `\n**Artist:** ${this.artist}`;
		message += `\n**Title:** ${this.title}`;
		if (this.sources != null && this.sources != undefined && this.sources != '' && this.sources != ' ') {
			message += `\n**Sources:** ${this.sources}`;
		}
		if (this.comments != null && this.comments != undefined && this.comments != '' && this.comments != ' ') {
			message += `\n**Comments:** ${this.comments}`;
		}
		if (this.tags != null && this.tags != undefined && this.tags.length > 0) {
			message += `\n**Tags:** ${this.tags.join(', ')}`;
		}
		message += `\n**Duration:** ${this.song_duration}`;
		if (this.tracks != null && this.tracks != undefined && this.tracks.length > 0) {
			const tpm = [];
			let i = 1;
			this.tracks.forEach((track) => {
				tpm.push(`T${i}: ${track.instrument}`);
				i++;
			});
			message += `\n**Instruments:** ${tpm.join(' - ')}`;
		}

		const messagesent = await channel.send({ content: message, files: [{ attachment: this.buffer, name: this.filename }] });
		this.editor_channel_link = messagesent.url;

		await preview.embed.updateEmbedField('Editor Channel Push:', `[link](${this.discord_link})`);
		await preview.updatePreview();

		this.editor_channel_pushed = true;
		this.editor_channel = true;
	}

	async push_database() {
		this.logger.debug(`[push_database] Pushing file to database`);
		const data = {
			md5: this.md5,
			editor_discord_id: this.editor_discord_id,
			editor: this.editor,
			artist: this.artist,
			title: this.title,
			performer: this.performer,
			sources: this.sources,
			comments: this.comments,
			tags: this.tags ? this.tags : [],
			song_duration: this.song_duration,
			tracks: this.tracks.map(track => ({
				order: Number(track.order),
				name: track.name,
				instrument: track.instrument,
				modifier: Number(track.modifier),
			})),
			discord: this.discord,
			website: this.website,
			editor_channel: this.editor_channel,
			discord_message_id: this.discord_message_id,
			discord_link: this.discord_link,
			website_file_path: this.website_file_path,
			website_link: this.website_link,
			editor_channel_id: this.editor_channel_id,
			editor_channel_link: this.editor_channel_link,
		};
		this.logger.debug(`[push_database] Data: ${JSON.stringify(data, null, 2)}`);
		if (this.existfile) {
			this.logger.debug(`[push_database] File already exists, updating`);
			const response = await axios.put(`${discordbdd}/files`, data)
				.catch((error) => {
					this.logger.error(`[push_database] Error pushing file to database: ${error}`);
					return null;
				});
			this.logger.debug(`[push_database] Response: ${response}`);
			if (!response.data) {
				this.logger.error(`[push_database] Error pushing file to database: ${response}`);
				return null;
			}
			this.databasepushed = true;
			this.logger.debug(`[push_database] File pushed to database`);

		} else {
			this.logger.debug(`[push_database] File does not exist, creating`);
		
			const response = await axios.post(`${discordbdd}/files`, data)
				.catch((error) => {
					this.logger.error(`[push_database] Error pushing file to database: ${error}`);
					return null;
				});
			this.logger.debug(`[push_database] Response: ${response}`);
			if (!response.data) {
				this.logger.error(`[push_database] Error pushing file to database: ${response}`);
				return null;
			}
			this.databasepushed = true;
			this.logger.debug(`[push_database] File pushed to database`);
		}
	}

	

	async build_query_string(query) {
		return Object.keys(query)
			.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
			.join('&');
	};

	async get_files(query) {
		this.logger.info(`[get_files] Getting files from database`);
		const filter = await this.build_query_string(query);
		this.logger.debug(`[get_files] URL: ${discordbdd}/files?${filter}`);
		const response = await axios.get(`${discordbdd}/files?${filter}`)
			.catch((error) => {
				this.logger.error(`[get_files] Error getting files: ${error}`);
				return null;
			});
		this.logger.debug(`[get_files] Response: ${response}`);
		if (response.status !== 200) {
			this.logger.error(`[get_files] Error getting files from database: ${response.status}`);
			return null;
		}
		if (!response.data) {
			this.logger.error(`[get_files] Error getting files from database: ${response}`);
			return null;
		}
		if (!response.data.files) {
			this.logger.debug(`[get_files] File not found from database: ${response.data}`);
			return null;
		}
		this.logger.debug(`[get_files] Files: ${JSON.stringify(response.data.files)}`);
		return response.data.files;
	}

	async get_file_and_init(query) {
		this.logger.debug(`[get_file_and_init] Getting file from database`);
		const responsedata = await this.get_files(query);
		if (!responsedata) {
			this.logger.error(`[get_file_and_init] Error getting file from database`);
			return null;
		}
		const response = responsedata[0];
		if (!response) {
			this.logger.error(`[get_file_and_init] Error getting file from database`);
			return null;
		}
		this.logger.debug(`[get_file_and_init] File: ${JSON.stringify(response)}`);

		this.md5 = response.md5;
		this.editor_discord_id = response.editor_discord_id;
		this.artist = response.artist;
		this.title = response.title;
		this.performer = response.performer;
		this.sources = (response.sources != undefined && response.sources != null) ? response.sources : ' ';
		this.comments = (response.comments != undefined && response.comments != null) ? response.comments : ' ';
		this.tags = (response.tags != undefined && response.tags != null) ? response.tags : [];
		this.song_duration = (response.song_duration != undefined && response.song_duration != null) ? response.song_duration : 0;
		this.tracks = (response.tracks != undefined && response.tracks != null) ? response.tracks : [];
		this.discord = (response.discord != undefined && response.discord != null) ? response.discord : false;
		this.website = (response.website != undefined && response.website != null) ? response.website : false;
		this.editor_channel = (response.editor_channel != undefined && response.editor_channel != null) ? response.editor_channel : false;
		this.discord_message_id = (response.discord_message_id != undefined && response.discord_message_id != null) ? response.discord_message_id : null;
		this.discord_link = (response.discord_link != undefined && response.discord_link != null) ? response.discord_link : null;
		this.website_file_path = (response.website_file_path != undefined && response.website_file_path != null) ? response.website_file_path : null;
		this.website_link = (response.website_link != undefined && response.website_link != null) ? response.website_link : null;
		this.editor_channel_id = (response.editor_channel_id != undefined && response.editor_channel_id != null) ? response.editor_channel_id : null;
		this.editor_channel_link = (response.editor_channel_link != undefined && response.editor_channel_link != null) ? response.data.editor_channel_link : null;
	}

	toJSON() {
		return {
		filename: this.filename,
		md5:this.md5,
		editor_discord_id:this.editor_discord_id,
		editor:this.editor,
		artist:this.artist,
		title:this.title,
		performer:this.performer,
		sources:this.sources,
		comments:this.comments,
		tags:this.tags,
		song_duration:this.song_duration,
		tracks:this.tracks,
		discord:this.discord,
		website:this.website,
		editor_channel:this.editor_channel,
		discord_message_id:this.discord_message_id,
		discord_link:this.discord_link,
		website_file_path:this.website_file_path,
		website_link:this.website_link,
		editor_channel_id:this.editor_channel_id,
		editor_channel_link:this.editor_channel_link,
		};
	}
}

export default File;