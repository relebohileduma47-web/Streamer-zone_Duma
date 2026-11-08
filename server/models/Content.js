const mongoose = require('mongoose');

const CATEGORIES = ['Education', 'Technology', 'Entertainment', 'Lifestyle', 'Business', 'Other'];
const TYPES = ['video', 'article', 'image', 'podcast'];
const STATUSES = ['draft', 'published', 'scheduled'];

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, minlength: 3, maxlength: 150 },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 1000 },
    category: { type: String, enum: CATEGORIES, required: [true, 'Category is required'] },
    type: { type: String, enum: TYPES, required: [true, 'Content type is required'] },
    thumbnailUrl: { type: String, default: '', trim: true },
    mediaUrl: { type: String, default: '', trim: true },
    articleContent: { type: String, default: '' },
    status: { type: String, enum: STATUSES, default: 'draft' },
    publishDate: { type: Date },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0, min: 0 },
    likesCount: { type: Number, default: 0, min: 0 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, toJSON: { virtuals: true } } // createdAt = "date created"
);

// What the creator sees: a scheduled item whose date has passed is effectively live.
contentSchema.virtual('displayStatus').get(function () {
  if (this.status === 'draft') return 'draft';
  return this.publishDate && this.publishDate <= new Date() ? 'published' : 'scheduled';
});

contentSchema.pre('validate', function () {
  if (this.type === 'article') {
    if (!this.articleContent && !this.mediaUrl) {
      this.invalidate('articleContent', 'Article content or a media URL is required for articles');
    }
  } else if (!this.mediaUrl) {
    this.invalidate('mediaUrl', 'Media URL is required for this content type');
  }

  if (this.status === 'scheduled' && !this.publishDate) {
    this.invalidate('publishDate', 'Publication date is required for scheduled content');
  }
  if (this.status === 'published') {
    if (!this.publishDate) this.publishDate = new Date();
    else if (this.publishDate > new Date()) this.status = 'scheduled'; // future date = scheduled
  }
});

contentSchema.index({ status: 1, publishDate: -1 });
contentSchema.index({ category: 1 });

const Content = mongoose.model('Content', contentSchema);
Content.CATEGORIES = CATEGORIES;
Content.TYPES = TYPES;
Content.STATUSES = STATUSES;
module.exports = Content;
