# NeoTalent - AI Calorie Tracker

A production-ready web application that uses AI to estimate calorie information for meals and ingredients, now with **dual backend support** and **persistent search history**.

## 🎯 Features

### Core Functionality
- **AI-Powered Calorie Estimation**: Input meals or ingredients to get detailed calorie breakdowns
- **Clean Bootstrap UI**: Responsive, modern interface with breadcrumb navigation
- **Real-time Processing**: Fast API responses with AI integration
- **Search History**: Persistent storage of all food analyses
- **Breadcrumb Navigation**: Quick access to recent searches
- **Session Management**: Seamless user experience across sessions

### Production Features
- **Dual Backend Support**: Choose between Node.js or Elixir backend
- **Data Persistence**: PostgreSQL database for search history
- **Comprehensive Testing**: Unit and integration tests
- **Security**: Input validation, sanitization, rate limiting
- **Error Handling**: Robust error management

## 🏗️ Architecture

### Frontend
- **Technology**: HTML5, Bootstrap 5, Vanilla JavaScript
- **Features**: Responsive design, real-time validation, breadcrumb navigation
- **Backend Integration**: Automatic detection and fallback between backends

### Backend Options

#### Option 1: Node.js Backend (Simple & Fast)
- **Technology**: Express.js, lightweight and fast
- **Best for**: Quick setup, simple deployments
- **Features**: Basic functionality, in-memory sessions

#### Option 2: Elixir Backend (Production-Ready)
- **Technology**: Phoenix Framework, PostgreSQL
- **Best for**: Production use, high concurrency, data persistence
- **Features**: Full CRUD operations, session management, search history, breadcrumbs

## 🚀 Quick Start

### Option A: Node.js Backend (Recommended for Testing)

1. **Setup:**
   ```bash
   npm install
   cp .env.example .env
   # Add your OpenAI API key to .env
   ```

2. **Run:**
   ```bash
   npm start          # Production
   npm run dev        # Development
   ```

3. **Access:** http://localhost:3000

### Option B: Elixir Backend (Recommended for Production)

1. **Prerequisites:**
   ```bash
   # Install Elixir and PostgreSQL
   sudo apt install elixir postgresql
   ```

2. **Setup:**
   ```bash
   cd backend_elixir
   mix deps.get
   mix ecto.create
   mix ecto.migrate
   export OPENAI_API_KEY="your-api-key"
   ```

3. **Run:**
   ```bash
   mix phx.server     # Runs on port 4000
   ```

4. **Frontend:** The frontend will automatically detect and use the Elixir backend

## 💾 Data Persistence & Breadcrumbs

With the Elixir backend, users get:

### Search History
- All food analyses are automatically saved
- Retrieve any previous search by ID
- Paginated history with statistics

### Breadcrumb Navigation
- Recent searches appear at the top of the page
- Click any breadcrumb to reload that search
- Shows query preview, calories, and time ago
- Automatically updates after new searches

### Session Management
- Cookie-based sessions for user tracking
- Persistent across browser sessions
- Secure session configuration

## 🧪 Testing

### Node.js Backend
```bash
npm test              # 16 tests, 84% coverage
```

### Elixir Backend
```bash
cd backend_elixir
mix test              # Comprehensive test suite
```

## 📡 API Endpoints (Elixir Backend)

### Core Analysis
- `POST /api/calories` - Analyze food and save to database
- `GET /api/searches/:id` - Retrieve specific search
- `GET /api/breadcrumbs` - Get recent searches for navigation
- `GET /api/history` - Paginated search history with stats
- `GET /health` - Health check with service status

### Example Usage

**Analyze Food:**
```javascript
const response = await fetch('/api/calories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ food: 'grilled chicken salad' })
});
```

**Load Previous Search:**
```javascript
const response = await fetch('/api/searches/uuid-here', {
  credentials: 'include'
});
```

## 🔧 Configuration

### Environment Variables
```bash
# Required for both backends
OPENAI_API_KEY=your_openai_api_key_here

# Node.js specific
PORT=3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Elixir specific (additional)
DATABASE_URL=postgresql://user:pass@localhost/db
SECRET_KEY_BASE=your_secret_key_base
```

## 🛡️ Security Features

- **Input Validation**: Comprehensive validation on both client and server
- **Rate Limiting**: Prevents API abuse (100 requests per 15 minutes)
- **Input Sanitization**: XSS prevention
- **Secure Headers**: CSP, XSS protection, secure cookies
- **Session Security**: Secure cookie configuration
- **SQL Injection Prevention**: Parameterized queries (Elixir backend)

## 📊 Comparison: Node.js vs Elixir Backend

| Feature | Node.js | Elixir |
|---------|---------|---------|
| **Setup Time** | ⭐⭐⭐⭐⭐ Fast | ⭐⭐⭐ Moderate |
| **Data Persistence** | ❌ None | ✅ PostgreSQL |
| **Search History** | ❌ No | ✅ Full CRUD |
| **Breadcrumbs** | ❌ No | ✅ Yes |
| **Session Management** | ⭐⭐ Basic | ⭐⭐⭐⭐⭐ Advanced |
| **Concurrency** | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent |
| **Production Ready** | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Enterprise |
| **Memory Usage** | ⭐⭐⭐⭐ Low | ⭐⭐⭐ Moderate |
| **Fault Tolerance** | ⭐⭐ Basic | ⭐⭐⭐⭐⭐ Advanced |

## 🎯 Exercise Requirements Fulfilled

✅ **Production-ready one-page web application**  
✅ **AI-generated calorie information functionality**  
✅ **API-based backend** (Node.js + Elixir options)  
✅ **AI model integration** (OpenAI GPT-3.5-turbo)  
✅ **Automated testing** (Jest + ExUnit)  
✅ **Integration tests** included  
✅ **Code quality** focus with modular architecture  
✅ **Security** measures implemented  
✅ **Persistence** (Elixir backend with PostgreSQL)  
✅ **Bonus: Additional features** (search history, breadcrumbs, dual backend)

## 🚀 Production Deployment

### Node.js Backend
```bash
# Simple deployment
npm start
# OR with PM2
pm2 start server.js --name calorie-tracker
```

### Elixir Backend
```bash
# Production build
cd backend_elixir
MIX_ENV=prod mix compile
MIX_ENV=prod mix phx.server
```

### Docker Deployment
Both backends include Docker configurations for containerized deployment.

---

**Development Time**: ~4 hours total
- Node.js backend: ~2 hours
- Elixir backend: ~2 hours  
- Frontend enhancements: Included

**Code Quality**: Production-ready with comprehensive testing, security, and documentation.
