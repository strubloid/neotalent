import { Request, Response, NextFunction } from 'express';
// import OpenAIService from '../services/OpenAIService';
// import SearchHistoryService from '../services/SearchHistoryService';
import { validateNutritionRequest } from '../utils/validationSchemas';
import { sanitizeInput } from '../utils/inputSanitizer';
import { OpenAI } from 'openai';

/**
 * Nutrition Data Interface
 */
interface NutritionData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    confidence: number;
    foodItems: Array<{
        name: string;
        quantity: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    }>;
}

/**
 * Nutrition Analysis Controller
 */
class NutritionController {
    private client: OpenAI;
    private model: string;
    private maxTokens: number;
    private temperature: number;

    constructor() {
        // Hardcoded config to avoid appConfig dependency
        const apiKey = process.env.OPENAI_API_KEY;
        
        if (!apiKey) {
            console.log('⚠️ NutritionController: No OpenAI API key found, service will have limited functionality');
        }

        this.client = new OpenAI({
            apiKey: apiKey || 'dummy-key'
        });
        
        this.model = 'gpt-3.5-turbo';
        this.maxTokens = 1000;
        this.temperature = 0.3;
    }

    /**
     * Test OpenAI connection
     */
    public async testConnection(req: Request, res: Response): Promise<void> {
        try {
            if (!process.env.OPENAI_API_KEY) {
                res.status(503).json({
                    success: false,
                    configured: false,
                    message: 'OpenAI API key not configured',
                    timestamp: new Date().toISOString()
                });
                return;
            }

            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'user',
                        content: 'Hello! Please respond with "OpenAI connection successful" to confirm the connection is working.'
                    }
                ],
                max_tokens: 20,
                temperature: 0
            });

            const message = response.choices[0]?.message?.content || 'No response';
            
            res.json({
                success: true,
                configured: true,
                message: message,
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
            // Get nutrition analysis from OpenAI
            const nutritionData = await this.analyzeNutritionWithAI(foodDescription);
            
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
     * Analyze nutrition using OpenAI
     */
    private async analyzeNutritionWithAI(foodDescription: string): Promise<NutritionData> {
        try {
            const prompt = `Analyze the nutritional content of: "${foodDescription}"

Please provide a JSON response with the following structure:
{
    "calories": <total calories>,
    "protein": <protein in grams>,
    "carbs": <carbohydrates in grams>,
    "fat": <fat in grams>,
    "fiber": <fiber in grams>,
    "sugar": <sugar in grams>,
    "sodium": <sodium in milligrams>,
    "confidence": <confidence level 0-1>,
    "foodItems": [
        {
            "name": "<food item name>",
            "quantity": "<estimated quantity>",
            "calories": <calories for this item>,
            "protein": <protein for this item>,
            "carbs": <carbs for this item>,
            "fat": <fat for this item>,
            "fiber": <fiber for this item>,
            "sugar": <sugar for this item>,
            "sodium": <sodium for this item>
        }
    ]
}

For each food item in the foodItems array, provide individual nutrition values (protein, carbs, fat, fiber, sugar, sodium). Make sure the totals are the sum of individual items. Be as accurate as possible with nutritional estimates. If the description is vague, make reasonable assumptions and lower the confidence score accordingly.`;

            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a nutritionist AI that provides accurate nutritional analysis. Always respond with valid JSON only.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: this.maxTokens,
                temperature: this.temperature
            });

            const content = response.choices[0]?.message?.content;
            
            if (!content) {
                throw new Error('No response content from OpenAI');
            }

            // Try to parse the JSON response
            try {
                const nutritionData = JSON.parse(content);
                
                // Validate required fields (allow 0 values)
                if (typeof nutritionData.calories !== 'number' || 
                    typeof nutritionData.protein !== 'number' || 
                    typeof nutritionData.carbs !== 'number' || 
                    typeof nutritionData.fat !== 'number') {
                    throw new Error('Invalid nutrition data structure - missing numeric values');
                }

                return nutritionData;
            } catch (parseError) {
                console.error('❌ Failed to parse OpenAI response:', content);
                throw new Error('Failed to parse nutrition analysis response');
            }

        } catch (error: any) {
            console.error('❌ Nutrition analysis failed:', error);
            throw error;
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
