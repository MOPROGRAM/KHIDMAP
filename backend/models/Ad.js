import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Ad', adSchema);
