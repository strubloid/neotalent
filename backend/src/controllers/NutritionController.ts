import { Request, Response, NextFunction } from 'express';
import { validateNutritionRequest } from '../utils/validationSchemas';
import { sanitizeInput } from '../utils/inputSanitizer';
import { OpenAIService } from '../services/OpenAIService';
import { DeepseekAIService } from '../services/DeepseekAIService';
import { NutritionData } from '../interfaces';

/**
 * Nutrition Analysis Controller
 */
class NutritionController {
    private aiService: OpenAIService | DeepseekAIService;

    constructor() {
        this.aiService = new OpenAIService();
        // this.aiService = new DeepseekAIService();
    }

    /**
     * Test AI service connection
     */
    public async testConnection(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.aiService.testConnection();
            
            const statusCode = result.success ? 200 : 503;
            res.status(statusCode).json({
                ...result,
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error('AI service test error:', error);
            
            // Check which service we're using for proper error reporting
            const isUsingDeepseek = this.aiService instanceof DeepseekAIService;
            const apiKeyConfigured = isUsingDeepseek ? 
                !!process.env.DEEPSEEK_API_KEY : 
                !!process.env.OPENAI_API_KEY;
            
            res.status(500).json({
                success: false,
                error: error.message,
                code: error.code,
                configured: apiKeyConfigured,
                service: isUsingDeepseek ? 'Deepseek AI' : 'OpenAI',
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

            // Analyze nutrition using the configured AI service
            const nutritionData = await this.aiService.analyzeNutrition(foodDescription);
            
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
