import { Router, Request, Response } from 'express';
import NutritionController from '../controllers/NutritionController';
// import nutritionRoutes from './nutritionRoutes';

const router = Router();

// Create a single instance of the nutrition controller
const nutritionController = new NutritionController();

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
router.post('/calories', (req: Request, res: Response, next) => {
    nutritionController.analyzeNutrition(req, res, next);
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
router.get('/nutrition/test', (req: Request, res: Response) => {
    nutritionController.testConnection(req, res);
});

export default router;
