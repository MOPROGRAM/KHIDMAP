import express from 'express';
import prisma from '../prismaClient.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payment = await prisma.payment.create({ data: req.body });
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Error creating payment' });
  }
});

export default router;
