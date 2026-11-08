exports.notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({ message: errors[0]?.message || 'Validation failed', errors });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: `Invalid ${err.path}` });
  if (err.code === 11000) return res.status(409).json({ message: 'Duplicate record' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body' });
  if (err.message && err.message.startsWith('CORS')) return res.status(403).json({ message: err.message });

  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
};
