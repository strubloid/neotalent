const express = require('express');
const Joi = require('joi');
const { OpenAI } = require('openai');

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validation schema
const calorieRequestSchema = Joi.object({
  food: Joi.string().min(1).max(500).required().messages({
    'string.empty': 'Food input is required',
    'string.max': 'Food input must be less than 500 characters',
    'any.required': 'Food input is required'
  })
});

// POST /api/calories - Get calorie information for food
router.post('/', async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = calorieRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const { food } = value;

    // Sanitize input
    const sanitizedFood = food.trim().replace(/[<>]/g, '');

    // Create AI prompt
    const prompt = `Analyze the following food/meal and provide detailed nutritional information in JSON format:

"${sanitizedFood}"

Please respond with ONLY a valid JSON object containing:
- totalCalories (number): Total estimated calories
- servingSize (string): Estimated serving size
- breakdown (array): Array of food items with their individual calories
- macros (object): Protein, carbs, fat in grams
- confidence (string): How confident you are in this estimate (high/medium/low)

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
}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a nutritionist AI that provides accurate calorie and nutritional information. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0].message.content;

    // Parse AI response
    let nutritionData;
    try {
      nutritionData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('AI response parsing error:', parseError);
      throw new Error('Failed to parse nutrition data');
    }

    // Validate AI response structure
    if (!nutritionData.totalCalories || !nutritionData.breakdown) {
      throw new Error('Invalid nutrition data structure');
    }

    res.json({
      success: true,
      query: sanitizedFood,
      data: nutritionData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Calorie analysis error:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'AI service quota exceeded. Please try again later.'
      });
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'AI service not properly configured.'
      });
    }

    next(error);
  }
});

module.exports = router;
