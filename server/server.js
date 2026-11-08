require('dotenv').config();
if (process.env.DNS_SERVERS) {
  require('dns').setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
}
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

// CORS: only the frontend origins listed in CLIENT_URL may call the API from a browser
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true); // no origin = curl/Postman
      cb(new Error(`CORS: origin ${origin} is not allowed`));
    },
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'API is running' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/contents', require('./routes/contentRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/likes', require('./routes/likeRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');
    await connectDB();
    await seedAdmin();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
})();
