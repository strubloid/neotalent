import { Request, Response, NextFunction } from 'express';
import OpenAIService from '../services/OpenAIService';
// import SearchHistoryService from '../services/SearchHistoryService';
import { validateNutritionRequest } from '../utils/validationSchemas';
import { sanitizeInput } from '../utils/inputSanitizer';

/**
 * Nutrition Analysis Controller
 */
class NutritionController {
    private openAIService: OpenAIService;
    // private searchHistoryService: SearchHistoryService;

    constructor() {
        this.openAIService = new OpenAIService();
        // this.searchHistoryService = new SearchHistoryService();
    }

    /**
     * Test OpenAI connection
     */
    public async testConnection(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.openAIService.testConnection();
            
            res.json({
                success: true,
                configured: true,
                message: result.response,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
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
     */
    public async analyzeNutrition(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Validate request body
            const { error, value } = validateNutritionRequest(req.body);
            if (error) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.details[0].message,
                    timestamp: new Date().toISOString()
                });
                return;
            }

            // Sanitize input
            const foodDescription = sanitizeInput(value.food);
            
            if (!foodDescription.trim()) {
                res.status(400).json({
                    success: false,
                    error: 'Food description cannot be empty',
                    timestamp: new Date().toISOString()
                });
                return;
            }

            // Analyze nutrition
            const nutritionData = await this.openAIService.analyzeNutrition(foodDescription);
            
            res.json({
                success: true,
                data: nutritionData,
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            console.error('Nutrition analysis error:', error);
            next(error);
        }
    }

    /**
     * Get breadcrumbs (placeholder)
     */
    public getBreadcrumbs(req: Request, res: Response): void {
        res.json({
            success: true,
            breadcrumbs: [
                { name: 'Home', path: '/' },
                { name: 'Nutrition', path: '/nutrition' }
            ],
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Get search by ID (placeholder)
     */
    public getSearchById(req: Request, res: Response): void {
        res.status(404).json({
            success: false,
            error: 'Search not found',
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Clear history (placeholder)
     */
    public clearHistory(req: Request, res: Response): void {
        res.json({
            success: true,
            message: 'History cleared',
            timestamp: new Date().toISOString()
        });
    }
}

export default NutritionController;
