#!/bin/bash

# AI Calorie Tracker Docker Compose Management Script

case "$1" in
    "dev")
        echo "🚀 Starting development environment..."
        sudo docker-compose -f docker-compose.dev.yml up --build
        ;;
    "prod")
        echo "🚀 Starting production environment..."
        sudo docker-compose up --build
        ;;
    "down")
        echo "🛑 Stopping all services..."
        sudo docker-compose -f docker-compose.dev.yml down
        sudo docker-compose down
        ;;
    "logs")
        echo "📋 Showing logs..."
        if [ "$2" == "dev" ]; then
            sudo docker-compose -f docker-compose.dev.yml logs -f $3
        else
            sudo docker-compose logs -f $2
        fi
        ;;
    "clean")
        echo "🧹 Cleaning up Docker resources..."
        sudo docker-compose down --volumes --rmi all
        sudo docker system prune -f
        ;;
    "backend")
        echo "🔧 Starting backend and database only..."
        sudo docker-compose -f docker-compose.dev.yml up backend mongodb --build
        ;;
    "frontend")
        echo "🎨 Starting frontend only..."
        sudo docker-compose -f docker-compose.dev.yml up frontend --build
        ;;
    *)
        echo "AI Calorie Tracker Docker Compose Manager"
        echo "Usage: $0 {dev|prod|down|logs|clean|backend|frontend}"
        echo ""
        echo "Commands:"
        echo "  dev       - Start development environment with hot reload"
        echo "  prod      - Start production environment"
        echo "  down      - Stop all services"
        echo "  logs      - Show logs (add 'dev' for dev environment)"
        echo "  clean     - Remove all containers and images"
        echo "  backend   - Start only backend and database"
        echo "  frontend  - Start only frontend"
        echo ""
        echo "Examples:"
        echo "  $0 dev                    # Start development"
        echo "  $0 logs dev backend       # Show dev backend logs"
        echo "  $0 clean                  # Clean everything"
        ;;
esac
