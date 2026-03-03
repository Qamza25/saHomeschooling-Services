// backend/src/routes/auth.js
// Handles register, login (including hard-coded admin), /me, and /logout
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();

// JWT Configuration with better defaults and validation
const JWT_SECRET = process.env.JWT_SECRET || '71822C577C1F2AEA3A88402A16719283BE6950EE4EDB1A9040CCF6FF94FDE4CB';

// IMPORTANT: Always use a string for expiresIn, never a number without quotes
// Valid formats: '7d', '24h', '604800' (as string), 604800 (as number - seconds)
let JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

// Validate that expiresIn is in the correct format
// If it's a pure number without quotes in .env, it will come as string "7d" which is fine
// If someone accidentally set it as just 7d without quotes, it would cause the error
console.log(`[AUTH] JWT_EXPIRES configured as: "${JWT_EXPIRES}"`);

// Ensure expiresIn is a valid value (either string with unit or number in seconds)
function validateExpiresIn(expiresIn) {
  // If it's already a number, use it directly (seconds)
  if (!isNaN(expiresIn)) {
    return parseInt(expiresIn, 10);
  }
  // If it's a string with valid format (e.g., '7d', '24h'), use it
  if (typeof expiresIn === 'string' && /^\d+[dhmsw]?$/.test(expiresIn)) {
    return expiresIn;
  }
  // Default fallback to 7 days
  console.warn(`[AUTH] Invalid JWT_EXPIRES format: "${expiresIn}", using default "7d"`);
  return '7d';
}

// Safe expiresIn value
const SAFE_JWT_EXPIRES = validateExpiresIn(JWT_EXPIRES);

function signToken(payload) {
  // Log what we're using for debugging
  console.log(`[AUTH] Signing token with expiresIn:`, SAFE_JWT_EXPIRES);
  return jwt.sign(payload, JWT_SECRET, { expiresIn: SAFE_JWT_EXPIRES });
}

const ADMIN_EMAIL    = (process.env.ADMIN_EMAIL    || 'admin@sahomeschooling.co.za').toLowerCase();
const ADMIN_PASSWORD =  process.env.ADMIN_PASSWORD || 'AdminPass123!';
const ADMIN_NAME     =  process.env.ADMIN_NAME     || 'SA Homeschooling Admin';

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'PROVIDER', name, accountType } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const trimmedEmail = email.trim().toLowerCase();

    // Block anyone from registering the admin email
    if (trimmedEmail === ADMIN_EMAIL)
      return res.status(409).json({ message: 'An account with this email already exists.' });

    const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (existing)
      return res.status(409).json({ message: 'An account with this email already exists.' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await prisma.user.create({
      data: {
        email:       trimmedEmail,
        password:    hashed,
        role:        role.toUpperCase(),
        name:        name        || null,
        accountType: accountType || 'Individual Provider',
      },
    });

    console.log(`[AUTH] REGISTER: ${trimmedEmail} (${user.role})`);

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name, accountType: user.accountType },
    });
  } catch (error) {
    console.error('POST /api/auth/register error:', error);
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const trimmedEmail = email.trim().toLowerCase();

    // ── Admin shortcut — checked BEFORE the database ─────────────────────────
    if (trimmedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = signToken({ userId: 'admin', email: trimmedEmail, role: 'ADMIN' });
      console.log(`[AUTH] LOGIN (admin): ${trimmedEmail}`);
      return res.json({
        message: 'Login successful',
        token,
        user: { id: 'admin', email: trimmedEmail, role: 'ADMIN', name: ADMIN_NAME },
      });
    }

    // ── Normal DB-backed login ────────────────────────────────────────────────
    const user = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });

    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    console.log(`[AUTH] LOGIN: ${trimmedEmail} (${user.role})`);

    return res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name, accountType: user.accountType },
    });
  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/auth/me  — verify token, return current user
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.slice(7);
    let decoded;
    try { decoded = jwt.verify(token, JWT_SECRET); }
    catch { return res.status(401).json({ message: 'Invalid or expired token' }); }

    // Admin virtual user — no DB row exists
    if (decoded.userId === 'admin') {
      return res.json({ id: 'admin', email: decoded.email, role: 'ADMIN', name: ADMIN_NAME });
    }

    const user = await prisma.user.findUnique({
      where:  { id: decoded.userId },
      select: { id: true, email: true, role: true, name: true, accountType: true, lastLogin: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/logout  — stateless JWT, just acknowledge
// ─────────────────────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  console.log('[AUTH] LOGOUT received');
  return res.json({ message: 'Logged out successfully' });
});

module.exports = router;