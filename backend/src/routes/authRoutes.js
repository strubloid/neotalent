const express = require('express');
const AuthController = require('../controllers/AuthController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// Create a single instance of the auth controller
const authController = new AuthController();

/**
 * Authentication Routes
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public (guest only)
 */
router.post('/register', 
    AuthMiddleware.requireGuest,
    (req, res) => authController.register(req, res)
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and create session
 * @access  Public (guest only)
 */
router.post('/login',
    AuthMiddleware.requireGuest,
    (req, res) => authController.login(req, res)
);

/**
 * @route   POST /api/auth/logout
 * @desc    Destroy user session
 * @access  Private
 */
router.post('/logout',
    AuthMiddleware.requireAuth,
    (req, res) => authController.logout(req, res)
);

/**
 * @route   DELETE /api/auth/delete
 * @desc    Delete current user account
 * @access  Private
 */
router.delete('/delete',
    AuthMiddleware.requireAuth,
    (req, res) => authController.deleteAccount(req, res)
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user information
 * @access  Private
 */
router.get('/me',
    AuthMiddleware.requireAuth,
    (req, res) => authController.getCurrentUser(req, res)
);

/**
 * @route   GET /api/auth/status
 * @desc    Check authentication status
 * @access  Public
 */
router.get('/status',
    (req, res) => authController.checkAuthStatus(req, res)
);

module.exports = router;
