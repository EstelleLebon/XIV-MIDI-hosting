import express from 'express';
import prisma from '../../../config/database.js';

const router = express.Router();

router.put('/', async (req, res) => {
	console.log('PUT /users');
	console.log(req.body);
	let {
		discord_id,
		discord_name,
		editor_name,
		editor_channel_id,
		admin,
		editor_role,
	} = req.body;

	const errors = [];
	if (discord_id === undefined) errors.push("discord_id is required");

	if (errors.length > 0) {
		return res.status(400).json({ error: errors.join("\n") });
	}

	const data = {}
	data.discord_id = discord_id;
	if (discord_name !== undefined) data.discord_name = discord_name;
	if (editor_name !== undefined) data.editor_name = editor_name;
	if (editor_channel_id !== undefined) data.editor_channel_id = editor_channel_id;
	if (admin !== undefined) data.admin = admin;
	if (editor_role !== undefined) data.editor_role = editor_role;

	console.log(data);
	try {
		const user = await prisma.user.update({
			where: {
				discord_id: discord_id,
			},
			data,
		});
		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error updating user' });
	}
});

export default router;