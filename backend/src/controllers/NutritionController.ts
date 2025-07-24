import { Request, Response, NextFunction } from 'express';
import { validateNutritionRequest } from '../utils/validationSchemas';
import { sanitizeInput } from '../utils/inputSanitizer';
import { OpenAIService } from '../services/OpenAIService';
import { NutritionData } from '../interfaces';

/**
 * Nutrition Analysis Controller
 */
class NutritionController {
    private openAIService: OpenAIService;

    constructor() {
        this.openAIService = new OpenAIService();
    }

    /**
     * Test OpenAI connection
     */
    public async testConnection(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.openAIService.testConnection();
            
            const statusCode = result.success ? 200 : 503;
            res.status(statusCode).json({
                ...result,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('OpenAI test error:', error);
            
            res.status(500).json({
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
                    message: 'Validation failed',
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
                    message: 'Food description cannot be empty',
                    timestamp: new Date().toISOString()
                });
                return;
            }

            // Analyze nutrition
            // Get nutrition analysis from OpenAI
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
}

export default NutritionController;
