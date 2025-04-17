import axios from "axios";

class dbcheck {
	constructor() {
		this.url = process.env.discordbdd; // Database URL
		this.status = false; // Database connection status
	}


	async check() {
		// GET request to the database URL
		const response = await axios.get(this.url);
		if (response.status === 200) {
			this.setStatus(true); // Set status to true if the request is successful
			return true; // Return true if the request is successful
		} else {
			this.setStatus(false); // Set status to false if the request fails
			return false; // Return false if the request fails
		}
	}

	getStatus() {
		return this.status;
	}

	setStatus(status) {
		this.status = status;
	}
}

export default dbcheck;
export { dbcheck };