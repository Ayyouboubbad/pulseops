import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:pulseopssecret@localhost:27017/pulseops?authSource=admin';

/**
 * DevOps Resilience Pattern:
 * Reconnexion automatique avec boucle de retry au démarrage du conteneur
 */
export const connectDatabase = async (maxRetries = 10, delayMs = 3000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('🚀 [MongoDB] Connected successfully to database');
      return;
    } catch (error) {
      console.warn(`⚠️ [MongoDB] Tentative de connexion ${attempt}/${maxRetries} échouée (${error.message}). Nouvelle tentative dans ${delayMs / 1000}s...`);
      if (attempt === maxRetries) {
        console.error('❌ [MongoDB] Impossible de se connecter après le nombre max de tentatives.');
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ [MongoDB] Disconnected from database');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ [MongoDB] Reconnected to database');
});

export const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const stateMap = {
      0: 'disconnected',
      1: 'healthy',
      2: 'connecting',
      3: 'disconnecting'
    };

    if (state === 1) {
      const pingResult = await mongoose.connection.db.admin().ping();
      return {
        status: pingResult.ok === 1 ? 'healthy' : 'degraded',
        readyState: stateMap[state]
      };
    }

    return {
      status: 'down',
      readyState: stateMap[state] || 'unknown'
    };
  } catch (error) {
    return {
      status: 'down',
      error: error.message
    };
  }
};
