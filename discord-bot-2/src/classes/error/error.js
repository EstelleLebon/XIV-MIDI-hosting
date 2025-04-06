import createLogger from "../logger/logger.js";

class error {
	constructor(interaction, logger, stream) {
		this.stream = stream;
		this.interaction = interaction;
		this.logger = logger;
		this.errors = [];
		this.message = null;
	}

	static sessions = [];

	async init() {
		this.logger.debug(`Initializing error class`);
		this.logger.debug(`Stream: ${this.stream}`);

		if (!this.logger) {
			this.logger = createLogger('Error');
			this.logger.debug(`Logger created`);
		}
		if (!this.interaction) {
			this.logger.debug(`Interaction is null`);
			this.interaction = null;
		}
		if (!this.stream) {
			this.logger.debug(`Stream is null`);
			this.stream = null;
		}

		if (this.stream == 'new' && this.logger.moduleName != 'Error' && this.interaction) {
			this.logger.debug(`Creating new stream`);
			const id = await this.get_random_seed()
			this.logger.debug(`Stream ID: ${id}`);
			const session = {
				id: id,
				interaction: this.interaction,
				errors: [],
				message: null,
			}
			error.sessions.push(session);
			this.stream = session;
			this.logger.debug(`Loggin sessions...`);
			this.logger.debug(`Sessions: ${stringify(error.sessions, null, 2)}`);
			this.logger.debug(`Session created`);

		} else {
			this.logger.debug(`Joining existing stream`);
			if (this.logger.moduleName != 'Error' && this.interaction) {
				if (error.sessions.find((session) => session.id === this.stream)) {
					this.logger.debug(`Stream already exists`);
					this.stream = error.sessions.find((session) => session.id === this.stream);
					this.logger.debug(`Stream: ${this.stream}`);
					
				}
			 } else {
				this.logger.debug(`Stream does not exist`);
				this.logger.debug(`Stream: ${this.stream}`);
				this.stream = null;
			}
		}
		
	}

	async get_random_seed() {
		this.logger.debug(`Getting random seed`);
		var seed = 'ERR000';
		const now = new Date();
		const string = now.toString();
		seed += string.replace(/[^0-9]/g, '');
		this.logger.debug(`Random seed: ${seed}`);
		return seed;
	}

	async handle(ispublic = false) {
		this.logger.debug(`Handling errors`);

		if (this.stream) {
			this.logger.debug(`Stream errors: ${JSON.stringify(this.stream.errors)}`);
			const errors = error.sessions.find((session) => session.id === this.stream.id);
			if (!errors) {
				this.logger.debug(`Stream not found`);
			} else {
				this.logger.debug(`Stream found: ${JSON.stringify(errors)}`);
				this.stream = errors;
			}
			if (this.stream.errors == 0) {
				this.logger.debug(`No errors found in stream`);
				return null;
			} 
			this.logger.debug(`Errors found in stream: ${JSON.stringify(this.stream.errors)}`);
			this.logger.debug(`Stream errors: ${this.stream.errors}`);

			this.errors = this.stream.errors;
			this.logger.debug(`Errors: ${JSON.stringify(this.errors)}`);
			this.stream.errors = [];
			this.stream.message = null;
			await this.update_session();
			this.logger.debug(`Handled errors`);

		} 

		if (this.errors.length === 0) {
			this.logger.info(`No errors found`);
			return null;
		}
		this.logger.info(`Errors found: ${this.errors.length}`);
		this.logger.debug(`Errors: ${JSON.stringify(this.errors)}`);
		this.logger.debug('Formatting message');
		this.message = await this.format_message()
			.catch((error) => {
				this.logger.error(`Error formatting message: ${error}`);
			});
		this.logger.debug(`Formatted message: ${this.message}`);
		this.logger.debug('Formatting errors');
		this.message = await this.format_errors()
			.catch((error) => {
				this.logger.error(`Error formatting errors: ${error}`);
			});
		
		this.logger.debug(`Formatted message with errors: ${this.message}`);
		if (ispublic && this.interaction) {
			if (! await this.reply()) {
				await this.followup()
			}
		}
		await this.log(this.message)
		this.errors = [];
		this.message = null;
		this.logger.debug(`Handled errors`);
		
	}

	async update_session () {
		this.logger.debug(`Updating session`);
		if (this.stream) {
			const session = error.sessions.find((session) => session.id === this.stream.id);
			if (session) {
				this.logger.debug(`Session found: ${JSON.stringify(session)}`);
				session.errors = this.stream.errors;
				session.message = this.stream.message;
				this.logger.debug(`Session updated: ${JSON.stringify(session)}`);
			} else {
				this.logger.debug(`Session not found`);
			}
		}
	}

	async add_error(error) {
		if (this.stream) {
			if (!this.stream.errors) {
				this.stream.errors = [];
			}
			const session = error.sessions.find((session) => session.id === this.stream.id);
			if (session) {
				this.logger.debug(`Session found: ${JSON.stringify(session)}`);
				session.errors.push(error);
				this.logger.debug(`Added error to stream: ${this.stream.id}`);
			}			
		} else {
			this.logger.debug(`Stream is null`);
			this.errors.push(error);
		}
	}

	async format_errors() {

		if (this.stream) {
			for (let i = 0; i < this.stream.errors.length; i++) {
				this.stream.message += `\n${this.stream.errors[i]}`;
			}
			this.logger.debug(`Formatted message: ${this.stream.message}`);
			return this.stream.message;
		} else {
			for (let i = 0; i < this.errors.length; i++) {
				this.message += `\n${this.errors[i]}`;
			}
			return this.message;
		}
	}	

	async format_message() {
		if (this.stream) {
			switch (this.stream.errors.length) {
				case 0:
					return null;
				case 1:
					this.stream.message = `1 error found:`;
					break;
				default:
					this.stream.message = `${this.stream.errors.length} errors found:`;
					break;
			}
			return this.message;
		} else {
			switch (this.errors.length) {
				case 0:
					return null;
				case 1:
					this.message = `1 error found:`;
					break;
				default:
					this.message = `${this.errors.length} errors found:`;
					break;
			}
			return this.message;
		}
	}

	async reply() {
		this.logger.debug(`Replying to interaction`);

		if (this.stream) {
			if (!this.stream.interaction) {
				this.logger.error(`Interaction is null`);
				return false;
			}
			if (!this.stream.message) {
				this.logger.error(`Message is null`);
				return false;
			}
			await this.stream.interaction.reply(this.stream.message)
				.catch((error) => {
					this.logger.error(`Error replying to interaction: ${error}`);
					return false;
				});
			this.logger.info(`Replied to interaction`);
			return true;

		} else {

			if (!this.interaction) {
				this.logger.error(`Interaction is null`);
				return false;
			}
			if (!this.message) {
				this.logger.error(`Message is null`);
				return false;
			}
			await this.interaction.reply(this.message)
				.catch((error) => {
					this.logger.error(`Error replying to interaction: ${error}`);
					return false;
				});
			this.logger.info(`Replied to interaction`);
			return true;

		}
	}

	async followup() {
		this.logger.debug(`Following up interaction`);

		if (this.stream) {
			if (!this.stream.interaction) {
				this.logger.error(`Interaction is null`);
				return false;
			}
			if (!this.stream.message) {
				this.logger.error(`Message is null`);
				return false;
			}
			await this.stream.interaction.followUp(this.stream.message)
				.catch((error) => {
					this.logger.error(`Error following up interaction: ${error}`);
					return false;
				});
			this.logger.info(`Followed up interaction`);
			return true;

		} else {
			if (!this.interaction) {
				this.logger.error(`Interaction is null`);
				return false;
			}
			if (!this.message) {
				this.logger.error(`Message is null`);
				return false;
			}
			await this.interaction.followUp(this.message)
				.catch((error) => {
					this.logger.error(`Error following up interaction: ${error}`);
					return false;
				});
			this.logger.info(`Followed up interaction`);
			return true;

		}
	}

	async log() {
		if (this.stream) {
			this.logger.error(this.stream.message);
		} else {
			this.logger.error(this.message);
		}
	}

	async is_error() {
		if (this.stream) {
			const session = error.sessions.find((session) => session.id === this.stream.id);
			if (!session) {
				this.logger.debug(`Session not found`);
				return false;
			}
			this.logger.debug(`Session errors: ${JSON.stringify(session.errors)}`);
			if (session.errors.length > 0) {
				this.logger.debug(`Errors found`);
				return true;
			} else {
				this.logger.debug(`No errors found`);
				return false;
			}
		} else {
			if (this.errors.length > 0) {
				this.logger.debug(`Errors found`);
				return true;
			} else {
				this.logger.debug(`No errors found`);
				return false;
			}
		}
	}
}

export default error;