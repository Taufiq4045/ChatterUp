import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  username: String,
  message: String,
  imageUrl: String,
  timestamp: { type: Date, default: Date.now },
});

export const chatModel = mongoose.model('Chat', chatSchema);
