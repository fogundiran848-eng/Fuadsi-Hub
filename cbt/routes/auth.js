const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, matric: user.matric },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

// POST /api/auth/login
router.post('/login', [
  body('matric').trim().notEmpty().withMessage('Matric number is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { matric, password } = req.body;
    const user = await User.findOne({ matric: matric.trim() });

    if (!user) {
      return res.status(401).json({ error: 'Invalid matric number or password.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account deactivated. Contact admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid matric number or password.' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: user.toSafeJSON()
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/register (admin-only, or initial admin setup with setup key)
router.post('/register', [
  body('matric').trim().notEmpty().withMessage('Matric number is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters'),
  body('level').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { matric, name, department, password, level, role, adminSetupKey } = req.body;

    // Admin registration requires setup key
    if (role === 'admin') {
      if (adminSetupKey !== process.env.ADMIN_SETUP_KEY) {
        return res.status(403).json({ error: 'Invalid admin setup key.' });
      }
    } else {
      // Student registration requires authenticated admin
      const header = req.headers.authorization;
      if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Student registration requires admin authentication.' });
      }
      try {
        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await User.findById(decoded.id);
        if (!admin || admin.role !== 'admin') {
          return res.status(403).json({ error: 'Only admins can register students.' });
        }
      } catch {
        return res.status(401).json({ error: 'Invalid or expired token.' });
      }
    }

    const existing = await User.findOne({ matric: matric.trim() });
    if (existing) {
      return res.status(400).json({ error: 'Matric number already registered.' });
    }

    const user = new User({
      matric: matric.trim(),
      name,
      department,
      level: level || '100',
      password,
      role: role === 'admin' ? 'admin' : 'student'
    });

    await user.save();
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
