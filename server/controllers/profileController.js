const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { publicUser } = require('./authController');

// GET /api/profile  (public: shown on the viewer home page)
exports.getPublicProfile = asyncHandler(async (req, res) => {
  const creator = await User.findOne().select('name bio avatarUrl');
  if (!creator) return res.status(404).json({ message: 'Creator profile has not been set up yet' });
  res.json({ name: creator.name, bio: creator.bio, avatarUrl: creator.avatarUrl });
});

// PUT /api/profile  (creator only)
exports.updateProfile = asyncHandler(async (req, res) => {
  ['name', 'bio', 'avatarUrl', 'requireCommentApproval'].forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });
  await req.user.save();
  res.json({ user: publicUser(req.user) });
});
