# NeoTalent Calorie Tracker

🥗 AI-powered nutrition analysis web application with persistent search history and user authentication.

## 🐳 Docker-Only Development Environment

**⚠️ IMPORTANT: This project runs exclusively in Docker containers. Do not run local npm commands!**

### 🚀 Quick Start

```bash
# Start the application (recommended)
npm start

# Access your application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# MongoDB: localhost:27017
```

### 📋 Available Commands

#### Main Commands
```bash
npm start              # Start production containers
npm run stop           # Stop all containers
npm run logs           # View all container logs
npm run help           # Show available commands
```

#### Development Commands
```bash
npm run dev:docker     # Start development containers
npm run dev:stop       # Stop development containers
npm run build          # Build all containers
npm run rebuild        # Build containers without cache
```

#### Debugging & Maintenance
```bash
npm run logs:backend   # View backend logs only
npm run logs:frontend  # View frontend logs only
npm run logs:mongodb   # View MongoDB logs only
npm run shell:backend  # Access backend container shell
npm run shell:mongodb  # Access MongoDB container shell
npm run docker:clean   # Clean up Docker system
npm run docker:reset   # Complete reset (removes volumes)
```

### 🧪 Testing Commands

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
```bash
# Run all tests with colored output
./test/tests.sh

# Run only backend tests
./test/tests.sh backend

# Quick test to check if everything works
./test/tests.sh quick

# Generate coverage reports
./test/tests.sh coverage

# Check if containers are running
./test/tests.sh check
```

### 🔐 Database Access (DbVisualizer)

**SSH Tunnel Configuration:**
- SSH Host: `localhost`
- SSH Port: `2221`
- SSH User: `mongouser`
- SSH Password: `mongopass123`

**Database Connection (through SSH tunnel):**
- Host: `localhost`
- Port: `27017`
- Database: `neotalent`

### 🛠️ Architecture

- **Frontend**: React + TypeScript (Port 3000)
- **Backend**: Node.js + Express + TypeScript (Port 3001)
- **Database**: MongoDB (Port 27017, SSH: 2221)
- **Authentication**: Crypto-based password hashing
- **AI Integration**: OpenAI API for nutrition analysis

### 🔒 Environment Variables

Make sure your `.env` file contains:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### ❌ What NOT to Do

```bash
# DON'T run these local commands:
npm run dev           # This will show an error message
cd backend && npm start  # Local backend won't work
cd frontend && npm start # Local frontend won't work
```

### ✅ Troubleshooting

1. **"Unable to analyze food" error**: Make sure you're accessing http://localhost:3000 (Docker environment), not running local servers
2. **Connection refused**: Run `npm start` to ensure all Docker containers are running
3. **API key issues**: Check that your `.env` file has the OpenAI API key set
4. **Container issues**: Run `npm run docker:reset` for a complete reset

### 🔄 Development Workflow

1. Make code changes in your editor
2. Containers automatically reload (if using dev mode)
3. Test at http://localhost:3000
4. View logs with `npm run logs`
5. Access container shells with `npm run shell:backend` or `npm run shell:mongodb`

---

**Remember: Always use Docker! Your application runs in containers with proper environment configuration, database connections, and AI API access.**
