const express = require('express');
const Joi = require('joi');
const { OpenAI } = require('openai');

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory storage for search history (for Node.js backend)
// In production, this would be replaced with a proper database
const searchHistory = new Map(); // sessionId -> array of searches

// Helper function to get or create session ID
function getSessionId(req) {
  if (!req.session.sessionId) {
    req.session.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  return req.session.sessionId;
}

// Helper function to save search to history
function saveSearchToHistory(sessionId, searchData) {
  if (!searchHistory.has(sessionId)) {
    searchHistory.set(sessionId, []);
  }
  
  const searches = searchHistory.get(sessionId);
  const searchRecord = {
    id: 'search_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    ...searchData,
    timestamp: new Date().toISOString()
  };
  
  searches.unshift(searchRecord); // Add to beginning
  
  // Keep only last 50 searches per session
  if (searches.length > 50) {
    searches.splice(50);
  }
  
  return searchRecord;
}

// Test endpoint to check OpenAI connection
router.get('/test', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        configured: false
      });
    }

    // Simple test call
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say 'test successful'" }],
      max_tokens: 10,
    });

    res.json({
      success: true,
      configured: true,
      response: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('OpenAI test error:', error);
    res.status(500).json({
      error: 'OpenAI connection failed',
      details: error.message,
      configured: !!process.env.OPENAI_API_KEY
    });
  }
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
    // Get or create session ID
    const sessionId = getSessionId(req);

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

    // Save search to history
    const searchData = {
      query: sanitizedFood,
      totalCalories: nutritionData.totalCalories,
      servingSize: nutritionData.servingSize,
      breakdown: nutritionData.breakdown,
      macros: nutritionData.macros,
      confidence: nutritionData.confidence,
      ai_response: nutritionData
    };
    
    const savedSearch = saveSearchToHistory(sessionId, searchData);

    res.json({
      success: true,
      query: sanitizedFood,
      data: nutritionData,
      search_id: savedSearch.id,
      session_id: sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Calorie analysis error:', error);
    console.error('Error type:', error.type);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);
    
    // OpenAI specific errors
    if (error.status === 401 || error.code === 'invalid_api_key') {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'AI service not properly configured. Please check API key.'
      });
    }
    
    if (error.status === 429 || error.code === 'insufficient_quota' || error.code === 'rate_limit_exceeded') {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'AI service quota exceeded. Please try again later.'
      });
    }

    if (error.status === 400) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'The request to AI service was invalid.'
      });
    }

    // Network or connection errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'Cannot connect to AI service. Please try again later.'
      });
    }

    next(error);
  }
});

// GET /breadcrumbs - Get recent searches for breadcrumb navigation (API root level)
router.get('/breadcrumbs', (req, res) => {
  try {
    const sessionId = req.session?.sessionId;
    
    if (!sessionId || !searchHistory.has(sessionId)) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searches = searchHistory.get(sessionId);
    const breadcrumbs = searches.slice(0, 5).map(search => ({
      id: search.id,
      query: search.query.length > 50 ? search.query.substring(0, 50) + '...' : search.query,
      totalCalories: search.totalCalories,
      timestamp: search.timestamp
    }));

    res.json({
      success: true,
      data: breadcrumbs
    });
  } catch (error) {
    console.error('Breadcrumbs error:', error);
    res.status(500).json({
      error: 'Failed to load breadcrumbs',
      message: 'An error occurred while loading recent searches'
    });
  }
});

// GET /searches/:id - Get specific search by ID (API root level)
router.get('/searches/:id', (req, res) => {
  try {
    const { id } = req.params;
    const sessionId = req.session?.sessionId;
    
    if (!sessionId || !searchHistory.has(sessionId)) {
      return res.status(404).json({
        error: 'Search not found'
      });
    }

    const searches = searchHistory.get(sessionId);
    const search = searches.find(s => s.id === id);
    
    if (!search) {
      return res.status(404).json({
        error: 'Search not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: search.id,
        query: search.query,
        totalCalories: search.totalCalories,
        servingSize: search.servingSize,
        breakdown: search.breakdown,
        macros: search.macros,
        confidence: search.confidence,
        timestamp: search.timestamp
      }
    });
  } catch (error) {
    console.error('Get search error:', error);
    res.status(500).json({
      error: 'Failed to retrieve search',
      message: 'An error occurred while retrieving the search'
    });
  }
});

// GET /history - Get search history with pagination (API root level)
router.get('/history', (req, res) => {
  try {
    const sessionId = req.session?.sessionId;
    const page = parseInt(req.query.page) || 1;
    const perPage = Math.min(parseInt(req.query.per_page) || 20, 50);
    
    if (!sessionId || !searchHistory.has(sessionId)) {
      return res.json({
        success: true,
        data: {
          searches: [],
          pagination: { page, per_page: perPage, total_searches: 0 },
          stats: {
            total_searches: 0,
            total_calories_analyzed: 0,
            avg_calories: 0,
            first_search: null,
            last_search: null
          }
        }
      });
    }

    const allSearches = searchHistory.get(sessionId);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedSearches = allSearches.slice(startIndex, endIndex);

    // Calculate stats
    const totalCalories = allSearches.reduce((sum, search) => sum + search.totalCalories, 0);
    const stats = {
      total_searches: allSearches.length,
      total_calories_analyzed: totalCalories,
      avg_calories: allSearches.length > 0 ? Math.round(totalCalories / allSearches.length) : 0,
      first_search: allSearches.length > 0 ? allSearches[allSearches.length - 1].timestamp : null,
      last_search: allSearches.length > 0 ? allSearches[0].timestamp : null
    };

    const searches = paginatedSearches.map(search => ({
      id: search.id,
      query: search.query,
      totalCalories: search.totalCalories,
      confidence: search.confidence,
      timestamp: search.timestamp
    }));

    res.json({
      success: true,
      data: {
        searches,
        pagination: {
          page,
          per_page: perPage,
          total_searches: allSearches.length
        },
        stats
      }
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      error: 'Failed to load history',
      message: 'An error occurred while loading search history'
    });
  }
});

module.exports = router;
