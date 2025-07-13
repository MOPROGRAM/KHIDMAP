import express from 'express';
import prisma from '../prismaClient.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const disputes = await prisma.dispute.findMany();
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching disputes' });
  }
});

router.post('/', async (req, res) => {
  try {
    const dispute = await prisma.dispute.create({ data: req.body });
    res.status(201).json(dispute);
  } catch (err) {
    res.status(500).json({ message: 'Error creating dispute' });
  }
});

export default router;
