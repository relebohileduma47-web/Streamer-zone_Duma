const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getUserFromRequest = async (req) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return { error: 'Not authorised: no token provided' };
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return { error: 'Not authorised: user no longer exists' };
    return { user };
  } catch (err) {
    return { error: 'Not authorised: invalid or expired token' };
  }
};

// Blocks the request unless a valid creator token is supplied
exports.protect = async (req, res, next) => {
  const { user, error } = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ message: error });
  req.user = user;
  next();
};

// Attaches req.user when a valid token is present, but never blocks
exports.optionalAuth = async (req, res, next) => {
  const { user } = await getUserFromRequest(req);
  if (user) req.user = user;
  next();
};
