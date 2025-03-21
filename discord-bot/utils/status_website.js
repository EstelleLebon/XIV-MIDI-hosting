const axios = require("axios");
const url = process.env.websitestatus;

module.exports = async function statusWebsite() {
    try {
      	const response = await axios.get(url);
      	return response.status;
    } catch (error) {
      	if (error.response) {
        	return error.response.status;
      	} else {
        	console.error(`Error fetching website status: ${error.message}`);
        	return "Error fetching website status";
      	}
    }
};