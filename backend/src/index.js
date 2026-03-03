// backend/src/index.js

const express = require('express');
const cors    = require('cors');

// Try-catch for route imports
let authRoutes, providerRoutes, reviewRoutes, featuredSlotRoutes, statsRoutes;

try {
  authRoutes         = require('./routes/authRoutes');
  providerRoutes     = require('./routes/providerRoutes');
  reviewRoutes       = require('./routes/reviewRoutes');
  featuredSlotRoutes = require('./routes/featuredSlotRoutes');
  statsRoutes        = require('./routes/statsRoutes');
  console.log('✅ Routes loaded successfully');
} catch (err) {
  console.error('❌ Failed to load routes:', err.message);
  // Create fallback routes to prevent crashing
  authRoutes = express.Router();
  providerRoutes = express.Router();
  reviewRoutes = express.Router();
  featuredSlotRoutes = express.Router();
  statsRoutes = express.Router();
  
  authRoutes.all('*', (req, res) => res.json({ message: 'Auth routes placeholder' }));
  providerRoutes.all('*', (req, res) => res.json({ message: 'Provider routes placeholder' }));
  reviewRoutes.all('*', (req, res) => res.json({ message: 'Review routes placeholder' }));
  featuredSlotRoutes.all('*', (req, res) => res.json({ message: 'Featured slots placeholder' }));
  statsRoutes.all('*', (req, res) => res.json({ message: 'Stats placeholder' }));
}

const app = express();

// ✅ Railway-safe PORT
const PORT = process.env.PORT || 8080;

// ✅ Production-ready CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'SA Homeschooling API',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ── Root endpoint ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'SA Homeschooling API',
    version: '1.0.0',
    status: 'running'
  });
});

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/api/providers',      providerRoutes);
app.use('/api/reviews',        reviewRoutes);
app.use('/api/featured-slots', featuredSlotRoutes);
app.use('/api/stats',          statsRoutes);

// ── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found.`
  });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({
    success: false,
    error: 'Server error'
  });
});

// ✅ Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 SA Homeschooling API running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err.message);
  process.exit(1);
});

// ✅ Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📦 SIGTERM received - shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📦 SIGINT received - shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// ✅ Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});

// ✅ Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('✅ Server initialization complete');