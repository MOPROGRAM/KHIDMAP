import express from 'express';
import Payment from '../models/Payment.js';
const router = express.Router();

router.get('/', async (req, res) => {
  const payments = await Payment.find();
  res.json(payments);
});

router.post('/', async (req, res) => {
  const payment = new Payment(req.body);
  await payment.save();
  res.status(201).json(payment);
});

export default router;
