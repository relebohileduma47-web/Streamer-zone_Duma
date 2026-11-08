const Comment = require('../models/Comment');
const Content = require('../models/Content');
const User = require('../models/User');
const Viewer = require('../models/Viewer');
const asyncHandler = require('../utils/asyncHandler');
const { visibleNow } = require('./contentController');

// POST /api/comments   (public)
exports.create = asyncHandler(async (req, res) => {
  const { contentId, displayName, text, viewerId } = req.body;
  const content = await Content.findOne({ _id: contentId, ...visibleNow() });
  if (!content) return res.status(404).json({ message: 'Content not found' });

  const creator = await User.findById(content.author);
  const status = creator?.requireCommentApproval ? 'pending' : 'approved';

  const comment = await Comment.create({ content: contentId, displayName, text, viewerId, status });
  if (viewerId) {
    await Viewer.findOneAndUpdate(
      { viewerId },
      { displayName, lastActiveAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  res.status(201).json({
    comment,
    message: status === 'pending' ? 'Thanks! Your comment will appear once the creator approves it.' : 'Comment posted',
  });
});

// GET /api/comments/:contentId   (public, approved only)
exports.listForContent = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ content: req.params.contentId, status: 'approved' }).sort({ createdAt: -1 });
  res.json(comments);
});

// GET /api/comments?status=   (creator only)
exports.listAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (['pending', 'approved', 'hidden'].includes(req.query.status)) filter.status = req.query.status;
  const comments = await Comment.find(filter).populate('content', 'title').sort({ createdAt: -1 });
  res.json(comments);
});

// PATCH /api/comments/:id/status   (creator only)
exports.setStatus = asyncHandler(async (req, res) => {
  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  ).populate('content', 'title');
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  res.json(comment);
});

// DELETE /api/comments/:id   (creator only)
exports.remove = asyncHandler(async (req, res) => {
  const comment = await Comment.findByIdAndDelete(req.params.id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  res.json({ message: 'Comment deleted' });
});
