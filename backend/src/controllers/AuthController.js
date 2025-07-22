const User = require('../models/User');
const { inputSanitizer } = require('../utils/inputSanitizer');
const { authSchemas } = require('../utils/validationSchemas');

/**
 * Authentication Controller
 * Handles user registration, login, logout, and user management
 */
class AuthController {
    /**
     * Register a new user
     * @route   POST /api/auth/register
     * @desc    Register a new user with username, password, and nickname
     * @access  Public
     */
    async register(req, res) {
        try {
            // Validate input
            const { error, value } = authSchemas.register.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    details: error.details[0].message
                });
            }

            // Sanitize input
            const sanitized = inputSanitizer.sanitizeObject(value);
            const { username, password, nickname } = sanitized;

            // Check if user already exists
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Username already exists'
                });
            }

            // Create new user
            const user = new User({
                username,
                password,
                nickname
            });

            await user.save();

            // Return success response (without password)
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: {
                    id: user._id,
                    username: user.username,
                    nickname: user.nickname,
                    createdAt: user.createdAt
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during registration'
            });
        }
    }

    /**
     * Login user
     * @route   POST /api/auth/login
     * @desc    Authenticate user and create session
     * @access  Public
     */
    async login(req, res) {
        try {
            // Validate input
            const { error, value } = authSchemas.login.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    details: error.details[0].message
                });
            }

            // Sanitize input
            const sanitized = inputSanitizer.sanitizeObject(value);
            const { username, password } = sanitized;

            // Find user
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Check password
            const isValidPassword = await user.comparePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Create session
            req.session.userId = user._id.toString();
            req.session.username = user.username;
            req.session.nickname = user.nickname;
            req.session.isAuthenticated = true;

            // Save session
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Session creation failed'
                    });
                }

                res.json({
                    success: true,
                    message: 'Login successful',
                    user: {
                        id: user._id,
                        username: user.username,
                        nickname: user.nickname
                    }
                });
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during login'
            });
        }
    }

    /**
     * Logout user
     * @route   POST /api/auth/logout
     * @desc    Destroy user session
     * @access  Private
     */
    async logout(req, res) {
        try {
            if (!req.session.isAuthenticated) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            // Destroy session
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destruction error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Logout failed'
                    });
                }

                // Clear session cookie
                res.clearCookie('neotalent.sid');
                
                res.json({
                    success: true,
                    message: 'Logout successful'
                });
            });

        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during logout'
            });
        }
    }

    /**
     * Delete user account
     * @route   DELETE /api/auth/delete
     * @desc    Delete current user account
     * @access  Private
     */
    async deleteAccount(req, res) {
        try {
            if (!req.session.isAuthenticated) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            const userId = req.session.userId;

            // Find and delete user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            await User.findByIdAndDelete(userId);

            // Destroy session
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destruction error after account deletion:', err);
                }

                // Clear session cookie
                res.clearCookie('neotalent.sid');
                
                res.json({
                    success: true,
                    message: 'Account deleted successfully'
                });
            });

        } catch (error) {
            console.error('Account deletion error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during account deletion'
            });
        }
    }

    /**
     * Get current user info
     * @route   GET /api/auth/me
     * @desc    Get current authenticated user information
     * @access  Private
     */
    async getCurrentUser(req, res) {
        try {
            if (!req.session.isAuthenticated) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            const userId = req.session.userId;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                user: {
                    id: user._id,
                    username: user.username,
                    nickname: user.nickname,
                    createdAt: user.createdAt
                }
            });

        } catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Check authentication status
     * @route   GET /api/auth/status
     * @desc    Check if user is authenticated
     * @access  Public
     */
    async checkAuthStatus(req, res) {
        res.json({
            success: true,
            isAuthenticated: !!req.session.isAuthenticated,
            user: req.session.isAuthenticated ? {
                id: req.session.userId,
                username: req.session.username,
                nickname: req.session.nickname
            } : null
        });
    }
}

module.exports = AuthController;
