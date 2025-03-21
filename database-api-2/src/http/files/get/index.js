import express from 'express';
import prisma from '../../../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
	console.log('GET /files');
	console.log('req.query', req.query);

	let {
		md5 = null,
		editor_discord_id = null,
		editor = null,
		artist = null,
		title = null,
		performer = null,
		sources = null,
		comments = null,
		tags = null,
		instrument = null,
		discord = null,
		website = null,
		editor_channel = null,
		page = 1,
		limit = 10000000,
	} = req.query;

	const skip = (page - 1) * limit;

	const filter = {};
	if (md5 !== null) filter.md5 = md5;
	if (editor_discord_id !== null) filter.editor_discord_id = editor_discord_id;
	if (editor !== null) filter.editor = editor;
	if (artist !== null) filter.artist = artist;
	if (title !== null) filter.title = title;
	if (performer !== null) filter.performer = performer;
	if (sources !== null) filter.sources = sources;
	if (comments !== null) filter.comments = comments;
	if (tags !== null) filter.tags = { hasSome: tags.split(',') };
	if (instrument !== null) filter.tracks = { some: { instrument } };
	if (discord !== null) filter.discord = discord === 'true';
	if (website !== null) filter.website = website === 'true';
	if (editor_channel !== null) filter.editor_channel = editor_channel === 'true';

	console.log('Filter:', filter);

	try {
		const files = await prisma.file.findMany({
		where: filter,
		skip: parseInt(skip, 10),
		take: parseInt(limit, 10),
		include: {
			tracks: true, // Inclure les relations Track
		},
		});

		const totalRecords = await prisma.file.count({
		where: filter,
		});

		const response = {
		files,
		totalPages: Math.ceil(totalRecords / limit),
		totalRecords,
		};

		res.status(200).json(response);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

export default router;