import express from 'express';
import Message from '../models/Message.js';
const router = express.Router();

router.get('/', async (req, res) => {
  const messages = await Message.find();
  res.json(messages);
});

router.post('/', async (req, res) => {
  const message = new Message(req.body);
  await message.save();
  res.status(201).json(message);
});

export default router;
