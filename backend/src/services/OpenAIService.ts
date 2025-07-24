import { OpenAI } from 'openai';
import appConfig from '../config/appConfig';

/**
 * Food Item Interface
 */
interface FoodItem {
    item: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
}

/**
 * Macronutrients Interface
 */
interface Macros {
    protein: number;
    carbs: number;
    fat: number;
}

/**
 * Nutrition Data Interface
 */
interface NutritionData {
    totalCalories: number;
    servingSize: string;
    breakdown: FoodItem[];
    macros: Macros;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    confidence: 'high' | 'medium' | 'low';
}

/**
 * Test Connection Result Interface
 */
interface TestConnectionResult {
    success: boolean;
    response: string;
}

/**
 * Custom Error Interface
 */
interface CustomError extends Error {
    status?: number;
    code?: string;
}

/**
 * OpenAI Service for nutrition analysis
 */
class OpenAIService {
    private client: OpenAI;
    private model: string;
    private maxTokens: number;
    private temperature: number;

    constructor() {
        if (!appConfig.services.openai.apiKey) {
            throw new Error('OpenAI API key is required');
        }

        this.client = new OpenAI({
            apiKey: appConfig.services.openai.apiKey,
        });
        
        this.model = appConfig.services.openai.model;
        this.maxTokens = appConfig.services.openai.maxTokens;
        this.temperature = appConfig.services.openai.temperature;
    }

    /**
     * Test OpenAI connection
     */
    public async testConnection(): Promise<TestConnectionResult> {
        try {
            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages: [{ role: "user", content: "Say 'connection successful'" }],
                max_tokens: 10,
            });

            return {
                success: true,
                response: completion.choices[0]?.message?.content?.trim() || 'No response'
            };
        } catch (error) {
            throw this.handleOpenAIError(error as Error);
        }
    }

    /**
     * Analyze food nutrition using OpenAI
     */
    public async analyzeNutrition(foodDescription: string): Promise<NutritionData> {
        try {
            const prompt = this.buildNutritionPrompt(foodDescription);
            
            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content: "You are a professional nutritionist AI that provides accurate calorie and nutritional information. Always respond with valid JSON only, no additional text or formatting."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: this.maxTokens,
                temperature: this.temperature,
            });

            const responseText = completion.choices[0]?.message?.content?.trim();
            
            if (!responseText) {
                throw new Error('No response from OpenAI');
            }

            try {
                const nutritionData = JSON.parse(responseText) as any;
                return this.validateNutritionData(nutritionData);
            } catch (parseError) {
                throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
            }

        } catch (error) {
            throw this.handleOpenAIError(error as Error);
        }
    }

    /**
     * Build nutrition analysis prompt
     */
    private buildNutritionPrompt(foodDescription: string): string {
        return `Analyze the following food/meal and provide detailed nutritional information in JSON format:

"${foodDescription}"

Please respond with ONLY a valid JSON object containing:
- totalCalories (number): Total estimated calories
- servingSize (string): Estimated serving size description
- breakdown (array): Array of food items with their individual nutrition details
- macros (object): Protein, carbs, fat in grams
- fiber (number): Total fiber in grams
- sugar (number): Total sugar in grams
- sodium (number): Total sodium in milligrams
- confidence (string): Confidence level in this estimate (high/medium/low)

Example format:
{
  "totalCalories": 350,
  "servingSize": "1 medium apple with 2 tbsp peanut butter",
  "breakdown": [
    {
      "item": "Medium apple", 
      "calories": 95,
      "protein": 0.5,
      "carbs": 25,
      "fat": 0.3,
      "fiber": 4,
      "sugar": 19,
      "sodium": 2
    },
    {
      "item": "2 tbsp peanut butter", 
      "calories": 255,
      "protein": 8,
      "carbs": 8,
      "fat": 16,
      "fiber": 2,
      "sugar": 3,
      "sodium": 140
    }
  ],
  "macros": {
    "protein": 8.5,
    "carbs": 33,
    "fat": 16.3
  },
  "fiber": 6,
  "sugar": 22,
  "sodium": 142,
  "confidence": "high"
}

For each food item in the breakdown, provide individual nutrition values (protein, carbs, fat, fiber, sugar, sodium). Make sure the totals match the sum of individual items. Provide realistic and accurate estimations based on common serving sizes.`;
    }

    /**
     * Validate nutrition data structure
     */
    private validateNutritionData(data: any): NutritionData {
        // Required fields validation
        if (!data.totalCalories || typeof data.totalCalories !== 'number') {
            throw new Error('Invalid nutrition data: totalCalories must be a number');
        }

        if (!data.breakdown || !Array.isArray(data.breakdown)) {
            throw new Error('Invalid nutrition data: breakdown must be an array');
        }

        // Set defaults for optional fields
        return {
            totalCalories: Math.round(data.totalCalories),
            servingSize: data.servingSize || 'Not specified',
            breakdown: data.breakdown.map((item: any) => ({
                item: item.item || 'Unknown item',
                calories: Math.round(item.calories || 0)
            })),
            macros: {
                protein: Math.round(data.macros?.protein || 0),
                carbs: Math.round(data.macros?.carbs || 0),
                fat: Math.round(data.macros?.fat || 0)
            },
            confidence: data.confidence || 'medium'
        };
    }

    /**
     * Handle OpenAI specific errors
     */
    private handleOpenAIError(error: any): CustomError {
        if (error.status === 401 || error.code === 'invalid_api_key') {
            const configError = new Error('OpenAI API key is invalid or not configured') as CustomError;
            configError.status = 500;
            configError.code = 'OPENAI_CONFIG_ERROR';
            return configError;
        }
        
        if (error.status === 429 || error.code === 'insufficient_quota' || error.code === 'rate_limit_exceeded') {
            const quotaError = new Error('OpenAI service quota exceeded. Please try again later.') as CustomError;
            quotaError.status = 503;
            quotaError.code = 'OPENAI_QUOTA_EXCEEDED';
            return quotaError;
        }

        if (error.status === 400) {
            const requestError = new Error('Invalid request to OpenAI service') as CustomError;
            requestError.status = 400;
            requestError.code = 'OPENAI_BAD_REQUEST';
            return requestError;
        }

        // Network or connection errors
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            const networkError = new Error('Cannot connect to OpenAI service') as CustomError;
            networkError.status = 503;
            networkError.code = 'OPENAI_NETWORK_ERROR';
            return networkError;
        }

        // Default error handling
        const serviceError = new Error(`OpenAI service error: ${error.message}`) as CustomError;
        serviceError.status = 500;
        serviceError.code = 'OPENAI_SERVICE_ERROR';
        return serviceError;
    }
}

export default OpenAIService;
