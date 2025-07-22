# Calorie Tracker API - Elixir Backend

A robust, production-ready Elixir/Phoenix API backend for the NeoTalent Calorie Tracker application with data persistence, session management, and search history.

## 🚀 Features

### Core Functionality
- **AI-Powered Analysis**: Integration with OpenAI GPT for calorie estimation
- **Data Persistence**: PostgreSQL database for storing search history
- **Session Management**: Cookie-based sessions for user tracking
- **Search History**: Full CRUD operations for food search records
- **Breadcrumb Navigation**: Recent searches for quick access

### Production-Ready Features
- **Security**: Input validation, sanitization, and secure headers
- **Performance**: Database indexing and optimized queries
- **Monitoring**: Health checks and telemetry
- **Error Handling**: Comprehensive error management
- **API Documentation**: Well-documented REST endpoints

## 🏗️ Architecture

### Tech Stack
- **Elixir 1.14+**: Robust, concurrent programming language
- **Phoenix Framework**: Web framework for APIs
- **Ecto**: Database ORM and query builder
- **PostgreSQL**: Reliable database for data persistence
- **HTTPoison**: HTTP client for OpenAI API calls

### Database Schema

#### food_searches table
```sql
CREATE TABLE food_searches (
  id UUID PRIMARY KEY,
  session_id VARCHAR NOT NULL,
  query VARCHAR NOT NULL,
  total_calories INTEGER NOT NULL,
  serving_size VARCHAR,
  confidence VARCHAR,
  breakdown JSONB[],
  macros JSONB,
  ai_response JSONB,
  ip_address VARCHAR,
  inserted_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_food_searches_session_id ON food_searches(session_id);
CREATE INDEX idx_food_searches_inserted_at ON food_searches(inserted_at);
CREATE INDEX idx_food_searches_session_inserted ON food_searches(session_id, inserted_at);
```

## 📡 API Endpoints

### POST /api/calories
Analyze food and save results to database.

**Request:**
```json
{
  "food": "1 medium apple with 2 tablespoons peanut butter"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "1 medium apple with 2 tablespoons peanut butter",
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
  },
  "search_id": "uuid-here",
  "session_id": "session-uuid",
  "timestamp": "2025-07-22T09:45:00Z"
}
```

### GET /api/searches/:id
Retrieve a specific search by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "query": "apple with peanut butter",
    "totalCalories": 350,
    "servingSize": "1 medium apple with 2 tbsp peanut butter",
    "breakdown": [...],
    "macros": {...},
    "confidence": "high",
    "timestamp": "2025-07-22T09:45:00Z"
  }
}
```

### GET /api/breadcrumbs
Get recent searches for breadcrumb navigation.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "query": "grilled chicken salad",
      "totalCalories": 320,
      "timestamp": "2025-07-22T09:40:00Z"
    },
    {
      "id": "uuid-2", 
      "query": "apple with peanut butter",
      "totalCalories": 350,
      "timestamp": "2025-07-22T09:35:00Z"
    }
  ]
}
```

### GET /api/history
Get paginated search history.

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "searches": [
      {
        "id": "uuid-here",
        "query": "grilled chicken",
        "totalCalories": 280,
        "confidence": "high",
        "timestamp": "2025-07-22T09:40:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_searches": 45
    },
    "stats": {
      "total_searches": 45,
      "total_calories_analyzed": 15420,
      "avg_calories": 342.7,
      "first_search": "2025-07-20T10:00:00Z",
      "last_search": "2025-07-22T09:40:00Z"
    }
  }
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "calorie_tracker_api",
  "version": "1.0.0",
  "timestamp": "2025-07-22T09:45:00Z",
  "database": "connected",
  "openai": "configured"
}
```

## 🛠️ Setup Instructions

### Prerequisites
- Elixir 1.14+
- Phoenix Framework
- PostgreSQL 12+
- OpenAI API key

### Installation

1. **Install dependencies:**
   ```bash
   cd backend_elixir
   mix deps.get
   ```

2. **Database setup:**
   ```bash
   # Create and migrate database
   mix ecto.create
   mix ecto.migrate
   ```

3. **Environment configuration:**
   ```bash
   # Set environment variables
   export OPENAI_API_KEY="your-openai-api-key"
   export DATABASE_URL="postgresql://user:password@localhost/calorie_tracker_api_dev"
   export SECRET_KEY_BASE="your-secret-key-base"
   ```

4. **Run the server:**
   ```bash
   mix phx.server
   ```

   The API will be available at `http://localhost:4000`

### Development

```bash
# Run tests
mix test

# Format code
mix format

# Check for issues
mix credo

# Interactive console
iex -S mix phx.server
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for GPT integration | Required |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost/calorie_tracker_api_dev` |
| `SECRET_KEY_BASE` | Phoenix secret key base | Random in dev |
| `PORT` | Server port | 4000 |

### Database Configuration

```elixir
# config/dev.exs
config :calorie_tracker_api, CalorieTrackerApi.Repo,
  username: "postgres",
  password: "postgres", 
  hostname: "localhost",
  database: "calorie_tracker_api_dev",
  pool_size: 10
```

## 🧪 Testing

The application includes comprehensive tests covering:

- **Unit Tests**: Context functions and business logic
- **Controller Tests**: API endpoint functionality  
- **Integration Tests**: Full request/response cycles
- **Database Tests**: Data persistence and queries

```bash
# Run all tests
mix test

# Run with coverage
mix test --cover

# Run specific test file
mix test test/calorie_tracker_api/searches_test.exs
```

## 📊 Performance & Scalability

### Database Optimizations
- Indexed queries for fast session lookups
- JSONB fields for flexible data storage
- Connection pooling for concurrent requests
- Automatic cleanup of old searches

### Caching Strategy
- Session-based caching for recent searches
- HTTP response caching for repeated queries
- Database query result caching

### Monitoring
- Phoenix LiveDashboard for real-time metrics
- Telemetry for performance monitoring
- Health checks for service status

## 🔐 Security Features

- **Input Validation**: Ecto changesets with comprehensive validation
- **SQL Injection Prevention**: Parameterized queries via Ecto
- **XSS Protection**: Input sanitization and output encoding  
- **Session Security**: Secure cookie configuration
- **Rate Limiting**: Built-in request throttling
- **CORS Configuration**: Controlled cross-origin access

## 🚀 Deployment

### Production Configuration

```elixir
# config/prod.exs
config :calorie_tracker_api, CalorieTrackerApiWeb.Endpoint,
  url: [host: "your-domain.com", port: 443, scheme: "https"],
  http: [port: 4000],
  https: [
    port: 4001,
    cipher_suite: :strong,
    certfile: "path/to/cert.pem",
    keyfile: "path/to/key.pem"
  ]
```

### Docker Deployment

```dockerfile
FROM elixir:1.14-alpine

WORKDIR /app
COPY mix.exs mix.lock ./
RUN mix deps.get --only prod
RUN mix deps.compile

COPY . .
RUN mix compile
RUN mix phx.digest

EXPOSE 4000
CMD ["mix", "phx.server"]
```

## 📈 Frontend Integration

The Elixir backend seamlessly integrates with the existing Node.js frontend:

1. **Session Continuity**: Cookie-based sessions work across both backends
2. **API Compatibility**: Same endpoint structure and response format
3. **Breadcrumb Navigation**: New breadcrumb functionality for search history
4. **Progressive Enhancement**: Graceful fallback to Node.js backend

### Frontend Configuration

```javascript
// Frontend automatically detects and uses Elixir backend
const API_BASE_URL = 'http://localhost:4000';

// Breadcrumb integration
async loadBreadcrumbs() {
  const response = await fetch(`${API_BASE_URL}/api/breadcrumbs`, {
    credentials: 'include'
  });
  // Handle breadcrumb display
}
```

## 🎯 Benefits of Elixir Backend

1. **Concurrency**: Handle thousands of concurrent users efficiently
2. **Fault Tolerance**: Supervisor trees for automatic error recovery  
3. **Scalability**: Built for distributed systems and horizontal scaling
4. **Performance**: Low latency and high throughput
5. **Maintainability**: Clear, functional code structure
6. **Real-time**: WebSocket support for future real-time features

This Elixir backend provides a robust foundation for the calorie tracking application with enterprise-grade features for data persistence, user sessions, and search history management.
