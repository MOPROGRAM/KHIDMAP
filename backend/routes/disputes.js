import express from 'express';
import Dispute from '../models/Dispute.js';
const router = express.Router();

router.get('/', async (req, res) => {
  const disputes = await Dispute.find();
  res.json(disputes);
});

router.post('/', async (req, res) => {
  const dispute = new Dispute(req.body);
  await dispute.save();
  res.status(201).json(dispute);
});

export default router;
