# AI Calorie Tracker Test Configuration

## Test Structure

```
test/
├── tests.sh          # Main test runner script
└── README.md         # This file
```

## Usage Examples

### Basic Testing
```bash
# Run all tests (most common)
./test/tests.sh

# Run specific test suites
./test/tests.sh backend
./test/tests.sh frontend
```

### Coverage Testing
```bash
# Generate coverage reports for all tests
./test/tests.sh coverage

# Individual coverage reports
./test/tests.sh backend-coverage
./test/tests.sh frontend-coverage
```

### Development & Debugging
```bash
# Quick test run (fast, minimal output)
./test/tests.sh quick

# Check if Docker containers are running
./test/tests.sh check

# Run tests locally (without Docker)
./test/tests.sh local
```

### Getting Help
```bash
# Show all available commands
./test/tests.sh help
```

## Test Results

### Backend Tests
- **Total Tests**: 162
- **Passing**: 162 (100%)
- **Coverage**: Comprehensive unit, integration, and controller testing
- **Framework**: Jest with TypeScript support

### Frontend Tests
- **Framework**: React Testing Library + Jest
- **Coverage**: Component testing, user interactions, API integration
- **CI Ready**: Optimized for continuous integration

## NPM Integration

All test commands are also available as npm scripts:

```bash
npm test                 # ./test/tests.sh all
npm run test:backend     # ./test/tests.sh backend  
npm run test:frontend    # ./test/tests.sh frontend
npm run test:coverage    # ./test/tests.sh coverage
npm run test:quick       # ./test/tests.sh quick
npm run test:local       # ./test/tests.sh local
npm run test:help        # ./test/tests.sh help
```

## Docker Requirements

- The test runner automatically detects Docker Compose version
- Supports both `docker-compose` and `docker compose` commands
- Falls back to local testing if Docker is not available
- Requires containers to be running for Docker-based tests

## Exit Codes

- `0`: All tests passed successfully
- `1`: One or more tests failed
- `1`: Docker not available when required
- `1`: Invalid command provided

## Environment Support

- ✅ Linux
- ✅ macOS  
- ✅ WSL (Windows Subsystem for Linux)
- ✅ CI/CD environments
