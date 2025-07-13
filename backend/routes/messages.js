import express from 'express';
import prisma from '../prismaClient.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const messages = await prisma.message.findMany();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

router.post('/', async (req, res) => {
  try {
    const message = await prisma.message.create({ data: req.body });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Error creating message' });
  }
});

export default router;
