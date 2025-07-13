import express from 'express';
import prisma from '../prismaClient.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.post('/', async (req, res) => {
  try {
    const user = await prisma.user.create({ data: req.body });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error creating user' });
  }
});

export default router;
