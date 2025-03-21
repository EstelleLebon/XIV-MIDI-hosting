import express from 'express';
import prisma from '../../../config/database.js';

const router = express.Router();

router.get('/:discord_id', async (req, res) => {
	console.log('GET /users/:discord_id');
	console.log('req.params:', req.params);

	const { discord_id } = req.params;

	const user = await prisma.user.findUnique({
		where: {
			discord_id: discord_id,
		},
	});

	if (!user) {
		return res.status(404).json({
			message: 'User not found',
		});
	}

	res.json(user);
});

export default router;