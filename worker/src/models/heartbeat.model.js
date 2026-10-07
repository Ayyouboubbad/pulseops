import mongoose from 'mongoose';

const HeartbeatSchema = new mongoose.Schema({
  monitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Monitor',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['UP', 'DOWN'],
    required: true
  },
  statusCode: {
    type: Number,
    default: null
  },
  responseTimeMs: {
    type: Number,
    required: true
  },
  ssl: {
    valid: { type: Boolean, default: null },
    daysRemaining: { type: Number, default: null },
    issuer: { type: String, default: null }
  },
  errorMessage: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '30d',
    index: true
  }
});

HeartbeatSchema.index({ monitorId: 1, createdAt: -1 });

export const Heartbeat = mongoose.models.Heartbeat || mongoose.model('Heartbeat', HeartbeatSchema);
