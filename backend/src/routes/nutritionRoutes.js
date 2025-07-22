const express = require('express');
const NutritionController = require('../controllers/NutritionController');
const SecurityMiddleware = require('../middleware/SecurityMiddleware');

const router = express.Router();
const nutritionController = new NutritionController();

// Apply API rate limiting to all routes
router.use(SecurityMiddleware.createAPIRateLimit());

/**
 * @route   GET /api/nutrition/test
 * @desc    Test OpenAI connection
 * @access  Public
 */
router.get('/test', (req, res) => {
    nutritionController.testConnection(req, res);
});

/**
 * @route   POST /api/nutrition/analyze
 * @desc    Analyze food nutrition
 * @access  Public
 */
router.post('/analyze', (req, res, next) => {
    nutritionController.analyzeNutrition(req, res, next);
});

/**
 * @route   GET /api/nutrition/breadcrumbs
 * @desc    Get recent searches for breadcrumb navigation
 * @access  Public
 */
router.get('/breadcrumbs', (req, res) => {
    nutritionController.getBreadcrumbs(req, res);
});

/**
 * @route   GET /api/nutrition/history
 * @desc    Get search history with pagination
 * @access  Public
 */
router.get('/history', (req, res) => {
    nutritionController.getSearchHistory(req, res);
});

/**
 * @route   GET /api/nutrition/search/:id
 * @desc    Get specific search by ID
 * @access  Public
 */
router.get('/search/:id', (req, res) => {
    nutritionController.getSearchById(req, res);
});

/**
 * @route   DELETE /api/nutrition/history
 * @desc    Clear search history for current session
 * @access  Public
 */
router.delete('/history', (req, res) => {
    nutritionController.clearHistory(req, res);
});

/**
 * @route   GET /api/nutrition/stats
 * @desc    Get application statistics
 * @access  Public
 */
router.get('/stats', (req, res) => {
    nutritionController.getStats(req, res);
});

module.exports = router;
