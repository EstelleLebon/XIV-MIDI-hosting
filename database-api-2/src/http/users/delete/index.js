import express from 'express';
import prisma from '../../../config/database.js';

const router = express.Router();

router.delete('/:discord_id', async (req, res) => {
	console.log('DELETE /users/:discord_id');
	console.log('req.params:', req.params);

	const { discord_id } = req.params;

	try {
		await prisma.user.delete({
		where: {
			discord_id: parseInt(discord_id),
		},
	});
	}
	catch (error) {
		console.error(error);
		return res.status(500).json({
			message: 'Internal Server Error',
		});
	}

});

export default router;