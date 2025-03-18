const axios = require('axios');
const discordbdd = process.env.discordbdd;

const buildQueryString = (params) => {
    return Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
};

// router.get('/', getallfiles );
const getallfiles = async () => {
    try {
        const response = await axios.get(`${discordbdd}/files`, {
            family: 4 // Force IPv4
        });

        return response.data;
    } catch (error) {
        console.error('Error getting all files:', error);
        throw error;
    }
}


// const filter = {
//      md5: 'some-md5-hash',
//      editor: 'editor-name',
//      artist: 'artist-name',
//      title: 'file-title',
//      performer: 'Solo',
//      tags: ['tag1', 'tag2'],
//      instrument: 'Piano',
//      discord: true,
//      website: false,
//      editor_channel: true,
//      page: 1,
//      limit: 100
// };

// router.get('/', filter );
const getfilteredfiles = async (filter) => {
    try {
        const queryString = buildQueryString(filter);
        console.log(`Query string: ${queryString}`);
        const response = await axios.get(`${discordbdd}/files?${queryString}`, {
            family: 4 // Force IPv4
        });
        console.log(`Response data: ${JSON.stringify(response.data)}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        console.error('Error getting filtered files:', error);
        throw error;
    }
}

const updatefile = async (file) => {
    try {
        console.log('Sending file data:', file);
        const response = await axios.put(`${discordbdd}/files`, file, {
            headers: {
                'Content-Type': 'application/json'
            },
            family: 4 // Force IPv4
        });

        console.log('Response data:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating file:', error);
        throw error;
    }
};

// router.delete('/:md5', deletefile);
const deletefile = async (md5) => {
    if (!md5) {
        throw new Error('Missing required parameter: md5');
    }
    try {
        const response = await axios.delete(`${discordbdd}/files?${md5}`, {
            family: 4 // Force IPv4
        });

        return response.data;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

const setfile = async (file) => {
    try {
        const response = await axios.post(`${discordbdd}/files`, file, {
            headers: {
                'Content-Type': 'application/json'
            },
            family: 4 // Force IPv4
        });

        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            console.error('Error adding file:', error.response.data);
        } else {
            console.error('Error adding file:', error.message);
        }
        throw error;
    }
};


module.exports = {
    getallfiles,
    getfilteredfiles,
    setfile,
    updatefile,
    deletefile
};