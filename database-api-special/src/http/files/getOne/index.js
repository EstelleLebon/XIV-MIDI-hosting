import express from 'express';
import prisma from '../../../config/database.js';

const router = express.Router();

router.post('/:md5', async (req, res) => {
	console.log('GET /files:md5');
	console.log('req.params', req.params);
	const { md5 } = req.params;
	try {
		const file = await prisma.file.findOne({
			where: {
				md5
			}
		});
		if (!file) {
			return res.status(404).json({ error: 'File not found' });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: 'Internal Server Error',
		});
	}
	return res.json(file);
});

export default router;