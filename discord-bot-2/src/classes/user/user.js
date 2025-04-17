import dbcheck from "../dbcheck/dbcheck.js";
import error from "../error/error.js";
import createLogger from "../logger/logger.js";
import axios from "axios";
const discordbdd = process.env.discordbdd;

class User {
	constructor(interaction, error = null) {
		this.interaction = interaction; // Create a new object, not a reference
		this.discord_id = null;
		this.discord_name = null;
		this.editor_name = null;
		this.editor_channel_id = null;
		this.admin = false;
		this.editor_role = false;
		this.logger = createLogger('User-Class');
		this.initialized = false;
		this.error = error;
	}

	async init() {
		this.logger.info(`[INIT] Initializing user...`);
		this.logger.debug(`[INIT] User ID: ${this.discord_id}`);

		if (!this.error) {
			this.error = new error(this.logger);
			this.error.init();
			this.logger.debug(`[INIT] ErrorClass initialized`);
		}

		if (this.interaction) {
			this.logger.debug(`[INIT] Interaction is not null`);
			this.discord_id = this.interaction.user.id;
		} else {
			this.logger.error(`[INIT] Interaction is null`);
			this.error.add_error(`[USERCLASS] [INIT] Error: this.interaction: ${this.interaction ? this.interaction : '????'}`);
		}
		
		this.logger.debug(`[INIT] Discord ID: ${this.discord_id}`);
		if (this.discord_id) {
			const user = await this.get_user()
			if (user) {
				this.discord_name = user.discord_name;
				this.editor_channel_id = user.editor_channel_id;
				this.admin = user.admin;
				this.editor_role = user.editor_role;
				const cachedname = user.editor_name;
				await this.handle_editor_name(cachedname);
				this.initialized = true;
				await this.update_user({ discord_name: this.discord_name, editor_channel_id: this.editor_channel_id, admin: this.admin, editor_role: this.editor_role })
			} else {
				this.logger.info(`[INIT] User ${this.discord_id} not found`);
				await this.init_from_interaction()
				this.initialized = true;
				await this.create_user()
				const cachedname = user.editor_name;
				await this.handle_editor_name(cachedname);
			}
		} else {
			this.logger.error(`[INIT] Error: this.discord_id: ${this.discord_id}`);
			this.error.add_error(`[USERCLASS] [INIT] Error: this.discord_id: ${this.discord_id ? this.discord_id : '????'}`);
		}

		this.logger.info(`[INIT] User ${this.discord_id} initialized`);
		this.initialized = true;
		
	}

	async handle_editor_name(cachedname) {
		this.logger.info(`[handle_editor_name] Handling editor name for user ${this.discord_id}`);
		if (this.interaction && this.interaction.options && this.interaction.options.getString('editor-name')) {
			const name = this.interaction.options.getString('editor-name');
			if (name && name != '' && name != ' ') {
				if (name != cachedname) {
					this.logger.info(`[handle_editor_name] Editor name changed from ${cachedname} to ${name}`);
					this.editor_name = name;
					// Update the user
					this.logger.debug(`[handle_editor_name] Updating user ${this.discord_id} with new editor name ${name}`);
					// Send a PUT request to update the user
					await this.update_user({ editor_name: name })
					.catch((error) => {
						this.logger.error(`[handle_editor_name] Error updating user: ${error}`);
						return
					});
					return;
				}
				
			}
		}
		this.logger.info(`[handle_editor_name] Editor name not changed`);
		this.editor_name = cachedname;
		return;
	}

	async init_from_interaction() {
		this.logger.info(`[init_from_interaction] Updating user ${this.discord_id} from interaction`);
		if (!this.discord_id) {
			this.logger.error(`[init_from_interaction] User ${this.discord_id} not found`);
			return null;
		}
		if (!this.interaction) {
			this.logger.error(`[init_from_interaction] Interaction is null`);
			return null;
		}
		this.logger.debug(`[init_from_interaction] Getting user name from interaction: ${this.interaction.user.username} `);
		const discord_name = this.interaction.user.username;
		var admin = 0;
        var editor_role = 0;
		this.logger.debug(`[init_from_interaction] Getting admin and editor role from interaction`);
        if (this.interaction.member) {
            // define & check admin
            try {
				this.logger.debug(`[init_from_interaction] Checking admin permissions`);
                if (this.interaction.member.permissions.has('ADMINISTRATOR')) {
                    this.logger.debug(`[init_from_interaction] User has admin permissions`);
                    admin = 1;
                }
            } catch (error) {
                this.logger.debug(`[init_from_interaction] User does not have admin permissions`);
                admin = 0;
            }
            // define & check editor_role
			this.logger.debug(`[init_from_interaction] Checking editor role`);
            if (this.interaction.member.roles) {				
                this.logger.debug(`[init_from_interaction] Roles exist`);
                if (this.interaction.member.roles.cache.some(role => role.name === 'Midi Editors')) {
                    this.logger.debug(`[init_from_interaction] User has editor role`);
                    editor_role = 1;
                } else {
                    this.logger.debug(`[init_from_interaction] User does not have editor role`);
                    editor_role = 0;
                }
            }
        }
		this.logger.debug(`[init_from_interaction] Editor role: ${editor_role}`);
		this.logger.debug(`[init_from_interaction] Admin: ${admin}`);

		if (discord_name) {
			this.discord_name = discord_name
			this.logger.debug(`[init_from_interaction] Discord name: ${this.discord_name}`);
		}  // else this.error.add_error(`Error: this.discord_name: ${this.discord_name}`);
		if (admin) {
			this.admin = admin
			this.logger.debug(`[init_from_interaction] Admin: ${this.admin}`);
		} // else this.error.add_error(`Error: this.admin: ${this.admin}`);
		if (editor_role) {
			this.editor_role = editor_role
			this.logger.debug(`[init_from_interaction] Editor role: ${this.editor_role}`);
		} // else this.error.add_error(`Error: this.editor_role: ${this.editor_role}`);

		this.logger.info(`[init_from_interaction] User ${this.discord_id} updated from interaction`);
	}

	async get_user() {
		this.logger.info(`[get_user] Getting user ${this.discord_id}`);

		// check db status
		const db = new dbcheck();
		const dbStatus = await db.check();
		if (!dbStatus) {
			this.logger.error('Database is down, aborting delete user.');
			return;
		}

		this.logger.debug(`[get_user] Database status: ${dbStatus}`);

		
		if (!this.discord_id) {
			this.logger.error(`User ${this.discord_id} not found`);
			// this.error.add_error(`Error: this.discord_id: ${this.discord_id}`);
			return null;
		}
		// Send a GET request to get the user
		this.logger.debug(`[get_user] Getting user data from ${discordbdd}/user/${this.discord_id}`);
		const userdata = await axios.get(`${discordbdd}/users/${this.discord_id}`)
			.catch((error) => {
				this.logger.debug(`[get_user] Error getting user: ${error}`);
				if (error.response && error.response.status === 404) {
					this.logger.debug(`[get_user] User ${this.discord_id} not found`);
					return null
				}
				// this.error.add_error(`Error getting user`);
				this.logger.debug(`[get_user] User data: ${JSON.stringify(userdata, null, 2)}`);
				return null;
			});

		if (!userdata || !userdata.data) {
			this.logger.debug(`[get_user] User ${this.discord_id} not found`);
			return null;
		}
		const user = userdata.data;
		if (!user) {
			this.logger.error(`[get_user] User ${this.discord_id} not found`);
			return null;
		}
		this.logger.info(`[get_user] User ${this.discord_id} found`);
		this.logger.debug(`[get_user] User data: ${JSON.stringify(user, null, 2)}`);
		return user;
	}

	async create_user() {
		this.logger.info(`[create_user] Creating user ${this.discord_id}`);

		// check db status
		const db = new dbcheck();
		const dbStatus = await db.check();
		if (!dbStatus) {
			this.logger.error('Database is down, aborting delete user.');
			return;
		}

		this.logger.debug(`[create_user] Database status: ${dbStatus}`);


		if (!this.discord_id) {
			this.logger.error(`[create_user] User ${this.discord_id} not found`);
			// this.error.add_error(`Error: this.discord_id: ${this.discord_id}`);
			return null;
		}
		if (!this.initialized) {
			this.logger.error(`[create_user] User ${this.discord_id} not initialized`);
			// this.error.add_error(`User not initialized`);
			return null;
		}
		const data = {
			discord_id: this.discord_id,
			discord_name: this.discord_name,
			editor_name: this.editor_name,
			admin: this.admin,
			editor_role: this.editor_role
		};

		if (this.editor_channel_id) {
			data.editor_channel_id = this.editor_channel_id;
		}
		this.logger.debug(`[create_user] User data: ${JSON.stringify(data, null, 2)}`);

		// Check if the user already exists
		const existingUser = await this.get_user();
		if (existingUser) {
			this.logger.info(`[create_user] User ${this.discord_id} already exists`);
			await this.update_user();
			return;
		}

		// Create the user
		// Send a POST request to create the user
		await axios.post(`${discordbdd}/users`, data)
			.then((response) => {
				this.logger.info(`[create_user] User ${this.discord_id} created`);
				this.logger.debug(`[create_user] User data: ${JSON.stringify(response.data, null, 2)}`);
			})
			.catch((error) => {
				this.logger.error(`[create_user] Error creating user: ${error}`);
				// this.error.add_error(`Error creating user`);
			});
	}

	async update_user({ discord_name = null, editor_name = null, admin = null, editor_role = null, editor_channel_id = null } = {}) {
		this.logger.info(`[update_user] Updating user ${this.discord_id}`);

		// check db status
		const db = new dbcheck();
		const dbStatus = await db.check();
		if (!dbStatus) {
			this.logger.error('Database is down, aborting delete user.');
			return;
		}

		this.logger.debug(`[update_user] Database status: ${dbStatus}`);

		if (!this.discord_id) {
			this.logger.error(`[update_user] User ${this.discord_id} not found`);
			// this.error.add_error(`Error: this.discord_id: ${this.discord_id}`);
			return;
		}

		if (!this.initialized) {
			this.logger.error(`[update_user] User ${this.discord_id} not initialized`);
			// this.error.add_error(`User not initialized`);
			return;
		}

		// Check if the user exists
		const existingUser = await this.get_user();
		if (!existingUser) {
			this.logger.error(`[update_user] User ${this.discord_id} not found`);
			// this.error.add_error(`User not found`);
			return;
		}

		// Update the user data
		if (discord_name) this.discord_name = discord_name;
		if (editor_name) this.editor_name = editor_name;
		if (admin) this.admin = admin;
		if (editor_role) this.editor_role = editor_role;
		if (editor_channel_id) this.editor_channel_id = editor_channel_id;

		// Update the user
		const data = {
			discord_id: this.discord_id,
		};
		if (this.editor_channel_id) data.editor_channel_id = this.editor_channel_id;
		if (this.discord_name) data.discord_name = this.discord_name;
		if (this.editor_name) data.editor_name = this.editor_name;
		if (this.admin) data.admin = this.admin;
		if (this.editor_role) data.editor_role = this.editor_role;

		// Send a PUT request to update the user
		this.logger.debug(`[update_user] User data: ${JSON.stringify(data, null, 2)}`);
		await axios.put(`${discordbdd}/users`, data)
			.then((response) => {
				this.logger.info(`[update_user] User ${this.discord_id} updated`);
				this.logger.debug(`[update_user] User data: ${JSON.stringify(response.data, null, 2)}`);
			})
			.catch((error) => {
				this.logger.error(`[update_user] Error updating user: ${error}`);
				// this.error.add_error(`Error updating user`);
			});
	}

	async delete_user() {
		this.logger.info(`[delete_user] Deleting user ${this.discord_id}`);

		// check db status
		const db = new dbcheck();
		const dbStatus = await db.check();
		if (!dbStatus) {
			this.logger.error('Database is down, aborting delete user.');
			return;
		}
		this.logger.debug(`[delete_user] Database status: ${dbStatus}`);

		if (!this.discord_id) {
			this.logger.error(`[delete_user] User ${this.discord_id} not found`);
			// this.error.add_error(`Error: this.discord_id: ${this.discord_id}`);
			return;
		}

		if (!this.initialized) {
			this.logger.error(`[delete_user] User ${this.discord_id} not initialized`);
			// this.error.add_error(`User not initialized`);
			return;
		}

		// Check if the user exists
		const existingUser = await this.get_user();
		if (!existingUser) {
			this.logger.error(`[delete_user] User ${this.discord_id} not found`);
			// this.error.add_error(`User not found`);
			return;
		}

		// Delete the user
		await axios.delete(`${discordbdd}/users/${this.discord_id}`)
			.then((response) => {
				this.logger.info(`[delete_user] User ${this.discord_id} deleted`);
				this.logger.debug(`[delete_user] User data: ${JSON.stringify(response.data)}`);
			})
			.catch((error) => {
				this.logger.error(`[delete_user] Error deleting user: ${error}`);
				// this.error.add_error(`Error deleting user`);
			});
	}

	async update_editor_channel_id() {
		this.logger.info(`[update_editor_channel_id] Updating editor channel ID for user ${this.discord_id}`);
		const categoryId = process.env.categoryb;
		if (!categoryId) {
			this.logger.error('Category ID not found');
			this.error.add_error('Category ID not found');
			return null;
		}
		this.logger.debug(`Category ID: ${categoryId}`);
		const interaction = this.interaction;
		if (!interaction) {
			this.logger.error('Interaction is null');
			this.error.add_error('Interaction is null');
			return null;
		}

		let category = null;
		try {
			category = await interaction.guild.channels.cache.get(categoryId);
			this.logger.debug(`Category: ${category}`);
		} catch (error) {
			this.logger.error(`Error fetching category: ${error}`);
			this.error.add_error(`Error fetching category: ${error}`);
			return null;
		}
	
		if (!category) {
			this.logger.error('Category not found');
			return null;
		}
	
		const userId = interaction.user.id;
	
		let foundChannel = null;
	
		category.children.cache.forEach(channel => {
			if (foundChannel) return; // Stop searching if we found the channel
			this.logger.debug(`Checking channel: ${channel.name}`);
			channel.permissionOverwrites.cache.forEach(overwrite => {
				this.logger.debug(`Checking overwrite: ${overwrite.id}`);
				if (overwrite.id === userId) {
					foundChannel = channel.id;
					this.logger.debug(`Found channel: ${channel.name} / ID: ${channel.id}`);
					return;
				}
			});
			if (foundChannel) return; // Stop searching if we found the channel
		});
	
		if (foundChannel) {
			this.logger.info(`Found channel: ${foundChannel}`);
			this.editor_channel_id = foundChannel;
		} else {
			this.logger.info('No channel found for the user');
			return null;
		}

		await this.update_user({ editor_channel_id: this.editor_channel_id });
	}

	toJSON() {
		return {
			discord_id: this.discord_id,
			discord_name: this.discord_name,
			editor_name: this.editor_name,
			admin: this.admin,
			editor_role: this.editor_role,
			editor_channel_id: this.editor_channel_id,
		};
	}
}

export default User;