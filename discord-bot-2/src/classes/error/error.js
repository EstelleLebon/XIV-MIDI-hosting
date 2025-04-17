import createLogger from "../logger/logger.js";

class error {
	constructor(logger) {
		this.logger = logger;
		this.errors = [];
		this.message = null;
	}

	init() {
		if (!this.logger) {
			this.logger = createLogger('Error-Class');
		}
		this.logger.info(`[INIT] Initializing error class...`);
		this.logger.debug(`[INIT] Error class initialized`);
	}


	addError(error) {
		this.logger.debug(`[addError] Adding error: ${error}`);
		this.errors.push(error);
	}

	getErrors() {
		this.logger.debug(`[getErrors] Getting errors...`);
		return this.errors;
	}

	getMessage() {
		this.logger.debug(`[getMessage] Getting message...`);
		this.message = this.errors.map((error) => {
			return `Error: ${error}`;
		}
		).join('\n');
		this.logger.debug(`[getMessage] Message: ${this.message}`);
		return this.message;
	}

	iserror() {
		this.logger.debug(`[iserror] Checking if there are errors...`);
		return this.errors.length > 0;
	}

	

}

export default error;