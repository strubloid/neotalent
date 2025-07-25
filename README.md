# 🥗 AI Calorie Tracker

> **AI-powered nutrition analysis that transforms food descriptions into detailed calorie and nutritional insights**

A modern web application that uses OpenAI's GPT to analyze food descriptions and provide comprehensive nutritional information. Built with React, Node.js, and MongoDB in a fully containerized environment.

## ✨ Features

- 🤖 **AI-Powered Analysis**: Describe your food in natural language, get detailed nutritional breakdown
- 👤 **User Authentication**: Secure account creation and login system
- 📊 **Search History**: Track and revisit your previous nutrition analyses
- 🔒 **Session Management**: Persistent login sessions with security best practices
- 🐳 **Docker-First**: Fully containerized development and production environment
- 🧪 **Comprehensive Testing**: 162+ tests with 100% pass rate

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Clone the repository
git clone <repository-url>
cd ai-calorie-tracker

# Set up environment files (includes OpenAI API key setup)
npm run setup
# OR directly: ./env.sh

# Start the application
npm start
```

### 2. Configure OpenAI API Key
After running `./env.sh`, edit the generated `.env` files and add your OpenAI API key:
```bash
OPENAI_API_KEY=your_actual_openai_api_key_here
```

**🔑 Get Your API Key**: Visit [OpenAI Platform](https://platform.openai.com/api-keys) to create an API key.

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **MongoDB**: localhost:27017

## � How It Works

1. **Describe Your Food**: "2 slices of pepperoni pizza and a medium Coke"
2. **AI Analysis**: OpenAI processes the description and estimates nutritional content
3. **Detailed Results**: Get calories, macronutrients, portions, and health insights
4. **Save & Track**: Authenticated users can save searches and build history

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React + TypeScript | Interactive user interface |
| **Backend** | Node.js + Express + TypeScript | API server and business logic |
| **Database** | MongoDB | User data and search history |
| **AI** | OpenAI GPT-3.5-turbo | Nutrition analysis engine |
| **Infrastructure** | Docker + Docker Compose | Containerized deployment |
| **Testing** | Jest + React Testing Library | Comprehensive test suite |

## 📋 Available Commands

### Core Operations
```bash
npm run setup          # Set up environment files (.env)
npm start              # Start all services
npm stop               # Stop all services  
npm test               # Run comprehensive test suite
npm run logs           # View application logs
```

### Development
```bash
npm run build          # Build production containers
npm run rebuild        # Force rebuild (no cache)
npm run shell:backend  # Access backend container
npm run shell:mongodb  # Access database container
```

### Testing

#### Centralized Test Runner
All testing is now managed through a single script located at `./test/tests.sh`:

```bash
# Basic test commands
./test/tests.sh all              # Run all tests (default)
./test/tests.sh backend          # Run backend tests only  
./test/tests.sh frontend         # Run frontend tests only

# Coverage testing
./test/tests.sh coverage         # Run all tests with coverage
./test/tests.sh backend-coverage # Backend tests with coverage
./test/tests.sh frontend-coverage # Frontend tests with coverage

# Development commands
./test/tests.sh quick            # Quick test run (minimal output)
./test/tests.sh local            # Run tests locally (no Docker)
./test/tests.sh check            # Check container status

# Utility commands
./test/tests.sh help             # Show all available options
```

#### NPM Shortcuts (from root directory)
```bash
npm test                    # Run all tests
npm run test:backend       # Backend tests only
npm run test:frontend      # Frontend tests only
npm run test:coverage      # All tests with coverage
npm run test:quick         # Quick test run
npm run test:local         # Local tests (no Docker)
npm run test:help          # Show test help
```

#### Watch Mode for Development
```bash
npm run test:backend:watch      # Backend tests in watch mode
npm run test:frontend:watch     # Frontend tests in watch mode
```

#### Test Results Overview
- **Backend**: 162/162 tests passing (100% success rate)
- **Frontend**: Comprehensive React component testing with full coverage
- **Integration**: Docker-based testing environment
- **CI Ready**: All tests configured for continuous integration

#### Examples
### Testing
```bash
./test/tests.sh all        # Run all tests
./test/tests.sh backend    # Backend tests only
./test/tests.sh coverage   # Generate coverage reports
./test/tests.sh quick      # Fast test run
./test/tests.sh help       # Show test options
```

## � Environment Setup Script

The `./env.sh` script automates environment file creation:

```bash
./env.sh              # Create .env files from templates
./env.sh --help       # Show script options
./env.sh --force      # Overwrite existing .env files
```

**What it does:**
- Creates `.env` and `backend/.env` from their `.example` templates
- Validates OpenAI API key configuration
- Provides setup instructions and troubleshooting tips

## 🏗️ Project Structure

```
ai-calorie-tracker/
├── frontend/           # React TypeScript application
│   ├── src/components/    # UI components (Auth, Forms, Results)
│   ├── src/interfaces/    # TypeScript type definitions
│   └── public/           # Static assets
├── backend/            # Node.js Express API
│   ├── src/controllers/   # Request handlers
│   ├── src/services/     # Business logic (OpenAI integration)
│   ├── src/models/       # Data models
│   └── src/middleware/   # Express middleware
├── test/              # Centralized testing system
│   ├── tests.sh          # Main test runner
│   └── README.md         # Test documentation
├── env.sh             # Environment setup script
└── docker-compose.yml # Container orchestration
```

## 🔐 Security Features

- **Password Hashing**: Crypto-based secure password storage
- **Session Management**: Express-session with secure configuration
- **Rate Limiting**: API endpoint protection against abuse
- **Input Sanitization**: XSS and injection attack prevention
- **Environment Variables**: Sensitive data protection

## 🧪 Testing

The project includes a comprehensive test suite with **162 tests** covering:

- **Backend**: Controllers, services, models, middleware, utilities
- **Frontend**: Components, user interactions, API integration
- **Integration**: End-to-end workflows and error handling

```bash
# Run specific test suites
npm run test:backend       # Backend unit/integration tests
npm run test:frontend      # Frontend component tests
npm run test:coverage      # Generate detailed coverage reports
```

## 🚨 Important Notes

### Docker-First Architecture
This application **runs exclusively in Docker containers**. All dependencies, databases, and services are containerized for consistent development and deployment.

### OpenAI API Requirement
- **Required**: OpenAI API key for nutrition analysis features
- **Fallback**: Application works without API key but with limited functionality
- **Cost**: Typical analysis costs ~$0.001-0.01 per request

### Environment Files
The application requires properly configured environment files:
- **Root**: `.env` (general configuration)
- **Backend**: `backend/.env` (server and API configuration)

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Unable to analyze food" | Ensure containers are running (`npm start`) |
| Connection refused | Check if accessing http://localhost:3000 |
| API key errors | Run `./env.sh` and configure OpenAI API key |
| Container issues | Run `npm run rebuild` or `npm run docker:reset` |
| Test failures | Check `npm run test:help` for debugging options |

## 🤝 Development Workflow

1. **Setup**: Run `npm run setup` to configure environment files
2. **Start**: Use `npm start` to launch all services
3. **Develop**: Edit code - containers auto-reload in dev mode
4. **Test**: Run `./test/tests.sh quick` for fast validation
5. **Debug**: Use `npm run logs` and container shells for troubleshooting

## 📊 Performance

- **Startup Time**: ~30-60 seconds for all containers
- **API Response**: ~2-5 seconds for nutrition analysis
- **Test Suite**: ~30-60 seconds for full test run
- **Memory Usage**: ~500MB total for all containers

## 📝 License

MIT License - See LICENSE file for details.

---

**🎯 Ready to analyze your nutrition? Start with `npm run setup` then `npm start`!**
