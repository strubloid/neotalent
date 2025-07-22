# API Documentation

## Base URL
```
http://localhost:3000
```

## Endpoints

### Health Check
**GET** `/health`

Returns the health status of the API.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Analyze Food Calories
**POST** `/api/calories`

Analyzes food input and returns AI-generated calorie information.

**Request Body:**
```json
{
  "food": "grilled chicken breast with steamed broccoli"
}
```

**Validation Rules:**
- `food` (required): String, 1-500 characters
- Input is sanitized to remove potentially harmful content

**Success Response (200):**
```json
{
  "success": true,
  "query": "grilled chicken breast with steamed broccoli",
  "data": {
    "totalCalories": 285,
    "servingSize": "1 medium chicken breast (150g) with 1 cup broccoli",
    "breakdown": [
      {
        "item": "Grilled chicken breast (150g)",
        "calories": 250
      },
      {
        "item": "Steamed broccoli (1 cup)",
        "calories": 35
      }
    ],
    "macros": {
      "protein": 45,
      "carbs": 8,
      "fat": 6
    },
    "confidence": "high"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "error": "Validation failed",
  "details": "Food input is required",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**429 - Rate Limit Exceeded:**
```json
{
  "error": "Too many requests from this IP, please try again later.",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**500 - Server Error:**
```json
{
  "error": "Internal server error",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**503 - Service Unavailable:**
```json
{
  "error": "Service temporarily unavailable",
  "message": "AI service quota exceeded. Please try again later.",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Rate Limiting

- **Window:** 15 minutes (900,000ms)
- **Max Requests:** 100 per IP address per window
- **Headers:** Standard rate limit headers are included in responses

## Security Features

- **Helmet.js:** Security headers including CSP, XSS protection
- **Input Sanitization:** HTML tags and potentially harmful content removed
- **Input Validation:** Joi schema validation
- **CORS:** Cross-origin requests properly handled
- **Rate Limiting:** Per-IP request limiting

## Error Handling

All errors include:
- Descriptive error messages
- Appropriate HTTP status codes
- Timestamp for debugging
- Request context where appropriate

## Response Data Types

### Calorie Data Object
- `totalCalories` (number): Total estimated calories
- `servingSize` (string): Human-readable serving size description
- `breakdown` (array): Individual food items with calorie breakdown
- `macros` (object): Macronutrient information
  - `protein` (number): Protein in grams
  - `carbs` (number): Carbohydrates in grams
  - `fat` (number): Fat in grams
- `confidence` (string): AI confidence level ("high", "medium", "low")

### Breakdown Item
- `item` (string): Name/description of the food item
- `calories` (number): Estimated calories for this item
