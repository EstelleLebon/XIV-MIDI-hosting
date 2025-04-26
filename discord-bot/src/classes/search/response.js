import createLogger from "../logger/logger.js";
import { MessageFlags } from "discord.js";

class Response {
	constructor(interaction, files) {
		this.interaction = interaction;
		this.files = files;

		this.response = null;

		this.collector = null;

		this.logger = createLogger('Search-Response-Class');
	}


	async worker() {
		this.logger.info(`[Worker] Starting response worker...`);
		this.logger.debug(`[Worker] Building response...`);
		this.response = this.buildResponse();
		this.logger.info(`[Worker] Response built successfully.`);
		this.logger.debug(`[Worker] Sending response...`);
		
		await this.send();
		this.logger.info(`[Worker] Response sent successfully.`);
		this.logger.debug(`[Worker] Response worker completed.`);
	}


	async send() {
		try {
			await this.interaction.editReply(this.response);
			this.collector = this.interaction.channel.createMessageComponentCollector({
				filter: (i) => i.user.id === this.interaction.user.id,
				time: 600000, // 10 minutes
			});
			this.collector.on('collect', async (i) => {
				if (i.customId === 'sendall') {
					await i.deferUpdate();
					this.response.content = this.response.content.replace('Click on button below to receive all results in DM.', 'Sending DM.').trim();
					this.response.components = [];
					try {
						await this.interaction.editReply(this.response);
					} catch (error) {
						this.logger.error(`[Send] Error editing response: ${error}`);
					}
					this.logger.debug(`[Send] Sending all results in DM...`);
					const dmResponses = this.buildDMResponse();
					for (const response of dmResponses) {
						await i.user.send(response);
					}
					this.logger.info(`[Send] All results sent in DM.`);
				}
				this.collector.stop();
				this.collector = null;
			});
			this.collector.on('end', async () => {
				this.logger.debug(`[Send] Collector ended.`);
				this.response.content = this.response.content.replace('Click on button below to receive all results in DM.', '').trim();
				this.response.components = [];
				try {
					await this.interaction.editReply(this.response);
				} catch (error) {
					this.logger.error(`[Send] Error editing response: ${error}`);
				}
				if (this.collector) {
					this.collector.stop();
					this.collector = null;
				}
			});
		} catch (error) {
			this.logger.error(`[Send] Error sending response: ${error}`);
		}
	}

  	buildResponse() {
		this.logger.debug(`[Worker] Building response...`);
		const response = {
			content: '',
			components: [],
			flags: MessageFlags.Ephemeral,
		};
		let messageString = `Here is your search results for:`;
		const bandSize = this.interaction.options.getString('band-size');
		const artist = this.interaction.options.getString('artist');
		const title = this.interaction.options.getString('title');
		const editor = this.interaction.options.getString('editor');
		const instrument = this.interaction.options.getString('instrument');

		if (bandSize) messageString += `\nBand size: ${bandSize ? bandSize : 'Any'}`;
		if (artist) messageString += `\nArtist: ${artist ? artist : 'Any'}`;
		if (title) messageString += `\nTitle: ${title ? title : 'Any'}`;
		if (editor) messageString += `\nEditor: ${editor ? editor : 'Any'}`;
		if (instrument) messageString += `\nInstrument: ${instrument ? instrument : 'Any'}`;

		if (this.files.length === 0) {
			messageString += `\n\nNo results found.`;
		} else {
			messageString += `\n\nFound ${this.files.length} results:`;
		}

		let fileCount = 0;
		if (this.files.length > 10) {
			this.files.map((file, index) => {
				if (index < 10) {
					const tmp = `\n${index + 1}. [${file.name}](<${file.link}>)`;
					if (messageString.length + tmp.length > 1900) {
						this.logger.debug(`[BuildResponse] Message string is too long, stopping here.`);
						return;
					}
					// Add the file to the message string
					fileCount++;
					messageString += tmp;
				}
			});
			messageString += `\nAnd ${this.files.length - fileCount} more...`;
			messageString += `\nClick on button below to receive all results in DM.`;

			// Create a button to send all results in DM
			const button = {
				type: 1,
				components: [
					{
						type: 2,
						style: 3,
						label: 'Send all results in DM',
						custom_id: 'sendall',
					},
				],
			};


			response.components = [button];			
		
		} else if (this.files.length > 0) {
			this.files.map((file, index) => {
				const tmp = `\n${index + 1}. [${file.name}](<${file.link}>)`;
				if (messageString.length + tmp.length > 1900) {
						this.logger.debug(`[BuildResponse] Message string is too long, stopping here.`);
						return;
					}
					// Add the file to the message string
					messageString += tmp;
			});
		}
		response.content = messageString;
		return response;
  	}


	buildDMResponse() {
		this.logger.debug(`[BuildDMResponse] Building DM response...`);
		const dmResponses = [];
		let messageString = `Here is your search results:`;
		messageString += `\nFound ${this.files.length} results.`;
		let currentBlock = messageString;

		this.files.forEach((file, index) => {
			const tmp = `\n${index + 1}. [${file.name}](<${file.link}>)`;
			if (currentBlock.length + tmp.length > 2000) {
				// Push the current block and start a new one
				dmResponses.push(currentBlock);
				currentBlock = '';
			}
			currentBlock += tmp;
		});

		// Push the last block if it has content
		if (currentBlock.length > 0) {
			dmResponses.push(currentBlock);
		}

		this.logger.debug(`[BuildDMResponse] DM responses built successfully.`);
		return dmResponses;
	}

}

export default Response;
export { Response };