// 404 + error handler — extended from day 06 to handle Mongoose errors.

function notFound(req, res, next) {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`,
  });
}

function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);

  // Mongoose: bad ObjectId in URL
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ error: 'Invalid id format' });
  }

  // Mongoose: schema validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: 'Validation failed', details: messages });
  }

  // Duplicate key (e.g. unique index violation)
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate value', fields: Object.keys(err.keyPattern || {}) });
  }

  res.status(err.status || 500).json({
    error: 'Server Error',
    message: err.message || 'Something went wrong',
  });
}

module.exports = { notFound, errorHandler };
