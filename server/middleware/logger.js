/**
 * API Request/Response Logging Middleware
 * 
 * Purpose: Track all incoming requests and outgoing responses for debugging
 * Logs include: method, URL, status code, response time, and payload (without passwords)
 * 
 * Usage: app.use(requestLogger); // Add early in middleware stack
 */

const requestLogger = (req, res, next) => {
  // ⏱️ Start timer to measure response time
  const startTime = Date.now();

  // 🔐 Function to sanitize sensitive data from logs (remove passwords)
  const sanitizeData = (data) => {
    if (!data) return data;
    const sanitized = { ...data };
    if (sanitized.password) sanitized.password = '***REDACTED***';
    if (sanitized.confirmPassword) sanitized.confirmPassword = '***REDACTED***';
    if (sanitized.token) sanitized.token = '***REDACTED***';
    return sanitized;
  };

  // 📥 Log incoming request
  console.log(
    `\n📨 [${new Date().toISOString()}] ${req.method.toUpperCase()} ${req.path}`,
    `\n   IP: ${req.ip}`,
    `\n   Body: ${JSON.stringify(sanitizeData(req.body))}`
  );

  // 🎯 Intercept the response to log it
  const originalJson = res.json;
  res.json = function(data) {
    // ⏱️ Calculate response time
    const duration = Date.now() - startTime;

    // 📤 Log outgoing response
    const statusColor = data?.success ? '✅' : '❌';
    console.log(
      `${statusColor} [${new Date().toISOString()}] Response: ${res.statusCode}`,
      `(${duration}ms)`,
      `\n   Message: ${data?.message || data?.error || 'Success'}`,
      `\n   Data: ${JSON.stringify(sanitizeData(data))}\n`
    );

    // Send response
    return originalJson.call(this, data);
  };

  next();
};

module.exports = requestLogger;
