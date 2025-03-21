const axios = require('axios');
const discordbdd = process.env.discordbdd;
const token = process.env.apitoken;

// router.get('/:id', getUsers);
const get_user = async (discord_id) => {
    if (!discord_id) {
        throw new Error('Missing required parameter: discord_id');
    }
    try {
        const response = await axios.get(`${discordbdd}/users/${discord_id}`, {
            family: 4 // Force IPv4
        });

        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        console.error('Error getting user:', error);
        throw error;
    }
};

// router.post('/', setUser);
const add_user = async (discord_id, discord_name, editor_name, editor_channel_id = null, admin = false, editor_role = false) => {
    if (!discord_id || !discord_name || !editor_name) {
        const missingParams = [];
        if (!discord_id) missingParams.push('discord_id');
        if (!discord_name) missingParams.push('discord_name');
        if (!editor_name) missingParams.push('editor_name');
        throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
    }
    try {
        const requestData = {
            discord_id: discord_id,
            discord_name: discord_name,
            editor_name: editor_name,
            admin: Boolean(admin),
            editor_role: Boolean(editor_role)
        };

        // Add optional fields only if they have valuesRS
        if (editor_channel_id !== null) {
            requestData.editor_channel_id = editor_channel_id;
        }

        const response = await axios.post(
            `${discordbdd}/users`,
            requestData, // Pass the request data here
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                family: 4 // Force IPv4
            }
        );

        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            console.error('Error adding user:', error.response.data);
        } else {
            console.error('Error adding user:', error.message);
        }
        throw error;
    }
};


// router.put('/:id', updateUser);
const update_user = async (user) => {
    console.log('Updating user:', user);
    user.admin = Boolean(user.admin);
    user.editor_role = Boolean(user.editor_role);
    try {
        const response = await axios.put(`${discordbdd}/users/`, user, {
            family: 4 // Force IPv4
        });

        return response.data;
    } catch (error) {
        console.error('Error updating user:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : error.message;
    }
}

// router.delete('/:id', deleteUser);
const delete_user = async (discord_id) => {
    if (!discord_id) {
        throw new Error('Missing required parameter: discord_id');
    }
    try {
        const response = await axios.delete(`${discordbdd}/users/${discord_id}`, {
            family: 4 // Force IPv4
        });
      return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

module.exports = {
    add_user,
    get_user,
    update_user,
    delete_user
};