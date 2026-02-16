const crypto = require('crypto');

/**
 * Extract IP address from request
 * Handles proxies and load balancers
 */
function getClientIp(req) {
  // Check for forwarded IP (behind proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  // Check for real IP header
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }
  
  // Fallback to connection remote address
  return req.connection.remoteAddress || req.socket.remoteAddress || req.ip;
}

/**
 * Hash IP address using SHA-256
 * Ensures privacy while maintaining uniqueness
 */
function hashIp(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

/**
 * Get hashed IP from request
 */
function getHashedIp(req) {
  const ip = getClientIp(req);
  return hashIp(ip);
}

module.exports = {
  getClientIp,
  hashIp,
  getHashedIp
};
