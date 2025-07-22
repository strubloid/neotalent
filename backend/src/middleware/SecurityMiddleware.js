const rateLimit = require('express-rate-limit');
const appConfig = require('../config/appConfig');

/**
 * Security Middleware Configuration
 */
class SecurityMiddleware {
    /**
     * Create rate limiting middleware
     * @param {Object} options - Rate limit options
     * @returns {Function} - Express middleware
     */
    static createRateLimit(options = {}) {
        const defaultOptions = {
            windowMs: appConfig.security.rateLimitWindowMs,
            max: appConfig.security.rateLimitMaxRequests,
            message: {
                success: false,
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: Math.ceil(appConfig.security.rateLimitWindowMs / 1000),
                timestamp: new Date().toISOString()
            },
            standardHeaders: true,
            legacyHeaders: false,
            ...options
        };

        return rateLimit(defaultOptions);
    }

    /**
     * Create strict rate limiting for sensitive endpoints
     * @returns {Function} - Express middleware
     */
    static createStrictRateLimit() {
        return this.createRateLimit({
            windowMs: 5 * 60 * 1000, // 5 minutes
            max: 10, // 10 requests per 5 minutes
            message: {
                success: false,
                error: 'Too many requests to this endpoint. Please try again later.',
                retryAfter: 300,
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * API rate limiting middleware
     * @returns {Function} - Express middleware
     */
    static createAPIRateLimit() {
        return this.createRateLimit({
            windowMs: 1 * 60 * 1000, // 1 minute
            max: 30, // 30 requests per minute for API calls
            message: {
                success: false,
                error: 'API rate limit exceeded. Please slow down your requests.',
                retryAfter: 60,
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Request logging middleware
     * @returns {Function} - Express middleware
     */
    static requestLogger() {
        return (req, res, next) => {
            const start = Date.now();
            
            // Log request
            console.log(`${req.method} ${req.url} - ${req.ip} - ${new Date().toISOString()}`);
            
            // Log response when finished
            res.on('finish', () => {
                const duration = Date.now() - start;
                console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
            });
            
            next();
        };
    }

    /**
     * Security headers middleware
     * @returns {Function} - Express middleware
     */
    static securityHeaders() {
        return (req, res, next) => {
            // Remove X-Powered-By header
            res.removeHeader('X-Powered-By');
            
            // Add security headers
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            
            next();
        };
    }

    /**
     * Request size limiting middleware
     * @param {string} limit - Size limit (e.g., '10mb')
     * @returns {Function} - Express middleware
     */
    static requestSizeLimit(limit = '10mb') {
        return (req, res, next) => {
            const contentLength = parseInt(req.get('content-length') || '0');
            const maxSize = this._parseSize(limit);
            
            if (contentLength > maxSize) {
                return res.status(413).json({
                    success: false,
                    error: 'Request entity too large',
                    maxSize: limit,
                    timestamp: new Date().toISOString()
                });
            }
            
            next();
        };
    }

    /**
     * Session validation middleware
     * @returns {Function} - Express middleware
     */
    static validateSession() {
        return (req, res, next) => {
            // Ensure session exists
            if (!req.session) {
                return res.status(500).json({
                    success: false,
                    error: 'Session not available',
                    timestamp: new Date().toISOString()
                });
            }
            
            next();
        };
    }

    /**
     * Parse size string to bytes
     * @private
     * @param {string} size - Size string
     * @returns {number} - Size in bytes
     */
    static _parseSize(size) {
        const units = {
            'b': 1,
            'kb': 1024,
            'mb': 1024 * 1024,
            'gb': 1024 * 1024 * 1024
        };
        
        const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/);
        if (!match) return 0;
        
        const [, num, unit] = match;
        return parseFloat(num) * (units[unit] || 1);
    }
}

module.exports = SecurityMiddleware;
