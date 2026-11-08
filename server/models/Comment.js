const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    content: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
    displayName: { type: String, required: [true, 'Display name is required'], trim: true, minlength: 2, maxlength: 40 },
    text: { type: String, required: [true, 'Comment text is required'], trim: true, minlength: 1, maxlength: 1000 },
    viewerId: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'hidden'], default: 'approved' },
  },
  { timestamps: true }
);

commentSchema.index({ content: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
