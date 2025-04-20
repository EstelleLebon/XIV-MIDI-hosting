import createLogger from "../logger/logger.js";
import error from "../error/error.js";
import { EmbedBuilder } from "@discordjs/builders";

class UploadPreview {
	constructor(interaction, editor_role, error = null) {
		this.interaction = interaction;
		this.interactionpreview = null;

		this.editor_role = editor_role;
		this.logger = createLogger('UploadPreview-Class');
		this.error = error;

		this.collector = null;

		this.interval = null;
		this.timer = 600; // 10 minutes
		this.user_id = this.interaction.user.id;
		this.channel_id = this.interaction.channel.id;

		this.upload_status = null;
		this.upload_interval = null;

		this.needtopush = false;
		this.collected = false;

		this.content = null;
		this.embed = null;
		this.buttons = null;

	}

	async init(file) {
		this.logger.info(`Initializing upload preview...`);
		this.logger.debug(`User ID: ${this.user_id}`);
		this.logger.debug(`Channel ID: ${this.channel_id}`);


		if (!this.error) {
			this.error = new error(this.interaction, this.logger);
			this.error.init();
			this.logger.debug(`ErrorClass initialized`);
		}

		await this.createEmbed(file);
		await this.createButtons(file);

	}
	
	async createEmbed(file) {
		this.logger.info(`Creating embed...`);
		let trackInstruments = "";
		if (file.tracks && file.tracks.length > 0) {
			trackInstruments = file.tracks
				.map(track => track.instrument || 'Unknown')
				.filter(instrument => instrument !== 'Unknown')
				.join(', ');
			if (trackInstruments === "") {
				trackInstruments = " ";
			}
		} else {
			trackInstruments = " ";
		}
		this.logger.debug(`Track instruments: ${trackInstruments}`);

		let duration = "";
		this.logger.debug(`File duration: ${file.song_duration}`);
		if (file.song_duration) {
			const minutes = String(Math.floor(Number(file.song_duration) / 60000)); // Convert milliseconds to minutes
				const seconds = String(Math.floor((Number(file.song_duration) % 60000) / 1000)); // Get remaining seconds
			duration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
		} else {
			duration = "0:00";
		}
		this.logger.debug(`Duration: ${duration}`);


		try {
		this.embed = new EmbedBuilder()
		} catch (error) {
			this.logger.error(`Error creating embed: ${error}`);
			return false;
		}
		try {
			this.embed.setAuthor({
				name: "XIVMIDI",
				iconURL: "https://th.bing.com/th/id/OIG.462uH5OW2SOk5LU87zsu?pid=ImgGn",
			})
		} catch (error) {
			this.logger.error(`Error setting embed author: ${error}`);
			return false;
		}
		try {
			this.embed.setTitle("MIDI upload Preview")
		} catch (error) {
			this.logger.error(`Error setting embed title: ${error}`);
			return false;	
		}
		try {
			this.embed.setDescription("Here is a preview of your upload:")
		} catch (error) {
			this.logger.error(`Error setting embed description: ${error}`);
			return false;
		}
		try {
			this.embed.setColor(0x001df5)
		} catch (error) {
			this.logger.error(`Error setting embed color: ${error}`);
			return false;
		}
		try {
        	this.embed.setTimestamp()
		} catch (error) {
			this.logger.error(`Error setting embed timestamp: ${error}`);
			return false;
		}
		try {
			this.embed.addFields(
				{name: "Filename:",value: file.filename || "N/A",inline: false},
				{name: "Artist:",value: file.artist || "N/A",inline: true},
				{name: "Title:",value: file.title || "N/A",inline: false},
				{name: "Editor Name:",value: file.editor || "N/A",inline: false},
				{name: "Band Size:",value: file.performer || "N/A",inline: false},
				{name: "Duration:",value: duration || "N/A",inline: false},
				// {name: "Tags:",value: embedtags || "N/A",inline: false},
				{name: "Instruments:",value: trackInstruments || "N/A",inline: false},
				{name: "Comments:",value: file.comments || "N/A",inline: false},
				{name: "Source:",value: file.sources || "N/A",inline: false},
				
			);
		} catch (error) {
			this.logger.error(`Error adding fields to embed: ${error}`);
			return false;
		}
		this.logger.debug(`Pushes: ${JSON.stringify(file.pushes)}`);
		if (file.pushes.discord > 0) {
			this.embed.addFields({name: "Discord Push:",value: "Enable",inline: true})
		} else {
			if (file.pushes.discord == -3) {
				this.embed.addFields({name: "Discord Push:",value: "Disabled",inline: true})
			} else {
				this.embed.addFields({name: "Discord Push:",value: `[Already exists](${file.discord_link})`,inline: true})
			}
		}

		if (this.editor_role) {
			if (file.pushes.website > 0) {
				this.embed.addFields({name: "Website Push:",value: "Enable",inline: true})
			} else {
				if (file.pushes.website == -3) {
					if (this.website == true) {
						this.embed.addFields({name: "Website Push:",value: `[Already exists](${process.env.websiteurl.slice(0, -1) + file.website_link})`,inline: true})
					} else {
						this.embed.addFields({name: "Website Push:",value: "Disabled",inline: true})
					}
				} else {
					this.embed.addFields({name: "Website Push:",value: `[Already exists](${process.env.websiteurl.slice(0, -1) + file.website_link})`,inline: true});
				}
			}
			if (file.pushes.editor > 0) {
				this.embed.addFields({name: "Editor Channel Push:",value: "Enable",inline: true});
			} else {
				if (file.pushes.editor == -3) {
					if (this.editor_channel == true) {
						this.embed.addFields({name: "Editor Channel Push:",value: `[Already exists](${file.editor_channel_link})`,inline: true})
					} else {
					this.embed.addFields({name: "Editor Channel Push:",value: "Disabled",inline: true})
					}
				} else {
					this.embed.addFields({name: "Editor Channel Push:",value: `[Already exists](${file.editor_channel_link})`,inline: true});
				}
			}
		}

		this.embed.updateEmbedField = (name, value) => {
			const field = this.embed.data.fields.find(f => f.name.toLowerCase() === name.toLowerCase());
			if (field) {
				field.value = value;
			}
		};

		this.logger.debug(`Embed created: ${JSON.stringify(this.embed.toJSON(), null, 2)}`);

		this.logger.info(`Embed created`);
		return this.embed;

	}

	async createButtons(file) {
		this.logger.info(`Creating buttons...`);
		if (file.pushes.discord < 0 && file.pushes.editor < 0 && file.pushes.website < 0) {
			this.logger.info(`File already exists everywhere`);
			return null;
		}
		try {
			this.buttons = {
				type: 1,
				components: [
					{
						type: 2,
						style: 3,
						label: 'Confirm',
						custom_id: 'confirm',
					},
					{
						type: 2,
						style: 4,
						label: 'Cancel',
						custom_id: 'cancel',
					},
				],
			};
		} catch (error) {
			this.logger.error(`Error creating buttons: ${error}`);
			return false;
		}
		this.logger.debug(`Buttons created: ${JSON.stringify(this.buttons, null, 2)}`);
		this.logger.info(`Buttons created`);
		return this.buttons;
	}

	deleteEmbed() {
		this.embed = null;
	}

	deleteButtons() {
		this.buttons = null;
	}

	deleteContent() {
		this.content = null;
	}

	async sendPreview(file) {
		this.logger.info(`Sending preview...`);
		this.logger.debug(`Embed: ${JSON.stringify(this.embed)}`);
		this.logger.debug(`Buttons: ${JSON.stringify(this.buttons)}`);

		this.interactionpreview = await this.interaction.followUp({
			content: this.content,
			embeds: this.embed ? [this.embed] : [],
			components: this.buttons ? [this.buttons] : [],
			ephemeral: true,
		}).catch((error) => {
			// this.error.add_error(`Error sending preview: ${error}`);
			this.logger.error(`Error sending preview: ${error}`);
			return false;
		});
		if (file.pushes.discord > 0 || file.pushes.editor > 0 || file.pushes.website > 0) {
			this.initCollector();
		}
		this.logger.info(`Preview sent`);
		return true;
	}

	async updatePreview() {
		await this.interaction.editReply({
			content: this.content ? this.content : null,
			embeds: this.embed ? [this.embed] : [],
			components: this.buttons ? [this.buttons] : [],
			ephemeral: true,
		}).catch((error) => {
			// this.error.add_error(`Error updating preview: ${error}`);
			this.logger.error(`Error updating preview: ${error}`);
			return false;
		});
		return true;
	}


	async initCollector() {
		this.logger.info(`Initializing collector...`);
		if (this.collector) {
			this.logger.error(`Collector already initialized`);
			return false;
		}
		this.collector = this.interactionpreview.channel.createMessageComponentCollector({
			filter: (i) => (i.customId === 'confirm' || i.customId === 'cancel') && i.user.id === this.interaction.user.id && i.message.id === this.interactionpreview.id,
			time: this.timer * 1000,
		});
		this.collector.on('collect', async (i) => {
			this.logger.info(`Collector collected: ${i.customId}`);
			clearInterval(this.interval);
			this.interval = null;
			await this.handleCollector(i);
		});
		this.collector.on('end', async () => {
			clearInterval(this.interval);
			this.interval = null;
			this.logger.debug(`Timer: ${this.timer}`);
			if (this.timer <= 1) {
				this.logger.info(`Collector timed out`);
				this.embed.updateEmbedField(' ', 'Timed out');
				await this.cancel();
			}
			this.logger.info(`Collector ended`);
			await this.stopCollector();
			
		});
		this.embed.addFields({name: " ",value: `TimeOut: ${Math.floor(this.timer / 60)}m ${(this.timer % 60)}s`,inline: false})
		this.updatePreview();
		this.interval = setInterval(async () => {
			await this.timerF(this.embed, this.interaction);
		}, 1000);
		this.logger.info(`Collector initialized`);
		return true;

	}

	async handleCollector(interaction) {
		this.logger.info(`Handling collector...`);
		clearInterval(this.interval);
		this.interval = null;
		if (interaction.customId === 'confirm') {
			this.logger.info(`Collector confirmed`);
			await this.confirm();
		} else if (interaction.customId === 'cancel') {
			this.logger.info(`Collector canceled`);
			await this.cancel();
		}
		this.logger.info(`Collector handled`);
		return true;
	}

	async stopCollector() {
		this.logger.info(`Stopping collector...`);
		if (this.collector) {
			this.collector.stop();
			this.collector = null;
		}
		this.logger.info(`Collector stopped`);
		return true;
	}
	async deleteCollector() {
		this.logger.info(`Deleting collector...`);
		if (this.collector) {
			this.collector.stop();
			this.collector = null;
		}
		this.logger.info(`Collector deleted`);
		return true;
	}


	async timerF() {
		if (!this.interval) {
			this.logger.error(`Interval is null`);
			return false;
		}
		if (!this.timer) {
			this.logger.error(`Timer is null`);
			return false;
		}
		if (!this.embed) {
			this.logger.error(`Embed is null`);
			return false;
		}
		if (!this.interactionpreview) {
			this.logger.error(`Interaction preview is null`);
			return false;
		}
		if (this.timer <= 0) {
			this.timer = 0;
		}
		this.timer -= 1;
		if (this.timer <= 0) {
			return
		}
		if (this.timer <= 15) {
			this.embed.updateEmbedField(" ", `TimeOut: **${this.timer}s**`);
			this.updatePreview();
		}
		if (this.timer % 5 == 0) {
			if (this.timer >= 60) {
				this.embed.updateEmbedField(" ", `TimeOut: ${Math.floor(this.timer / 60)}m ${(this.timer % 60)}s`);
			} else {
				this.embed.updateEmbedField(" ", `TimeOut: ${this.timer}s`);
			}
			this.updatePreview();
		}
	}


	async init_status_interval(i) {
		if (this.upload_status == null) {
			const j = i % 3;
			switch (j) {
				case 0:
					this.embed.updateEmbedField('Status: ', "Uploading.");
					break;
				case 1:
					this.embed.updateEmbedField('Status: ', "Uploading..");
					break;
				case 2:
					this.embed.updateEmbedField('Status: ', "Uploading...");
					break;
			}
			this.updatePreview();
		}
	}

	async confirm() {
		this.logger.info(`Confirming...`);
		await this.stopCollector();

		this.deleteButtons();
		this.deleteContent();

		if (this.editor_role) {
			this.embed.spliceFields(12, 1);
		} else {
			this.embed.spliceFields(10, 1);
		}

		this.embed.addFields({name: "Status: ",value: `Uploading...`,inline: false})
		await this.updatePreview();
		let i = 0;
		this.upload_interval = setInterval(async () => {
			await this.init_status_interval(i);
			i ++;
		}, 666);

		this.collected = true;
		this.needtopush = true;
		this.logger.info(`Confirmed`);
		return true;
	}

	async cancel() {
		this.logger.info(`Canceling...`);
		await this.stopCollector();

		this.deleteButtons();
		this.deleteContent();

		if (this.editor_role) {
			this.embed.spliceFields(12, 1);
		} else {
			this.embed.spliceFields(10, 1);
		}
        this.embed.updateEmbedField('discord push:', 'Canceled');
		if (this.editor_role) {
        	this.embed.updateEmbedField('website push:', 'Canceled');
        	this.embed.updateEmbedField('editor channel push:', 'Canceled');
		}
		await this.updatePreview();
		this.collected = true;
		this.logger.info(`Canceled`);
		return true;
	}
	
}

export default UploadPreview;