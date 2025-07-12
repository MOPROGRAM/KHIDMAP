import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import adsRouter from './routes/ads.js';
import paymentsRouter from './routes/payments.js';
import disputesRouter from './routes/disputes.js';
import verificationsRouter from './routes/verifications.js';
import messagesRouter from './routes/messages.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/khidmap';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/ads', adsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/disputes', disputesRouter);
app.use('/api/verifications', verificationsRouter);
app.use('/api/messages', messagesRouter);

app.get('/', (req, res) => {
  res.send('KHIDMAP Backend API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
