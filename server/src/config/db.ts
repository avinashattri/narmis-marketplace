import mongoose from 'mongoose';

export const connectDatabase = async (mongoUri?: string): Promise<void> => {
  const uri = mongoUri || process.env.MONGODB_URI;
  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    throw new Error(
      'MONGODB_URI is not configured or still contains placeholder values in server/.env.'
    );
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas.');
};
