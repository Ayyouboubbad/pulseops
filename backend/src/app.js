import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRoutes from './routes/health.routes.js';
import monitorRoutes from './routes/monitor.routes.js';
import metricsRoutes from './routes/metrics.routes.js';

const app = express();

// Security & Parsing Middlewares
app.use(helmet());
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Database Readiness Guard (DevOps Best Practice: prevent 500 buffer timeouts)
import mongoose from 'mongoose';
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') && !req.path.startsWith('/api/health') && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: 'La base de données est en cours d\'initialisation, veuillez patienter...'
    });
  }
  next();
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/monitors', monitorRoutes);
app.use('/api/metrics', metricsRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'PulseOps Core API',
    version: '1.0.0',
    description: 'Distributed Uptime & Server Monitoring Platform',
    status: 'online',
    endpoints: {
      health: '/api/health',
      monitors: '/api/monitors',
      metrics: '/api/metrics/summary'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('💥 [API Error]:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

export default app;
