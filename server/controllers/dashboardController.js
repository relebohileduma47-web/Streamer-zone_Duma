const Content = require('../models/Content');
const Comment = require('../models/Comment');
const asyncHandler = require('../utils/asyncHandler');
const { visibleNow } = require('./contentController');

// GET /api/dashboard/stats   (creator only)
exports.stats = asyncHandler(async (req, res) => {
  const now = new Date();
  const [totalContent, published, drafts, scheduled, totalComments, pendingComments, totals, popular, recentComments] =
    await Promise.all([
      Content.countDocuments(),
      Content.countDocuments(visibleNow()),
      Content.countDocuments({ status: 'draft' }),
      Content.countDocuments({ status: 'scheduled', publishDate: { $gt: now } }),
      Comment.countDocuments(),
      Comment.countDocuments({ status: 'pending' }),
      Content.aggregate([{ $group: { _id: null, views: { $sum: '$views' }, likes: { $sum: '$likesCount' } } }]),
      Content.find(visibleNow()).select('title views likesCount category').sort({ views: -1 }).limit(5),
      Comment.find().populate('content', 'title').sort({ createdAt: -1 }).limit(5),
    ]);

  res.json({
    totalContent,
    published,
    drafts,
    scheduled,
    totalComments,
    pendingComments,
    totalViews: totals[0]?.views || 0,
    totalLikes: totals[0]?.likes || 0,
    popular,
    recentComments,
  });
});
