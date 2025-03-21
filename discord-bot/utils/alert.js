const alertId = process.env.alert_id.split(',').map(id => id.trim()); // Get the alertId from the environment variables
const createLogger = require('../logger/logger'); // Import the logger
const logger = createLogger('Alert'); // Create a logger with the name of this file

module.exports = {
	async sendAlert(message) {
		const client = require('../bot'); // Import the bot
		logger.info(`Sending alert to users...`);
		for (userid of alertId) {
			logger.info(`Sending alert to user ${userid}...`);
			try {
				logger.debug(`Fetching user ${userid}...`);
				const user = await client.users.fetch(userid);
				logger.debug(`Sending message to user ${userid}...`);
				await user.send(message);
				logger.info(`Alert sent to user ${userid}`);
			} catch (error) {
				logger.error(`Error sending alert to user ${userid}: ${error.message}`);
			}			
		}
	},
};