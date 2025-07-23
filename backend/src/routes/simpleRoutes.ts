import { Router, Request, Response } from 'express';

console.log('🚨 DEBUG: simpleRoutes.ts is being loaded!');

const router = Router();

/**
 * Health check endpoint
 * @route   GET /api/health
 * @desc    Application health check
 * @access  Public
 */
router.get('/health', (req: Request, res: Response) => {
    console.log('🚨 DEBUG: Health endpoint hit in simpleRoutes');
    res.json({
        success: true,
        status: 'OK',
        message: 'NeoTalent Backend API is healthy (simple routes)',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

/**
 * Simple test route for calories (no OpenAI)
 */
router.post('/calories', (req: Request, res: Response) => {
    console.log('🚨 DEBUG: Simple calories endpoint hit');
    console.log('🚨 DEBUG: Request body:', req.body);
    
    // Handle both 'food' and 'foodDescription' fields from frontend
    const foodInput = req.body.food || req.body.foodDescription || 'Unknown food';
    
    console.log('🚨 DEBUG: Processing food input:', foodInput);
    
    // Mock nutritional data based on input
    let mockCalories = 95;
    let mockProtein = 0.5;
    let mockCarbs = 25;
    let mockFat = 0.3;
    
    // Simple logic to vary response based on input
    if (foodInput.toLowerCase().includes('egg')) {
        mockCalories = 155;
        mockProtein = 13;
        mockCarbs = 1;
        mockFat = 11;
    } else if (foodInput.toLowerCase().includes('banana')) {
        mockCalories = 105;
        mockProtein = 1.3;
        mockCarbs = 27;
        mockFat = 0.4;
    }
    
    const response = {
        success: true,
        message: 'Nutrition analysis completed successfully',
        data: {
            analysis: {
                calories: mockCalories,
                protein: mockProtein,
                carbs: mockCarbs,
                fat: mockFat,
                fiber: 2.4,
                sugar: 19,
                sodium: 1,
                confidence: 0.8,
                foodItems: [
                    {
                        name: foodInput,
                        quantity: '1 serving',
                        calories: mockCalories,
                        protein: mockProtein,
                        carbs: mockCarbs,
                        fat: mockFat
                    }
                ]
            },
            searchId: `simple_${Date.now()}`,
            timestamp: new Date().toISOString()
        }
    };
    
    console.log('🚨 DEBUG: Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
});

/**
 * Simple auth endpoints
 */
router.post('/auth/register', (req: Request, res: Response) => {
    console.log('🚨 DEBUG: Simple register endpoint hit');
    res.json({
        success: true,
        message: 'Simple registration (no database)',
        user: { username: req.body.username, id: `temp_${Date.now()}` }
    });
});

router.post('/auth/login', (req: Request, res: Response) => {
    console.log('🚨 DEBUG: Simple login endpoint hit');
    res.json({
        success: true,
        message: 'Simple login (no database)',
        user: { username: req.body.username, id: `temp_${Date.now()}` }
    });
});

console.log('🚨 DEBUG: simpleRoutes.ts setup complete');

export default router;
