import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:pulseopssecret@localhost:27017/pulseops?authSource=admin';

export const connectDatabase = async (maxRetries = 10, delayMs = 3000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('🚀 [Worker DB] Connected successfully to MongoDB');
      return;
    } catch (error) {
      console.warn(`⚠️ [Worker DB] Tentative ${attempt}/${maxRetries} échouée (${error.message}). Nouvelle tentative dans ${delayMs / 1000}s...`);
      if (attempt === maxRetries) {
        console.error('❌ [Worker DB] Impossible de se connecter après le nombre max de tentatives.');
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
};
