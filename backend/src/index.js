// backend/src/index.js

const express = require('express');
const cors    = require('cors');

const authRoutes         = require('./routes/authRoutes');
const providerRoutes     = require('./routes/providerRoutes');
const reviewRoutes       = require('./routes/reviewRoutes');
const featuredSlotRoutes = require('./routes/featuredSlotRoutes');
const statsRoutes        = require('./routes/statsRoutes');

const app = express();

// ✅ Railway-safe PORT
const PORT = process.env.PORT || 5000;

// ✅ Production-ready CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

// ✅ MUST use process.env.PORT for Railway
app.listen(PORT, () => {
  console.log(`\n🚀 SA Homeschooling API running on port ${PORT}`);
});