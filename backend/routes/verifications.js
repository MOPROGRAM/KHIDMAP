import express from 'express';
import Verification from '../models/Verification.js';
const router = express.Router();

router.get('/', async (req, res) => {
  const verifications = await Verification.find();
  res.json(verifications);
});

router.post('/', async (req, res) => {
  const verification = new Verification(req.body);
  await verification.save();
  res.status(201).json(verification);
});

export default router;
