// Custom request logger middleware.
// Logs every request with method + URL + response time.

module.exports = function logger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    const time = new Date().toISOString();
    console.log(`${time}  ${req.method.padEnd(6)} ${req.url.padEnd(30)} → ${res.statusCode}  (${ms}ms)`);
  });

  next();
};
