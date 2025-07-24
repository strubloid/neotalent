import { Router, Request, Response } from 'express';
import NutritionController from '../controllers/NutritionController';
import AuthController from '../controllers/AuthController';

const router = Router();

// Create controller instances
const nutritionController = new NutritionController();
const authController = new AuthController();

/**
 * Health check endpoint
 * @route   GET /api/health
 * @desc    Application health check
 * @access  Public
 */
router.get('/health', (req: Request, res: Response) => {
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
router.get('/info', (req: Request, res: Response) => {
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

// Mount nutrition routes (commented out until converted)
// router.use('/nutrition', nutritionRoutes);

// Legacy route compatibility (to maintain existing frontend compatibility)
router.post('/calories', async (req: Request, res: Response, next) => {
    try {
        await nutritionController.analyzeNutrition(req, res, next);
    } catch (error) {
        next(error);
    }
});

router.get('/breadcrumbs', (req: Request, res: Response) => {
    nutritionController.getBreadcrumbs(req, res);
});

router.get('/searches/:id', (req: Request, res: Response) => {
    nutritionController.getSearchById(req, res);
});

router.delete('/history', (req: Request, res: Response) => {
    nutritionController.clearHistory(req, res);
});

// Test endpoint for OpenAI
router.get('/nutrition/test', async (req: Request, res: Response) => {
    try {
        await nutritionController.testConnection(req, res);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Auth routes
router.post('/auth/register', (req: Request, res: Response) => {
    authController.register(req, res);
});

router.post('/auth/login', (req: Request, res: Response) => {
    authController.login(req, res);
});

router.post('/auth/logout', (req: Request, res: Response) => {
    authController.logout(req, res);
});

router.get('/auth/me', (req: Request, res: Response) => {
    authController.getCurrentUser(req, res);
});

router.get('/auth/status', (req: Request, res: Response) => {
    authController.checkAuthStatus(req, res);
});

router.get('/auth/search-history', (req: Request, res: Response) => {
    authController.getSearchHistory(req, res);
});

router.post('/auth/search-history', (req: Request, res: Response) => {
    authController.addSearchHistory(req, res);
});

router.delete('/auth/search-history', (req: Request, res: Response) => {
    authController.clearSearchHistory(req, res);
});

router.delete('/auth/account', (req: Request, res: Response) => {
    authController.deleteAccount(req, res);
});

export default router;
