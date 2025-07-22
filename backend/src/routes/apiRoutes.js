const express = require('express');
const nutritionRoutes = require('./nutritionRoutes');

const router = express.Router();

/**
 * Health check endpoint
 * @route   GET /api/health
 * @desc    Application health check
 * @access  Public
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

/**
 * API Information endpoint
 * @route   GET /api/info
 * @desc    API information and documentation
 * @access  Public
 */
router.get('/info', (req, res) => {
    res.json({
        success: true,
        name: 'NeoTalent Calorie Tracker API',
        version: process.env.npm_package_version || '1.0.0',
        description: 'API for analyzing food nutrition using AI',
        endpoints: {
            nutrition: '/api/nutrition',
            health: '/api/health',
            documentation: '/api/docs'
        },
        timestamp: new Date().toISOString()
    });
});

// Mount nutrition routes
router.use('/nutrition', nutritionRoutes);

// Legacy route compatibility (to maintain existing frontend compatibility)
router.use('/calories', nutritionRoutes);
router.use('/breadcrumbs', (req, res) => {
    // Redirect to new endpoint
    req.url = '/nutrition/breadcrumbs';
    nutritionRoutes(req, res);
});
router.use('/searches', (req, res) => {
    // Redirect to new endpoint
    req.url = req.url.replace('/searches', '/nutrition/search');
    nutritionRoutes(req, res);
});

module.exports = router;
