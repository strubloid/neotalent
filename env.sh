#!/bin/bash

# 🔧 NeoTalent Environment Setup Script
# This script generates .env files from their respective .env.example templates

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${CYAN}🔧 $1${NC}"
}

# Function to copy .env.example to .env if it doesn't exist
setup_env_file() {
    local example_file="$1"
    local env_file="${example_file%.example}"
    
    if [[ ! -f "$example_file" ]]; then
        print_error "Template file $example_file not found!"
        return 1
    fi
    
    if [[ -f "$env_file" ]]; then
        print_warning "Environment file $env_file already exists, skipping..."
        return 0
    fi
    
    cp "$example_file" "$env_file"
    print_success "Created $env_file from $example_file"
}

# Function to check if OpenAI API key is set
check_openai_key() {
    local env_file="$1"
    
    if [[ -f "$env_file" ]]; then
        local current_key=$(grep "^OPENAI_API_KEY=" "$env_file" | cut -d'=' -f2)
        if [[ "$current_key" == "your-openai-api-key-here" || "$current_key" == "your_openai_api_key_here" || -z "$current_key" ]]; then
            print_warning "OpenAI API key in $env_file is not configured!"
            echo -e "   ${YELLOW}📝 Please edit $env_file and set your OpenAI API key${NC}"
            return 1
        else
            print_success "OpenAI API key is configured in $env_file"
            return 0
        fi
    fi
    return 1
}

# Main setup function
main() {
    print_header "NeoTalent Environment Setup"
    echo ""
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]] || [[ ! -d "backend" ]] || [[ ! -d "frontend" ]]; then
        print_error "This script must be run from the NeoTalent project root directory!"
        exit 1
    fi
    
    print_info "Setting up environment files..."
    echo ""
    
    # Setup root .env file
    print_info "Setting up root environment file..."
    if setup_env_file ".env.example"; then
        check_openai_key ".env"
    fi
    echo ""
    
    # Setup backend .env file
    print_info "Setting up backend environment file..."
    if setup_env_file "backend/.env.example"; then
        check_openai_key "backend/.env"
    fi
    echo ""
    
    # Check if frontend needs .env (React apps usually use .env for build-time variables)
    if [[ -f "frontend/.env.example" ]]; then
        print_info "Setting up frontend environment file..."
        setup_env_file "frontend/.env.example"
        echo ""
    fi
    
    # Summary
    print_header "Setup Summary"
    echo ""
    
    local needs_openai_key=false
    
    # Check all .env files for OpenAI configuration
    for env_file in .env backend/.env frontend/.env; do
        if [[ -f "$env_file" ]]; then
            if ! check_openai_key "$env_file" 2>/dev/null; then
                needs_openai_key=true
            fi
        fi
    done
    
    echo ""
    
    if [[ "$needs_openai_key" == true ]]; then
        print_warning "IMPORTANT: OpenAI API Key Required!"
        echo ""
        echo -e "${YELLOW}📋 To get your OpenAI API key:${NC}"
        echo -e "   1. Visit https://platform.openai.com/api-keys"
        echo -e "   2. Create a new API key"
        echo -e "   3. Copy the key and update the OPENAI_API_KEY in your .env files"
        echo ""
        echo -e "${YELLOW}💡 The application will work without the API key, but nutrition analysis features will be limited.${NC}"
    else
        print_success "All environment files are properly configured!"
    fi
    
    echo ""
    print_info "Environment setup complete! You can now run:"
    echo -e "   ${CYAN}npm start${NC}        # Start the application"
    echo -e "   ${CYAN}npm test${NC}         # Run tests"
    echo -e "   ${CYAN}npm run build${NC}    # Build the application"
}

# Show help
show_help() {
    echo "NeoTalent Environment Setup Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --force        Overwrite existing .env files"
    echo ""
    echo "This script will:"
    echo "  1. Copy .env.example files to .env files"
    echo "  2. Check OpenAI API key configuration"
    echo "  3. Provide setup instructions"
}

# Handle command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    --force)
        print_warning "Force mode: Will overwrite existing .env files"
        # Remove existing .env files
        rm -f .env backend/.env frontend/.env
        main
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
