const { OpenAI } = require('openai');
const appConfig = require('../config/appConfig');

/**
 * OpenAI Service for nutrition analysis
 */
class OpenAIService {
    constructor() {
        this.client = new OpenAI({
            apiKey: appConfig.services.openai.apiKey,
        });
        this.model = appConfig.services.openai.model;
        this.maxTokens = appConfig.services.openai.maxTokens;
        this.temperature = appConfig.services.openai.temperature;
    }

    /**
     * Test OpenAI connection
     * @returns {Promise<Object>}
     */
    async testConnection() {
        try {
            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages: [{ role: "user", content: "Say 'connection successful'" }],
                max_tokens: 10,
            });

            return {
                success: true,
                response: completion.choices[0].message.content.trim()
            };
        } catch (error) {
            throw this._handleOpenAIError(error);
        }
    }

    /**
     * Analyze food nutrition using OpenAI
     * @param {string} foodDescription - Description of the food/meal
     * @returns {Promise<Object>} - Nutrition data
     */
    async analyzeNutrition(foodDescription) {
        try {
            const prompt = this._buildNutritionPrompt(foodDescription);
            
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

            const responseText = completion.choices[0].message.content.trim();
            
            try {
                const nutritionData = JSON.parse(responseText);
                return this._validateNutritionData(nutritionData);
            } catch (parseError) {
                throw new Error(`Failed to parse AI response: ${parseError.message}`);
            }

        } catch (error) {
            throw this._handleOpenAIError(error);
        }
    }

    /**
     * Build nutrition analysis prompt
     * @private
     * @param {string} foodDescription 
     * @returns {string}
     */
    _buildNutritionPrompt(foodDescription) {
        return `Analyze the following food/meal and provide detailed nutritional information in JSON format:

"${foodDescription}"

Please respond with ONLY a valid JSON object containing:
- totalCalories (number): Total estimated calories
- servingSize (string): Estimated serving size description
- breakdown (array): Array of food items with their individual calories
- macros (object): Protein, carbs, fat in grams
- confidence (string): Confidence level in this estimate (high/medium/low)

Example format:
{
  "totalCalories": 350,
  "servingSize": "1 medium apple with 2 tbsp peanut butter",
  "breakdown": [
    {"item": "Medium apple", "calories": 95},
    {"item": "2 tbsp peanut butter", "calories": 255}
  ],
  "macros": {
    "protein": 8,
    "carbs": 25,
    "fat": 16
  },
  "confidence": "high"
}

Provide realistic and accurate estimations based on common serving sizes.`;
    }

    /**
     * Validate nutrition data structure
     * @private
     * @param {Object} data 
     * @returns {Object}
     */
    _validateNutritionData(data) {
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
            breakdown: data.breakdown.map(item => ({
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
     * @private
     * @param {Error} error 
     * @returns {Error}
     */
    _handleOpenAIError(error) {
        if (error.status === 401 || error.code === 'invalid_api_key') {
            const configError = new Error('OpenAI API key is invalid or not configured');
            configError.status = 500;
            configError.code = 'OPENAI_CONFIG_ERROR';
            return configError;
        }
        
        if (error.status === 429 || error.code === 'insufficient_quota' || error.code === 'rate_limit_exceeded') {
            const quotaError = new Error('OpenAI service quota exceeded. Please try again later.');
            quotaError.status = 503;
            quotaError.code = 'OPENAI_QUOTA_EXCEEDED';
            return quotaError;
        }

        if (error.status === 400) {
            const requestError = new Error('Invalid request to OpenAI service');
            requestError.status = 400;
            requestError.code = 'OPENAI_BAD_REQUEST';
            return requestError;
        }

        // Network or connection errors
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            const networkError = new Error('Cannot connect to OpenAI service');
            networkError.status = 503;
            networkError.code = 'OPENAI_NETWORK_ERROR';
            return networkError;
        }

        // Default error handling
        const serviceError = new Error(`OpenAI service error: ${error.message}`);
        serviceError.status = 500;
        serviceError.code = 'OPENAI_SERVICE_ERROR';
        return serviceError;
    }
}

module.exports = OpenAIService;
