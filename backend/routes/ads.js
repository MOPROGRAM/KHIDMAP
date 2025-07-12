import express from 'express';
import Ad from '../models/Ad.js';
const router = express.Router();

router.get('/', async (req, res) => {
  const ads = await Ad.find();
  res.json(ads);
});

router.post('/', async (req, res) => {
  const ad = new Ad(req.body);
  await ad.save();
  res.status(201).json(ad);
});

export default router;
