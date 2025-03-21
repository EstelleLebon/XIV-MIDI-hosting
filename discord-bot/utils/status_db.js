const axios = require("axios");
const url = process.env.discordbdd;

module.exports = async function statusDb() {
    try {
      	const response = await axios.get(url);
      	return response.status;
    } catch (error) {
      	if (error.response) {
        	return error.response.status;
      	} else {
        	console.error(`Error fetching DB status: ${error.message}`);
        	return "Error fetching DB status";
      	}
    }
};