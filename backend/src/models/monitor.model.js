import mongoose from 'mongoose';

const MonitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du moniteur est requis'],
    trim: true
  },
  url: {
    type: String,
    required: [true, "L'URL cible est requise"],
    trim: true
  },
  type: {
    type: String,
    enum: ['http', 'https'],
    default: 'https'
  },
  interval: {
    type: Number,
    default: 60, // en secondes
    min: [10, "L'intervalle minimum est de 10 secondes"]
  },
  timeout: {
    type: Number,
    default: 10000, // en millisecondes
    min: [1000, 'Le timeout minimum est de 1000ms'],
    max: [30000, 'Le timeout maximum est de 30000ms']
  },
  status: {
    type: String,
    enum: ['UP', 'DOWN', 'PENDING', 'PAUSED'],
    default: 'PENDING'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastCheck: {
    type: Date,
    default: null
  },
  lastLatencyMs: {
    type: Number,
    default: 0
  },
  lastStatusCode: {
    type: Number,
    default: null
  },
  ssl: {
    valid: { type: Boolean, default: null },
    daysRemaining: { type: Number, default: null },
    issuer: { type: String, default: null },
    validTo: { type: Date, default: null },
    lastChecked: { type: Date, default: null }
  },
  alertConfig: {
    telegram: {
      enabled: { type: Boolean, default: false },
      chatId: { type: String, default: '' }
    },
    discord: {
      enabled: { type: Boolean, default: false },
      webhookUrl: { type: String, default: '' }
    }
  }
}, {
  timestamps: true
});

export const Monitor = mongoose.models.Monitor || mongoose.model('Monitor', MonitorSchema);
