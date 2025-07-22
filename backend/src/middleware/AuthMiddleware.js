/**
 * Authentication Middleware
 * Provides authentication-related middleware functions
 */
class AuthMiddleware {
    /**
     * Middleware to require authentication
     * Use this middleware on routes that require user to be logged in
     */
    static requireAuth(req, res, next) {
        if (!req.session || !req.session.isAuthenticated) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        // Attach user info to request for easy access
        req.user = {
            id: req.session.userId,
            username: req.session.username,
            nickname: req.session.nickname
        };

        next();
    }

    /**
     * Middleware to require guest (not authenticated)
     * Use this middleware on routes that should only be accessible to non-authenticated users
     */
    static requireGuest(req, res, next) {
        if (req.session && req.session.isAuthenticated) {
            return res.status(403).json({
                success: false,
                message: 'Already authenticated',
                code: 'ALREADY_AUTH'
            });
        }

        next();
    }

    /**
     * Middleware to optionally authenticate
     * Use this middleware on routes that work for both authenticated and non-authenticated users
     */
    static optionalAuth(req, res, next) {
        if (req.session && req.session.isAuthenticated) {
            req.user = {
                id: req.session.userId,
                username: req.session.username,
                nickname: req.session.nickname
            };
        } else {
            req.user = null;
        }

        next();
    }

    /**
     * Middleware to check session validity and refresh user data if needed
     */
    static async validateSession(req, res, next) {
        if (!req.session || !req.session.isAuthenticated) {
            return next();
        }

        try {
            // Check if user still exists in database
            const User = require('../models/User');
            const user = await User.findById(req.session.userId);
            
            if (!user) {
                // User was deleted, destroy session
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Session destruction error after user not found:', err);
                    }
                });
                
                return res.status(401).json({
                    success: false,
                    message: 'Session invalid - user no longer exists',
                    code: 'INVALID_SESSION'
                });
            }

            // Update session with current user data (in case nickname was changed)
            req.session.username = user.username;
            req.session.nickname = user.nickname;

            next();
        } catch (error) {
            console.error('Session validation error:', error);
            next();
        }
    }
}

module.exports = AuthMiddleware;
