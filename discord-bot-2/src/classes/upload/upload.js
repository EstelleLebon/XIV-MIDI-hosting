import error from "../error/error.js";
import User from "./user/user.js";
import createLogger from "../logger/logger.js";
import UploadPreview from "./uploadpreview.js";
import File from "./file/file.js";
import dbcheck from "../dbcheck/dbcheck.js";

class Upload {
	constructor(interaction, editor_role, ) {
		this.interaction = interaction; // Interaction object from Discord.js
		this.editor_role = editor_role; // Role of the editor
		this.logger = createLogger('Upload-Class'); // Logger instance for this class
		this.user = null; // User object
		this.file = null; // File object
		this.preview = null; // UploadPreview object
		this.error = null; // Error handling object
	}

	async process() {
		this.logger.info(`Processing upload [Editor role: ${this.editor_role}]`);

		// Initialize error handling
		this.error = new error(this.logger);
		this.error.init();
		this.logger.debug(`ErrorClass initialized`);
		
		// Initialize user
		this.logger.debug(`Creating user object...`);
		this.user = new User(this.interaction, this.error); // Create a new User instance
		this.logger.debug(`Initializing user object...`);  
		await this.user.init(); // Initialize the user object
		this.logger.debug(`User object initialized: ${JSON.stringify(this.user.toJSON(), null, 2)}`);

		// check errors
		if (this.error.iserror()) {
			this.logger.error(`Errors found: ${this.error.getMessage()}`);
			return this.interaction.editReply({
				content: `Errors found: ${this.error.message.length} errors`,
				ephemeral: true,
			});
		}

		// Initialize file
		this.logger.debug(`Creating file object...`);
		this.file = new File(this.interaction, null); // Create a new File instance
		this.logger.debug(`File object created`);
		this.logger.debug(`Initializing file object...`);
		this.file.editor = this.user.editor_name; // Set the editor name
		this.file.editor_channel_id = this.user.editor_channel_id; // Set the editor channel ID
		await this.file.init(); // Initialize the file object
		this.logger.debug(`File object initialized: ${JSON.stringify(this.file.toJSON(), null, 2)}`);


		// check errors
		if (this.error.iserror()) {
			this.logger.error(`Errors found: ${this.error.getMessage()}`);
			return this.interaction.editReply({
				content: `Errors found: ${this.error.message.length} errors`,
				ephemeral: true,
			});
		}

		// Handle editor channel ID
		this.logger.debug(`Checking if editor channel ID is set...`);
		this.logger.debug(`editor push: ${this.file.pushes.editor}`);
		if (this.file.pushes.editor > 0) {
			await this.user.update_editor_channel_id(); // Update the editor channel ID
			if (!this.user.editor_channel_id) {
				this.logger.error(`Failed to update editor channel ID`);
				return this.interaction.editReply({
					content: `Failed to update editor channel ID. If you own a personal editor channel, please contact my developer.`,
					ephemeral: true,
				});
			}
		}

		// check errors
		if (this.error.iserror()) {
			this.logger.error(`Errors found: ${this.error.getMessage()}`);
			return this.interaction.editReply({
				content: `Errors found: ${this.error.message.length} errors`,
				ephemeral: true,
			});
		}

		// Handle cases where the file already exists
		this.logger.debug(`Checking if file already exists...`);
		this.logger.debug(`Pushes: ${JSON.stringify(this.file.pushes)}`);
		if ( (this.file.pushes.discord < 0) && (this.file.pushes.editor < 0) && (this.file.pushes.website < 0) ) {
			// File exists everywhere
			this.logger.debug(`File already exists everywhere`);

		} else if ( (this.file.pushes.discord > 1) || (this.file.pushes.editor > 1) || (this.file.pushes.website > 1) ) {
			// File exists, check the owner
			this.logger.debug(`File already exists`);
			this.logger.debug(`Checking owner...`);

			if (this.user.discord_id == this.file.editor_discord_id) {
				// Owner matches
				this.logger.debug(`File already exists, owner is the same`);

			} else {
				// Owner mismatch
				this.logger.debug(`File already exists, owner is different`);
				return this.interaction.editReply({
					content: `This file already exists, but you are not the owner. Please contact the owner to upload a new version.\nIf you are the owner, please contact my developer to fix this.`,
					ephemeral: true,
				});
			}
		} else if ( (this.file.pushes.discord == 1) || (this.file.pushes.editor == 1) || (this.file.pushes.website == 1) ) {
			// New file
			this.logger.debug(`New file`);

		} else {
			// Unknown case
			this.logger.error('Unknown case for file pushes');
			this.logger.error(`Pushes: ${JSON.stringify(this.file.pushes)}`);
			return this.interaction.editReply({
				content: `Unknown case for file pushes. Please contact my developer.`,
				ephemeral: true,
			});
		}


		// Setting file booleans
		if (this.file.pushes.discord > 0) {
			this.file.discord = true; // Set Discord boolean
			this.logger.debug(`Discord boolean set to true`);
		}
		if (this.file.pushes.editor > 0) {
			this.file.editor_channel = true; // Set editor boolean
			this.logger.debug(`Editor boolean set to true`);
		}
		if (this.file.pushes.website > 0) {
			this.file.website = true; // Set website boolean
			this.logger.debug(`Website boolean set to true`);
		}
		this.logger.debug(`File booleans set: ${JSON.stringify(this.file.toJSON(), null, 2)}`);
				

		// check errors
		if (this.error.iserror()) {
			this.logger.error(`Errors found: ${this.error.getMessage()}`);
			return this.interaction.editReply({
				content: `Errors found: ${this.error.message.length} errors`,
				ephemeral: true,
			});
		}

		
		// Sending file preview
		this.preview = new UploadPreview(this.interaction, this.editor_role, this.error); // Create a new UploadPreview instance
		await this.preview.init(this.file); // Initialize the preview
		await this.preview.sendPreview(this.file); // Send the preview to the user

		// Wait for user interaction
		if (this.preview.collector !== null) {
			await new Promise((resolve) => {
				const interval = setInterval(() => {
					if (this.preview.collected === true) {
						clearInterval(interval);
						resolve();
					}
				}, 100);
			});
			this.logger.debug(`User interaction received`);
			this.logger.debug(`Confirm : ${this.preview.needtopush}`);

			// check db status
			const db = new dbcheck();
			const dbStatus = await db.check();
			if (!dbStatus) {
				this.logger.error('Database is down, aborting upload.');
				return this.interaction.followUp({ content: 'Database is down, please try again later.', ephemeral: true });
			}
			this.logger.debug(`Database status: ${dbStatus}`);

			// Handle user confirmation
			if (this.preview.needtopush === true) {
				this.logger.debug(`User confirmed upload`);
				this.logger.debug(`Uploading file...`);
				await this.file.push(this.preview); // Push the file
			}
		}
	}
}

export default Upload;