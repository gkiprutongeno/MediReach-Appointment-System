module.exports = (req, res, next) => {
  let rawBody = '';
  req.on('data', (chunk) => {
    rawBody += chunk.toString();
  });
  req.on('end', () => {
    console.log(`Raw request body for ${req.method} ${req.originalUrl}:`, rawBody);
    next();
  });
};
