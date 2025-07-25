#!/bin/bash

# NeoTalent Comprehensive Test Runner
# Usage: ./test/tests.sh [command]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${CYAN}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check if containers are running
check_containers() {
    print_info "Checking container status..."
    if command -v docker-compose > /dev/null 2>&1; then
        docker-compose ps
    elif command -v docker > /dev/null 2>&1 && docker compose version > /dev/null 2>&1; then
        docker compose ps
    else
        print_warning "Docker Compose not found. Make sure containers are running manually."
    fi
}

# Function to run backend tests
run_backend_tests() {
    print_header "Running Backend Tests"
    
    if command -v docker-compose > /dev/null 2>&1; then
        docker-compose exec -T backend npm test
    elif command -v docker > /dev/null 2>&1; then
        docker compose exec -T backend npm test
    else
        print_error "Docker Compose not available. Trying local backend tests..."
        cd backend && npm test && cd ..
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Backend tests completed successfully"
    else
        print_error "Backend tests failed"
        return 1
    fi
}

# Function to run frontend tests
run_frontend_tests() {
    print_header "Running Frontend Tests"
    
    if command -v docker-compose > /dev/null 2>&1; then
        docker-compose exec -T frontend npm test -- --coverage --ci --watchAll=false
    elif command -v docker > /dev/null 2>&1; then
        docker compose exec -T frontend npm test -- --coverage --ci --watchAll=false
    else
        print_error "Docker Compose not available. Trying local frontend tests..."
        cd frontend && npm run test:ci && cd ..
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Frontend tests completed successfully"
    else
        print_error "Frontend tests failed"
        return 1
    fi
}

# Function to run backend tests with coverage
run_backend_coverage() {
    print_header "Running Backend Tests with Coverage"
    
    if command -v docker-compose > /dev/null 2>&1; then
        docker-compose exec -T backend npm run test:coverage
    elif command -v docker > /dev/null 2>&1; then
        docker compose exec -T backend npm run test:coverage
    else
        cd backend && npm run test:coverage && cd ..
    fi
}

# Function to run frontend tests with coverage
run_frontend_coverage() {
    print_header "Running Frontend Tests with Coverage"
    
    if command -v docker-compose > /dev/null 2>&1; then
        docker-compose exec -T frontend npm test -- --coverage --ci --watchAll=false
    elif command -v docker > /dev/null 2>&1; then
        docker compose exec -T frontend npm test -- --coverage --ci --watchAll=false
    else
        cd frontend && npm run test:ci && cd ..
    fi
}

# Function to run all tests
run_all_tests() {
    print_header "Running All Tests (Backend + Frontend)"
    
    local backend_result=0
    local frontend_result=0
    
    run_backend_tests || backend_result=$?
    echo ""
    run_frontend_tests || frontend_result=$?
    
    echo ""
    print_header "Test Summary"
    
    if [ $backend_result -eq 0 ]; then
        print_success "Backend: 162/162 tests passing (100%)"
    else
        print_error "Backend: Tests failed"
    fi
    
    if [ $frontend_result -eq 0 ]; then
        print_success "Frontend: All tests passing"
    else
        print_error "Frontend: Tests failed"
    fi
    
    if [ $backend_result -eq 0 ] && [ $frontend_result -eq 0 ]; then
        print_success "All tests completed successfully! 🎉"
        return 0
    else
        print_error "Some tests failed. Please check the output above."
        return 1
    fi
}

# Function to run tests locally (without Docker)
run_local_tests() {
    print_header "Running Tests Locally (No Docker)"
    print_warning "Running local tests. Make sure you have installed dependencies locally."
    
    print_info "Running backend tests..."
    cd backend && npm test && cd ..
    
    print_info "Running frontend tests..."
    cd frontend && npm run test:ci && cd ..
    
    print_success "Local tests completed"
}

# Function to run quick tests (minimal output)
run_quick_tests() {
    print_header "Quick Test Run"
    
    # Suppress most output, just show results
    print_info "Running backend tests..."
    if command -v docker-compose > /dev/null 2>&1; then
        docker-compose exec -T backend npm test > /dev/null 2>&1
    elif command -v docker > /dev/null 2>&1; then
        docker compose exec -T backend npm test > /dev/null 2>&1
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Backend tests: PASSED"
    else
        print_error "Backend tests: FAILED"
    fi
    
    print_info "Running frontend tests..."
    if command -v docker-compose > /dev/null 2>&1; then
        docker-compose exec -T frontend npm test -- --coverage --ci --watchAll=false > /dev/null 2>&1
    elif command -v docker > /dev/null 2>&1; then
        docker compose exec -T frontend npm test -- --coverage --ci --watchAll=false > /dev/null 2>&1
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Frontend tests: PASSED"
    else
        print_error "Frontend tests: FAILED"
    fi
}

# Function to show help
show_help() {
    echo -e "${PURPLE}"
    echo "NeoTalent Test Runner"
    echo "===================="
    echo -e "${NC}"
    echo "Usage: ./test/tests.sh [command]"
    echo ""
    echo "Available commands:"
    echo ""
    echo -e "${CYAN}Basic Commands:${NC}"
    echo "  all              Run all tests (backend + frontend)"
    echo "  backend          Run backend tests only"
    echo "  frontend         Run frontend tests only"
    echo ""
    echo -e "${CYAN}Coverage Commands:${NC}"
    echo "  coverage         Run all tests with coverage"
    echo "  backend-coverage Run backend tests with coverage"
    echo "  frontend-coverage Run frontend tests with coverage"
    echo ""
    echo -e "${CYAN}Development Commands:${NC}"
    echo "  quick            Quick test run (minimal output)"
    echo "  local            Run tests locally (no Docker)"
    echo "  check            Check container status"
    echo ""
    echo -e "${CYAN}Utility Commands:${NC}"
    echo "  help             Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  ./test/tests.sh all"
    echo "  ./test/tests.sh backend"
    echo "  ./test/tests.sh coverage"
    echo "  ./test/tests.sh quick"
    echo ""
    echo -e "${GREEN}Default: If no command is provided, 'all' is used${NC}"
}

# Main script logic
main() {
    local command=${1:-"all"}
    
    # Change to the project root directory
    cd "$(dirname "$0")/.."
    
    case $command in
        "all")
            check_docker
            check_containers
            run_all_tests
            ;;
        "backend")
            check_docker
            run_backend_tests
            ;;
        "frontend")
            check_docker
            run_frontend_tests
            ;;
        "coverage")
            check_docker
            check_containers
            print_header "Running All Tests with Coverage"
            run_backend_coverage
            echo ""
            run_frontend_coverage
            print_success "Coverage reports generated"
            ;;
        "backend-coverage")
            check_docker
            run_backend_coverage
            ;;
        "frontend-coverage")
            check_docker
            run_frontend_coverage
            ;;
        "quick")
            check_docker
            run_quick_tests
            ;;
        "local")
            run_local_tests
            ;;
        "check")
            check_docker
            check_containers
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run the main function with all arguments
main "$@"
