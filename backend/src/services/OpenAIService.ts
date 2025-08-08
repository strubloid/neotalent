import { OpenAI } from 'openai';

/**
 * OpenAI Service
 * Handles OpenAI API interactions for nutrition analysis
 */
export class OpenAIService {
    private client: OpenAI;
    private model: string;
    private maxTokens: number;
    private temperature: number;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        console.log('🔑 Open AI Service');
        if (!apiKey) {
            console.log('⚠️ OpenAIService: No API key found, service will have limited functionality');
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
    async testConnection(): Promise<{ success: boolean; message: string; configured: boolean }> {
        if (!process.env.OPENAI_API_KEY) {
            return {
                success: false,
                configured: false,
                message: 'OpenAI API key not configured'
            };
        }

        try {
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
            
            return {
                success: true,
                configured: true,
                message: message
            };
        } catch (error: any) {
            console.error('OpenAI test error:', error);
            
            return {
                success: false,
                configured: true,
                message: error.message
            };
        }
    }

    /**
     * Analyze nutrition using OpenAI
     */
    async analyzeNutrition(foodDescription: string): Promise<any> {
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

For each food item in the foodItems array, provide individual nutrition values. Make sure the totals are the sum of individual items. Be as accurate as possible with nutritional estimates. If the description is vague, make reasonable assumptions and lower the confidence score accordingly.`;

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

        try {
            const nutritionData = JSON.parse(content);
            
            // Validate required fields
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
    }
}
