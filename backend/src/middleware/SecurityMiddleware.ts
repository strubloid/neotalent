import { Request, Response, NextFunction } from 'express';
import rateLimit, { RateLimitRequestHandler, Options as RateLimitOptions } from 'express-rate-limit';
import appConfig from '../config/appConfig';

/**
 * Rate Limit Message Interface
 */
interface RateLimitMessage {
    success: false;
    error: string;
    retryAfter: number;
    timestamp: string;
}

/**
 * Request Size Error Response Interface
 */
interface RequestSizeErrorResponse {
    success: false;
    error: string;
    maxSize: string;
    timestamp: string;
}

/**
 * Session Error Response Interface
 */
interface SessionErrorResponse {
    success: false;
    error: string;
    timestamp: string;
}

/**
 * Security Middleware Configuration
 */
class SecurityMiddleware {
    /**
     * Create rate limiting middleware
     */
    public static createRateLimit(options: Partial<RateLimitOptions> = {}): RateLimitRequestHandler {
        const defaultOptions: Partial<RateLimitOptions> = {
            windowMs: appConfig.security.rateLimitWindowMs,
            max: appConfig.security.rateLimitMaxRequests,
            message: {
                success: false,
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: Math.ceil(appConfig.security.rateLimitWindowMs / 1000),
                timestamp: new Date().toISOString()
            } as RateLimitMessage,
            standardHeaders: true,
            legacyHeaders: false,
            ...options
        };

        return rateLimit(defaultOptions);
    }

    /**
     * Create strict rate limiting for sensitive endpoints
     */
    public static createStrictRateLimit(): RateLimitRequestHandler {
        return this.createRateLimit({
            windowMs: 5 * 60 * 1000, // 5 minutes
            max: 10, // 10 requests per 5 minutes
            message: {
                success: false,
                error: 'Too many requests to this endpoint. Please try again later.',
                retryAfter: 300,
                timestamp: new Date().toISOString()
            } as RateLimitMessage
        });
    }

    /**
     * API rate limiting middleware
     */
    public static createAPIRateLimit(): RateLimitRequestHandler {
        return this.createRateLimit({
            windowMs: 1 * 60 * 1000, // 1 minute
            max: 30, // 30 requests per minute for API calls
            message: {
                success: false,
                error: 'API rate limit exceeded. Please slow down your requests.',
                retryAfter: 60,
                timestamp: new Date().toISOString()
            } as RateLimitMessage
        });
    }

    /**
     * Request logging middleware
     */
    public static requestLogger() {
        return (req: Request, res: Response, next: NextFunction): void => {
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
     */
    public static securityHeaders() {
        return (req: Request, res: Response, next: NextFunction): void => {
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
     */
    public static requestSizeLimit(limit: string = '10mb') {
        return (req: Request, res: Response, next: NextFunction): Response | void => {
            const contentLength = parseInt(req.get('content-length') || '0');
            const maxSize = this._parseSize(limit);
            
            if (contentLength > maxSize) {
                const errorResponse: RequestSizeErrorResponse = {
                    success: false,
                    error: 'Request entity too large',
                    maxSize: limit,
                    timestamp: new Date().toISOString()
                };
                
                return res.status(413).json(errorResponse);
            }
            
            next();
        };
    }

    /**
     * Session validation middleware
     */
    public static validateSession() {
        return (req: Request, res: Response, next: NextFunction): Response | void => {
            // Ensure session exists
            if (!req.session) {
                const errorResponse: SessionErrorResponse = {
                    success: false,
                    error: 'Session not available',
                    timestamp: new Date().toISOString()
                };
                
                return res.status(500).json(errorResponse);
            }
            
            next();
        };
    }

    /**
     * Parse size string to bytes
     * @private
     */
    private static _parseSize(size: string): number {
        const units: Record<string, number> = {
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

export default SecurityMiddleware;
