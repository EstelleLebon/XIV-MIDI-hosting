import { MessageFlags } from "discord.js";
import dbcheck from "../dbcheck/dbcheck.js";
import createLogger from "../logger/logger.js";
import axios from "axios";
import Response from "./response.js";


class Search {
	constructor(interaction) {
		this.interaction = interaction;
		this.query = null;
		this.files = null;

		
		this.logger = createLogger('Search-Class');
		this.dbcheck = new dbcheck();
	}

	async worker() {
		this.logger.info(`[Worker] Starting search worker...`);

		if (!await this.dbcheck.check()) {
			this.logger.error(`[Worker] Database is down, aborting search.`);
			return this.interaction.editReply({
				content: `[Worker] Database is down, please try again later.`,
				flags: MessageFlags.Ephemeral
			});
		}
		this.logger.debug(`[Worker] Database is up, proceeding with search.`);

		// Build the search query
		this.logger.debug(`[Worker] Building search query...`);
		this.query = await this.buildQuery();
		this.logger.debug(`[Worker] Search query: ${this.query}`);

		// Build files array
		this.logger.debug(`[Worker] Building files array...`);
		this.files = await this.buildFiles();
		this.logger.debug(`[Worker] Files array built: ${this.files.length} files found.`);

		
		// Build response
		this.logger.debug(`[Worker] Building response...`);
		this.response = new Response(this.interaction, this.files);
		this.logger.info(`[Worker] Response built successfully.`);

		// Send response
		this.logger.debug(`[Worker] Sending response...`);
		await this.response.worker();
		this.logger.info(`[Worker] Response sent successfully.`);
		this.logger.debug(`[Worker] Search worker completed.`);
		
	}


	async buildQuery() {
		const bandSize = await this.interaction.options.getString('band-size');
		const artist = await this.interaction.options.getString('artist');
		const title = await this.interaction.options.getString('title');
		const editor = await this.interaction.options.getString('editor');
		const instrument = await this.interaction.options.getString('instrument');

		this.logger.debug(`[BuildQuery] Building query object...`);
		this.logger.debug(`[BuildQuery] Band size: ${bandSize}`);
		this.logger.debug(`[BuildQuery] Artist: ${artist}`);
		this.logger.debug(`[BuildQuery] Title: ${title}`);
		this.logger.debug(`[BuildQuery] Editor: ${editor}`);
		this.logger.debug(`[BuildQuery] Instrument: ${instrument}`);

		let query = {};

		if (bandSize) query.performer = bandSize;
		if (artist) query.artist = artist;
		if (title) query.title = title;
		if (editor) query.editor = editor;
		if (instrument) query.instrument = instrument;
		this.logger.debug(`[BuildQuery] Query object: ${JSON.stringify(query)}`);
		this.query = Object.keys(query)
			.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
			.join('&');
		this.logger.debug(`[BuildQuery] Query string: ${this.query}`);
		return this.query;
	}


	async buildFiles() {
		this.logger.debug(`[BuildFiles] Building files array...`);
		if (!this.query) this.query = await this.buildQuery();
		this.logger.debug(`[BuildFiles] Query string: `, this.query);
		const files = await this.getFiles(this.query);
		this.logger.debug(`[BuildFiles] Files array built successfully.`);
		if (!files || files.length === 0) {
			this.logger.warn(`[BuildFiles] No files found.`);
			return [];
		}
		this.logger.debug(`[BuildFiles] Files found: ${files.length}`);

		this.files = [];
		files.forEach(file => {
			const tmp = {};
			tmp.name = file.artist + ' - ' + file.title + ' - ' + file.performer + ' - ' + file.editor;
			if (file.discord) tmp.link = file.discord_link;
			else if (file.website) tmp.link = process.env.websiteurl + file.website_link.slice(1);
			else if (file.editor_channel) tmp.link = file.editor_channel_link;
			else return;
			this.files.push(tmp);
		});
		this.logger.debug(`[BuildFiles] Files array: ${JSON.stringify(this.files, null, 2)}`);
		return this.files;
	}


	async getFiles(query = '') {
		this.logger.debug(`[GetFiles] Getting files from database...`);
		this.logger.debug(`[GetFiles] Query string: ${query}`);

		const response = await axios.get(`${process.env.discordbdd}/files?${query}`);
		if (response.status !== 200) {
			this.logger.error(`[GetFiles] Error fetching files: ${response.statusText}`);
			return [];
		}
		this.logger.debug(`[GetFiles] Files fetched successfully.`);
		if (!response.data || !response.data.files || response.data.files.length === 0) {
			this.logger.warn(`[GetFiles] No files found.`);
			return [];
		}
		const files = response.data.files;
		this.logger.debug(`[GetFiles] Files found: ${files.length}`);
		return files;
	}
}

export default Search;
export { Search };

