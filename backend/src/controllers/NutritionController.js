const OpenAIService = require('../services/OpenAIService');
const SearchHistoryService = require('../services/SearchHistoryService');
const { validateNutritionRequest } = require('../utils/validationSchemas');
const { sanitizeInput } = require('../utils/inputSanitizer');

/**
 * Nutrition Analysis Controller
 */
class NutritionController {
    constructor() {
        this.openAIService = new OpenAIService();
        this.searchHistoryService = new SearchHistoryService();
    }

    /**
     * Test OpenAI connection
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     */
    async testConnection(req, res) {
        try {
            const result = await this.openAIService.testConnection();
            
            res.json({
                success: true,
                configured: true,
                message: result.response,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('OpenAI test error:', error);
            
            res.status(error.status || 500).json({
                success: false,
                error: error.message,
                code: error.code,
                configured: !!process.env.OPENAI_API_KEY,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Analyze food nutrition
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @param {Function} next - Next middleware
     */
    async analyzeNutrition(req, res, next) {
        try {
            // Get or create session ID
            const sessionId = this.searchHistoryService.getOrCreateSessionId(req);

            // Validate input
            const { error, value } = validateNutritionRequest(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.details[0].message,
                    timestamp: new Date().toISOString()
                });
            }

            const { food } = value;

            // Sanitize input
            const sanitizedFood = sanitizeInput(food);

            // Analyze nutrition using OpenAI
            const nutritionData = await this.openAIService.analyzeNutrition(sanitizedFood);

            // Save search to history
            const searchData = {
                query: sanitizedFood,
                totalCalories: nutritionData.totalCalories,
                servingSize: nutritionData.servingSize,
                breakdown: nutritionData.breakdown,
                macros: nutritionData.macros,
                confidence: nutritionData.confidence
            };
            
            const savedSearch = this.searchHistoryService.saveSearch(sessionId, searchData);

            res.json({
                success: true,
                query: sanitizedFood,
                data: nutritionData,
                searchId: savedSearch.id,
                sessionId: sessionId,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Nutrition analysis error:', error);
            
            if (error.status) {
                return res.status(error.status).json({
                    success: false,
                    error: error.message,
                    code: error.code,
                    timestamp: new Date().toISOString()
                });
            }
            
            next(error);
        }
    }

    /**
     * Get recent searches for breadcrumb navigation
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     */
    async getBreadcrumbs(req, res) {
        try {
            // Get or create session ID (same as in analyzeNutrition)
            const sessionId = this.searchHistoryService.getOrCreateSessionId(req);
            const limit = Math.min(parseInt(req.query.limit) || 5, 10);
            
            const breadcrumbs = this.searchHistoryService.getRecentSearches(sessionId, limit);

            res.json({
                success: true,
                data: breadcrumbs,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Breadcrumbs error:', error);
            
            res.status(500).json({
                success: false,
                error: 'Failed to load breadcrumbs',
                message: 'An error occurred while loading recent searches',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get specific search by ID
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     */
    async getSearchById(req, res) {
        try {
            const { id } = req.params;
            // Get session ID (don't create new one, just get existing)
            const sessionId = req.session?.sessionId;
            
            const search = this.searchHistoryService.getSearchById(sessionId, id);
            
            if (!search) {
                return res.status(404).json({
                    success: false,
                    error: 'Search not found',
                    timestamp: new Date().toISOString()
                });
            }

            res.json({
                success: true,
                data: search,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Get search error:', error);
            
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve search',
                message: 'An error occurred while retrieving the search',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get search history with pagination
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     */
    async getSearchHistory(req, res) {
        try {
            const sessionId = req.session?.sessionId;
            const options = {
                page: req.query.page,
                perPage: req.query.per_page
            };
            
            const historyData = this.searchHistoryService.getSearchHistory(sessionId, options);

            res.json({
                success: true,
                data: historyData,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('History error:', error);
            
            res.status(500).json({
                success: false,
                error: 'Failed to load history',
                message: 'An error occurred while loading search history',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Clear search history for current session
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     */
    async clearHistory(req, res) {
        try {
            const sessionId = req.session?.sessionId;
            
            if (sessionId) {
                this.searchHistoryService.clearHistory(sessionId);
            }

            res.json({
                success: true,
                message: 'Search history cleared',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Clear history error:', error);
            
            res.status(500).json({
                success: false,
                error: 'Failed to clear history',
                message: 'An error occurred while clearing search history',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get application statistics
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     */
    async getStats(req, res) {
        try {
            const stats = {
                totalSessions: this.searchHistoryService.getTotalSessions(),
                totalSearches: this.searchHistoryService.getTotalSearches(),
                uptime: process.uptime(),
                version: process.env.npm_package_version || '1.0.0'
            };

            res.json({
                success: true,
                data: stats,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Stats error:', error);
            
            res.status(500).json({
                success: false,
                error: 'Failed to load statistics',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Clear search history
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     */
    async clearHistory(req, res) {
        try {
            // Get session ID
            const sessionId = req.session?.sessionId;
            
            if (sessionId) {
                this.searchHistoryService.clearHistory(sessionId);
            }

            res.json({
                success: true,
                message: 'Search history cleared',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Clear history error:', error);
            
            res.status(500).json({
                success: false,
                error: 'Failed to clear history',
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = NutritionController;
