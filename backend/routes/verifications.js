import express from 'express';
import prisma from '../prismaClient.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const verifications = await prisma.verification.findMany();
    res.json(verifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching verifications' });
  }
});

router.post('/', async (req, res) => {
  try {
    const verification = await prisma.verification.create({ data: req.body });
    res.status(201).json(verification);
  } catch (err) {
    res.status(500).json({ message: 'Error creating verification' });
  }
});

export default router;
