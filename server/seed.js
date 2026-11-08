// Optional: npm run seed  -> creates the creator account (if missing) and sample content (if none exists)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');
const User = require('./models/User');
const Content = require('./models/Content');

const day = 24 * 60 * 60 * 1000;
const img = (seed) => `https://picsum.photos/seed/${seed}/800/450`;

(async () => {
  await connectDB();
  await seedAdmin();
  const creator = await User.findOne();
  if (!creator) throw new Error('No creator account. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');

  if ((await Content.countDocuments()) === 0) {
    const now = Date.now();
    const base = { author: creator._id };
    const items = [
      { title: 'Getting started with React in 30 minutes', description: 'A fast tour of components, props and state for complete beginners.', category: 'Education', type: 'video', thumbnailUrl: img('react'), mediaUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', status: 'published', publishDate: new Date(now - 6 * day), featured: true, views: 120, likesCount: 0 },
      { title: 'Five gadgets I actually use every day', description: 'My honest list of tech that earned a place on my desk.', category: 'Technology', type: 'article', thumbnailUrl: img('gadgets'), articleContent: 'I tested dozens of gadgets this year.\n\nThese five stayed.\n\nA mechanical keyboard, a good webcam, a small dock, a desk lamp, and noise-cancelling headphones.', status: 'published', publishDate: new Date(now - 4 * day), featured: true, views: 80 },
      { title: 'Studio walkthrough', description: 'A look at my small home studio setup.', category: 'Lifestyle', type: 'image', thumbnailUrl: img('studio'), mediaUrl: img('studio-big'), status: 'published', publishDate: new Date(now - 2 * day), views: 45 },
      { title: 'The Creator Podcast, episode 1', description: 'Why I started creating and what I would do differently.', category: 'Entertainment', type: 'podcast', thumbnailUrl: img('podcast'), mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', status: 'published', publishDate: new Date(now - 1 * day), featured: true, views: 60 },
      { title: 'Next week: building a budget app', description: 'A scheduled tutorial that goes live automatically.', category: 'Business', type: 'video', thumbnailUrl: img('budget'), mediaUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', status: 'scheduled', publishDate: new Date(now + 7 * day) },
      { title: 'Draft: ideas for the next series', description: 'Rough notes, not ready to share.', category: 'Other', type: 'article', articleContent: 'Brainstorm...', status: 'draft' },
    ].map((i) => ({ ...base, ...i }));
    for (const item of items) await Content.create(item);
    console.log(`Inserted ${items.length} sample content items`);
  } else {
    console.log('Content already exists, skipping sample data');
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
