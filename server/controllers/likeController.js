const Like = require('../models/Like');
const Content = require('../models/Content');
const Viewer = require('../models/Viewer');
const asyncHandler = require('../utils/asyncHandler');
const { visibleNow } = require('./contentController');

const syncCount = async (contentId) => {
  const likesCount = await Like.countDocuments({ content: contentId });
  await Content.findByIdAndUpdate(contentId, { likesCount });
  return likesCount;
};

// POST /api/likes   (public). Toggles: first call likes, second call removes the like.
exports.toggle = asyncHandler(async (req, res) => {
  const { contentId, viewerId } = req.body;
  const content = await Content.findOne({ _id: contentId, ...visibleNow() });
  if (!content) return res.status(404).json({ message: 'Content not found' });

  const existing = await Like.findOne({ content: contentId, viewerId });
  let liked;
  if (existing) {
    await existing.deleteOne();
    liked = false;
  } else {
    try {
      await Like.create({ content: contentId, viewerId });
    } catch (err) {
      if (err.code !== 11000) throw err; // double-click race: already liked
    }
    liked = true;
    await Viewer.findOneAndUpdate(
      { viewerId },
      { lastActiveAt: new Date() },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }
  res.status(liked ? 201 : 200).json({ liked, likesCount: await syncCount(contentId) });
});

// GET /api/likes/:contentId?viewerId=   (public)
exports.status = asyncHandler(async (req, res) => {
  const { contentId } = req.params;
  const [likesCount, mine] = await Promise.all([
    Like.countDocuments({ content: contentId }),
    req.query.viewerId ? Like.exists({ content: contentId, viewerId: req.query.viewerId }) : null,
  ]);
  res.json({ likesCount, liked: Boolean(mine) });
});
