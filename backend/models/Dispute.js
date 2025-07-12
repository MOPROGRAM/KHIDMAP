import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ad: { type: mongoose.Schema.Types.ObjectId, ref: 'Ad' },
  reason: String,
  status: { type: String, enum: ['open', 'resolved', 'rejected'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Dispute', disputeSchema);
