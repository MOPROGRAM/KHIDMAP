import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import adsRouter from './routes/ads.js';
import paymentsRouter from './routes/payments.js';
import disputesRouter from './routes/disputes.js';
import verificationsRouter from './routes/verifications.js';
import messagesRouter from './routes/messages.js';

import logger from './logger.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.path}`);
  next();
});

const PORT = process.env.PORT || 5000;

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/ads', adsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/disputes', disputesRouter);
app.use('/api/verifications', verificationsRouter);
app.use('/api/messages', messagesRouter);
import uploadsRouter from './routes/uploads.js';
app.use('/api/uploads', uploadsRouter);

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.send('KHIDMAP Backend API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});