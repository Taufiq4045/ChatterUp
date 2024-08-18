import mongoose from 'mongoose';

// MongoDB connection
export const connect = async () => {
  await mongoose
    .connect('mongodb://localhost:27017/chatterup', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
};
