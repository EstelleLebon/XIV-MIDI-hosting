import express from 'express';
import prisma from '../../../config/database.js';

const router = express.Router();

router.post('/', async (req, res) => {
	console.log('POST /files');
	console.log('req.body', req.body);
	let {
		md5,
		editor_discord_id,
		editor,
		artist,
		title,
		performer,
		sources,
		comments,
		tags,
		song_duration,
		tracks,
		discord = false,
		website = false,
		editor_channel = false,
		discord_message_id = null,
		discord_link = null,
		website_file_path = null,
		website_link = null,
		editor_channel_id = null,
		editor_channel_link = null,
	} = req.body;

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
	if (discord_message_id !== null) {
		if (typeof discord_message_id !== 'string') {
			errors.push('discord_message_id must be a string');
		}
	}
	if (discord_link !== null) {
		if (typeof discord_link !== 'string') {
			errors.push('discord_link must be a string');
		}
	}
	if (website_file_path !== null) {
		if (typeof website_file_path !== 'string') {
			errors.push('website_file_path must be a string');
		}
	}
	if (website_link !== null) {
		if (typeof website_link !== 'string') {
			errors.push('website_link must be a string');
		}
	}
	if (editor_channel_id !== null) {
		if (typeof editor_channel_id !== 'string') {
			errors.push('editor_channel_id must be a string');
		}
	}
	if (editor_channel_link !== null) {
		if (typeof editor_channel_link !== 'string') {
			errors.push('editor_channel_link must be a string');
		}
	}

	if (errors.length > 0) {
		return res.status(400).json({ error: errors.join("\n") });
	}

	try {
		const file = await prisma.file.create({
			data: {
				md5,
				editor_discord_id,
				editor,
				artist,
				title,
				performer,
				sources,
				comments,
				tags,
				song_duration,
				tracks: {
					create: tracks.map(track => ({
					  ...track,
					  name: track.name.replace(/\0/g, ''),
					  instrument: track.instrument.replace(/\0/g, ''),
					})),
				},
				discord,
				website,
				editor_channel,
				discord_message_id,
				discord_link,
				website_file_path,
				website_link,
				editor_channel_id,
				editor_channel_link,
			},
		});
		res.json(file);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error creating file' });
	}
});

export default router;