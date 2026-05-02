// 404 handler — catches unmatched routes
function notFound(req, res, next) {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
}

// Error handler — 4 args (err, req, res, next) tells Express this is an error handler
function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    error: 'Server Error',
    message: err.message || 'Something went wrong'
  });
}

module.exports = { notFound, errorHandler };
