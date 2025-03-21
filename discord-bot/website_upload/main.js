const checkMidi = require('../commands/utils/upload_modules/file_checks');
const createLogger = require('../logger/logger');
const { get_user, add_user, update_user } = require('../utils/user_db_tools');
const logger = createLogger('upload_from_website');
const checkEditorChannel = require('./modules/editor_channel_id');



// Upload a file from the website
const upload_from_website = async (file) => {
	logger.info('upload_from_website');
	logger.debug('file', JSON.stringify(file, null, 2));
	const errors = [];
	if (md5 === undefined) {
		errors.push('md5 is required');
	} else {
		if (typeof md5 !== 'string') {
			errors.push('md5 must be a string');
		}
	}
	if (editor_discord_id === undefined) {
		errors.push('editor_discord_id is required');
	} else {
		if (typeof editor_discord_id !== 'string') {
			errors.push('editor_discord_id must be a string');
		}
	}
	if (editor === undefined) {
		errors.push('editor is required');
	} else {
		if (typeof editor !== 'string') {
			errors.push('editor must be a string');
		}
	}
	if (artist === undefined) {
		errors.push('artist is required');
	} else {
		if (typeof artist !== 'string') {
			errors.push('artist must be a string');
		}
	}
	if (title === undefined) {
		errors.push('title is required');
	} else {
		if (typeof title !== 'string') {
			errors.push('title must be a string');
		}
	}
	if (performer === undefined) {
		errors.push('performer is required');
	} else {
		if (typeof performer !== 'string') {
			errors.push('performer must be a string');
		}
	}
	if (sources === undefined) {
		errors.push('sources is required');
	} else {
		if (typeof sources !== 'string') {
			errors.push('sources must be a string');
		}
	}
	if (comments === undefined) {
		errors.push('comments is required');
	} else {
		if (typeof comments !== 'string') {
			errors.push('comments must be a string');
		}
	}
	if (tags === undefined) {
		errors.push('tags is required');
	} else {
		if (!Array.isArray(tags)) {
			errors.push('tags must be an array');
		}
	}
	if (song_duration === undefined) {
		errors.push('song_duration is required (seconds)');
	} else {
		song_duration = Number(song_duration);
		if (isNaN(song_duration)) {
			errors.push('song_duration must be a number (seconds)');
		}
	}
	if (tracks === undefined) {
		errors.push('tracks is required');
	} else {
		if (!Array.isArray(tracks)) {
			errors.push('tracks must be an array');
		}
	}
	if (discord !== 'true' && discord !== 'false' && discord !== true && discord !== false) {
		errors.push('discord must be a boolean');
	} else {
		if (discord === 'true') discord = true;
		if (discord === 'false') discord = false;
	}
	if (website !== 'true' && website !== 'false' && website !== true && website !== false) {
		errors.push('website must be a boolean');
	} else {
		if (website === 'true') website = true;
		if (website === 'false') website = false;
	}
	if (editor_channel !== 'true' && editor_channel !== 'false' && editor_channel !== true && editor_channel !== false) {
		errors.push('editor_channel must be a boolean');
	} else {
		if (editor_channel === 'true') editor_channel = true;
		if (editor_channel === 'false') editor_channel = false;
	}
	if (file.buffer === undefined) {
		errors.push('file.buffer is required');
	} else {
		if (!Buffer.isBuffer(file.buffer)) {
			errors.push('file.buffer must be a buffer');
		}
	}	
	if (errors.length > 0) {
		logger.error('errors', errors.join("\n"));
		return errors.join("\n");
	}
	const midiBuffer = file.buffer;
	
	// USER part
	const user = await get_user(file.editor_discord_id);
	if (user === null) {
		logger.debug('user not found');
		user.discord_id = file.editor_discord_id;
		user.discord_name = file.editor;
		user.editor_name = file.editor;
		await add_user(user);
		logger.debug('user added');
	}
	if (user.editor_name !== file.editor) {
		user.editor_name = file.editor;
		await update_user(user);
		logger.debug('user updated');
	}

	// check editor channel
	const check1 = await checkEditorChannel(file.editor_channel, file.editor_discord_id);
	switch (check1) {
		case null:
			logger.error('editor_channel not found');
			return 'editor_channel not found';
		case true:
			logger.debug('editor_channel push disabled');
			break;
		default:
			file.editor_channel_id = check1;
			logger.debug('editor_channel push enabled');
			break;
	}
	// check file validity
	const check2 = await checkMidi(midiBuffer);
	if (check2 !== true) {
		logger.error('file not valid');
		return 'file not valid';
	}

	// get md5 status


	// get tracks infos


	// get file duration


	// process pushes


	// process discord


	// process website


	// process editor_channel

};


module.exports = upload_from_website;