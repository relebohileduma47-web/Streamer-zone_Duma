const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  bio: u.bio,
  avatarUrl: u.avatarUrl,
  requireCommentApproval: u.requireCommentApproval,
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ token: signToken(user._id), user: publicUser(user) });
});

// GET /api/auth/me
exports.me = (req, res) => res.json({ user: publicUser(req.user) });

exports.publicUser = publicUser;
