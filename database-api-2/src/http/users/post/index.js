import express from 'express';
import prisma from '../../../config/database.js';

const router = express.Router();

router.post('/', async (req, res) => {
	console.log('POST /users');
	console.log(req.body);
	// Destructure the request body
	let {
		discord_id,
		discord_name,
		editor_name,
		editor_channel_id = null,
		admin = false,
		editor_role = false,
	} = req.body;

	const errors = [];
	if (discord_id === undefined) errors.push("discord_id is required");
	if (discord_name === undefined) errors.push("discord_name is required");
	if (editor_name === undefined) errors.push("editor_name is required");

	if (errors.length > 0) {
		return res.status(400).json({ error: errors.join("\n") });
	}
	
	// Create a new user
	try {	
		const user = await prisma.user.create({
			data: {
				discord_id,
				discord_name,
				editor_name,
				editor_channel_id,
				admin,
				editor_role,
			},
		});
		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error creating user' });
	}
});

export default router;