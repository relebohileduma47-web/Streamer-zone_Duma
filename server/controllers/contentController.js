const Content = require('../models/Content');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const asyncHandler = require('../utils/asyncHandler');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const EDITABLE = [
  'title', 'description', 'category', 'type', 'thumbnailUrl',
  'mediaUrl', 'articleContent', 'status', 'publishDate', 'featured',
];
const pick = (body) =>
  EDITABLE.reduce((acc, key) => (body[key] !== undefined ? { ...acc, [key]: body[key] } : acc), {});

// Content that viewers are allowed to see right now
const visibleNow = () => ({ status: { $in: ['published', 'scheduled'] }, publishDate: { $lte: new Date() } });

const searchFilter = (q) => {
  const rx = new RegExp(escapeRegex(q.trim()), 'i');
  return { $or: [{ title: rx }, { description: rx }] };
};

// GET /api/contents?q=&category=&featured=&page=&limit=   (public, published only)
exports.listPublished = asyncHandler(async (req, res) => {
  const { q, category, featured } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);

  const filter = visibleNow();
  if (category && category !== 'All') filter.category = category;
  if (featured === 'true') filter.featured = true;
  if (q && q.trim()) Object.assign(filter, searchFilter(q));

  const [items, total] = await Promise.all([
    Content.find(filter)
      .select('-articleContent')
      .sort({ publishDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Content.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

// GET /api/contents/manage/all?status=&q=   (creator only, includes drafts)
exports.listAll = asyncHandler(async (req, res) => {
  const { status, q } = req.query;
  const filter = {};
  if (status === 'draft') filter.status = 'draft';
  if (status === 'published') Object.assign(filter, visibleNow());
  if (status === 'scheduled') Object.assign(filter, { status: 'scheduled', publishDate: { $gt: new Date() } });
  if (q && q.trim()) Object.assign(filter, searchFilter(q));
  const items = await Content.find(filter).select('-articleContent').sort({ createdAt: -1 });
  res.json({ items, total: items.length });
});

// GET /api/contents/:id   (public for live content; creator can open anything)
exports.getOne = asyncHandler(async (req, res) => {
  const content = await Content.findById(req.params.id);
  const isLive = content && content.status !== 'draft' && content.publishDate <= new Date();
  if (!content || (!isLive && !req.user)) return res.status(404).json({ message: 'Content not found' });
  res.json(content);
});

// POST /api/contents/:id/view   (public, records one view)
exports.recordView = asyncHandler(async (req, res) => {
  const content = await Content.findOneAndUpdate(
    { _id: req.params.id, ...visibleNow() },
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!content) return res.status(404).json({ message: 'Content not found' });
  res.json({ views: content.views });
});

// POST /api/contents   (creator only)
exports.create = asyncHandler(async (req, res) => {
  const content = await Content.create({ ...pick(req.body), author: req.user._id });
  res.status(201).json(content);
});

// PUT /api/contents/:id   (creator only)
exports.update = asyncHandler(async (req, res) => {
  const content = await Content.findById(req.params.id);
  if (!content) return res.status(404).json({ message: 'Content not found' });
  content.set(pick(req.body));
  await content.save(); // runs schema validation + status/date rules
  res.json(content);
});

// DELETE /api/contents/:id   (creator only)
exports.remove = asyncHandler(async (req, res) => {
  const content = await Content.findByIdAndDelete(req.params.id);
  if (!content) return res.status(404).json({ message: 'Content not found' });
  await Promise.all([Comment.deleteMany({ content: content._id }), Like.deleteMany({ content: content._id })]);
  res.json({ message: 'Content deleted' });
});

exports.visibleNow = visibleNow;
