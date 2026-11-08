const mongoose = require('mongoose');
const dns = require('dns');

module.exports = async function connectDB() {
  // Optional: use custom DNS servers (helps on networks where SRV lookups fail)
  if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set. Add it to server/.env or your hosting environment variables.');
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
};