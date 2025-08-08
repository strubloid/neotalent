import { OpenAI } from 'openai';

/**
 * Deepseek AI Service
 * Handles Deepseek API interactions for nutrition analysis
 */
export class DeepseekAIService {
    private client: OpenAI;
    private model: string;
    private maxTokens: number;
    private temperature: number;

    constructor() {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        console.log('🔑 Deepseek AI Service');
        if (!apiKey) {
            console.log('⚠️ DeepseekAIService: No API key found, service will have limited functionality');
        }

        this.client = new OpenAI({
            apiKey: apiKey || 'dummy-key',
            baseURL: 'https://api.deepseek.com'
        });
        
        this.model = 'deepseek-chat';
        this.maxTokens = 1000;
        this.temperature = 0.3;
    }

    /**
     * Test Deepseek AI connection
     */
    async testConnection(): Promise<{ success: boolean; message: string; configured: boolean }> {
        if (!process.env.DEEPSEEK_API_KEY) {
            return {
                success: false,
                configured: false,
                message: 'Deepseek API key not configured'
            };
        }

        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'user',
                        content: 'Hello! Please respond with "Deepseek AI connection successful" to confirm the connection is working.'
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
            console.error('Deepseek AI test error:', error);
            
            return {
                success: false,
                configured: true,
                message: error.message
            };
        }
    }

    /**
     * Analyze nutrition using Deepseek AI
     */
    async analyzeNutrition(foodDescription: string): Promise<any> {
        const prompt = `Analyze the nutritional content of: "${foodDescription}"

IMPORTANT: Respond with ONLY a valid JSON object. Do not include any explanations, markdown formatting, or additional text.

JSON structure required:
{
    "calories": <total calories as number>,
    "protein": <protein in grams as number>,
    "carbs": <carbohydrates in grams as number>,
    "fat": <fat in grams as number>,
    "fiber": <fiber in grams as number>,
    "sugar": <sugar in grams as number>,
    "sodium": <sodium in milligrams as number>,
    "confidence": <confidence level 0-1 as number>,
    "foodItems": [
        {
            "name": "<food item name>",
            "quantity": "<estimated quantity>",
            "calories": <calories for this item as number>,
            "protein": <protein for this item as number>,
            "carbs": <carbs for this item as number>,
            "fat": <fat for this item as number>,
            "fiber": <fiber for this item as number>,
            "sugar": <sugar for this item as number>,
            "sodium": <sodium for this item as number>
        }
    ]
}

Respond with ONLY the JSON object, no other text.`;

        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a nutritionist AI that provides accurate nutritional analysis. You MUST respond with ONLY valid JSON. Do not include any explanations, markdown formatting, code blocks, or additional text outside the JSON object.'
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
            throw new Error('No response content from Deepseek AI');
        }

        try {
            // Clean the response content to extract JSON
            let jsonContent = content.trim();
            
            console.log('🔍 Raw Deepseek response:', jsonContent);
            
            // Remove markdown code blocks if present
            if (jsonContent.startsWith('```json')) {
                jsonContent = jsonContent.replace(/^```json\s*\n?/, '').replace(/\n?\s*```$/, '');
            } else if (jsonContent.startsWith('```')) {
                jsonContent = jsonContent.replace(/^```\s*\n?/, '').replace(/\n?\s*```$/, '');
            }
            
            // Additional cleanup for any remaining markdown
            jsonContent = jsonContent.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
            
            console.log('🧹 Cleaned JSON content:', jsonContent);
            
            const nutritionData = JSON.parse(jsonContent);
            
            console.log('✅ Successfully parsed nutrition data:', nutritionData);
            
            // Validate required fields
            if (typeof nutritionData.calories !== 'number' || 
                typeof nutritionData.protein !== 'number' || 
                typeof nutritionData.carbs !== 'number' || 
                typeof nutritionData.fat !== 'number') {
                throw new Error('Invalid nutrition data structure - missing numeric values');
            }

            return nutritionData;
        } catch (parseError) {
            console.error('❌ Failed to parse Deepseek AI response:', content);
            console.error('❌ Parse error details:', parseError);
            throw new Error('Failed to parse nutrition analysis response');
        }
    }
}
