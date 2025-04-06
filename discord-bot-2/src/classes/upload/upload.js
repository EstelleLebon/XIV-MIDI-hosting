import error from "../error/error.js";
import User from "../user/user.js";
import createLogger from "../../classes/logger/logger.js";
import UploadPreview from "./uploadpreview.js";
import File from "../file/file.js";

class Upload {
	constructor(interaction, editor_role, stream = null) {
		this.interaction = interaction;
		this.editor_role = editor_role;
		this.stream = stream;
		this.logger = createLogger('Upload-Class');
		this.user = null;
		this.file = null;
		this.preview = null;
		// this.error = null;
	}

	async process() {
		this.logger.info(`Processing upload [Editor role: ${this.editor_role}]`);

		// this.error = new error(this.interaction, this.logger, this.stream);
		// await this.error.init();
		// this.logger.debug(`Error initialized`);
		
		// Initialize user
		this.logger.debug(`Creating user object...`);
		this.user = new User(this.interaction, null);
		this.logger.debug(`Initializing user object...`);
		await this.user.init()
		this.logger.debug(`User object initialized: ${JSON.stringify(this.user.toJSON(), null, 2)}`);


		// Initialize file
		this.logger.debug(`Creating file object...`);
		this.file = new File(this.interaction, null);
		this.logger.debug(`File object created`);
		this.logger.debug(`Initializing file object...`);
		this.file.editor = this.user.editor_name;
		this.file.editor_channel_id = this.user.editor_channel_id;
		await this.file.init()
		this.logger.debug(`File object initialized: ${JSON.stringify(this.file.toJSON(), null, 2)}`);

		// already exists cases
		this.logger.debug(`Checking if file already exists...`);
		this.logger.debug(`Pushes: ${JSON.stringify(this.file.pushes)}`);
		if ( (this.file.pushes.discord < 0) && (this.file.pushes.editor < 0) && (this.file.pushes.website < 0) ) {
				// file exists everywhere
				this.logger.debug(`File already exists everywhere`);
				// edit File ??
		}
		else if ( (this.file.pushes.discord > 1) || (this.file.pushes.editor > 1) || (this.file.pushes.website > 1) ) {
				// file exists, checking owner
				this.logger.debug(`File already exists`);
				this.logger.debug(`Checking owner...`);

				if (this.user.discord_id == this.file.editor_discord_id) {
					this.logger.debug(`File already exists, owner is the same`);
					// upload file
				}
				else {
					this.logger.debug(`File already exists, owner is different`);
					// wrong owner
					return this.interaction.followUp({
						content: `This file already exists, but you are not the owner. Please contact the owner to upload a new version.\n If you are the owner, please contact my developper to fix this.`,
						ephemeral: true,
					});
				}
		}
		else if ( (this.file.pushes.discord == 1) || (this.file.pushes.editor == 1) || (this.file.pushes.website == 1) ) {
			// new file
			this.logger.debug(`New file`);
		}
		else {
			// error ??
			this.logger.error('Unknown case for file pushes');
			this.logger.error(`Pushes: ${JSON.stringify(this.file.pushes)}`);
		}
				
		// Sending file preview
		this.preview = new UploadPreview(this.interaction, this.editor_role, null);
		await this.preview.init(this.file);
		await this.preview.sendPreview();
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

		if (this.preview.needtopush === true) {
			this.logger.debug(`User confirmed upload`);
			this.logger.debug(`Uploading file...`);
			await this.file.push(this.preview);
		}
	}
	
}

export default Upload;