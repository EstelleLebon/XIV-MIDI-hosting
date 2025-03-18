import express from 'express';
import prisma from '../../../config/database.js';

const router = express.Router();

router.put('/', async (req, res) => {
	console.log('PUT /files');
	console.log('req.body', req.body);

	let {
		md5,
		discord = null,
		website = null,
		editor_channel = null,
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
	if (discord !== null) {
		if (discord !== 'true' && discord !== 'false' && discord !== true && discord !== false) {
			errors.push('discord must be a boolean');
		} else {
			if (discord === 'true') discord = true;
			if (discord === 'false') discord = false;
		}
	}
	if (website !== null){
		if (website !== 'true' && website !== 'false' && website !== true && website !== false) {
			errors.push('website must be a boolean');
		} else {
			if (website === 'true') website = true;
			if (website === 'false') website = false;
		}
	}
	if (editor_channel !== null) {
		if (editor_channel !== 'true' && editor_channel !== 'false' && editor_channel !== true && editor_channel !== false) {
			errors.push('editor_channel must be a boolean');
		} else {
			if (editor_channel === 'true') editor_channel = true;
			if (editor_channel === 'false') editor_channel = false;
		}
	}
	if (discord_message_id !== null && typeof discord_message_id !== 'string') {
		errors.push('discord_message_id must be a string');
	}
	if (discord_link !== null && typeof discord_link !== 'string') {
		errors.push('discord_link must be a string');
	}
	if (website_file_path !== null && typeof website_file_path !== 'string') {
		errors.push('website_file_path must be a string');
	}
	if (website_link !== null && typeof website_link !== 'string') {
		errors.push('website_link must be a string');
	}
	if (editor_channel_id !== null && typeof editor_channel_id !== 'string') {
		errors.push('editor_channel_id must be a string');
	}
	if (editor_channel_link !== null && typeof editor_channel_link !== 'string') {
		errors.push('editor_channel_link must be a string');
	}

	if (errors.length > 0) {
		return res.status(400).json({ error: errors.join('\n') });
	}

	const data = {
		md5,
		discord,
		website,
		editor_channel,
		discord_message_id,
		discord_link,
		website_file_path,
		website_link,
		editor_channel_id,
		editor_channel_link,
	};

	for (const key in data) {
		if (data[key] === null) {
			delete data[key];
		}
	}

	try {
		const file = await prisma.file.update({
			where: { md5 },
			data,
		});
		res.json(file);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error updating file' });
	}
});

export default router;