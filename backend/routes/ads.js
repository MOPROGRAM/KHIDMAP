import express from 'express';
import prisma from '../prismaClient.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const ads = await prisma.ad.findMany();
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching ads' });
  }
});

router.post('/', async (req, res) => {
  try {
    const ad = await prisma.ad.create({ data: req.body });
    res.status(201).json(ad);
  } catch (err) {
    res.status(500).json({ message: 'Error creating ad' });
  }
});

export default router;
