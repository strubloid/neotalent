#!/bin/bash

# NeoTalent Development Setup Script
# Alternative script for development without Docker

case "$1" in
    "install")
        echo "📦 Installing all dependencies..."
        echo "Installing backend dependencies..."
        cd backend && npm install
        echo "Installing frontend dependencies..."
        cd ../frontend && npm install
        cd ..
        echo "✅ All dependencies installed!"
        ;;
    "dev")
        echo "🚀 Starting development environment..."
        echo "Starting MongoDB with Docker (if available)..."
        if command -v docker &> /dev/null; then
            docker run -d -p 27017:27017 --name neotalent-mongodb \
                -e MONGO_INITDB_ROOT_USERNAME=neotalent \
                -e MONGO_INITDB_ROOT_PASSWORD=neotalent123 \
                -e MONGO_INITDB_DATABASE=neotalent \
                mongo:7.0 2>/dev/null || echo "MongoDB container already running or failed to start"
        else
            echo "⚠️  Docker not found. Please install MongoDB manually or use Docker Desktop."
        fi
        
        echo "Starting backend server..."
        cd backend
        npm run dev &
        BACKEND_PID=$!
        
        echo "Starting frontend server..."
        cd ../frontend
        npm start &
        FRONTEND_PID=$!
        
        echo "✅ Development servers started!"
        echo "🌐 Frontend: http://localhost:3000"
        echo "🔗 Backend: http://localhost:3001"
        echo ""
        echo "Press Ctrl+C to stop all servers..."
        
        # Wait for Ctrl+C
        trap 'echo "🛑 Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT
        wait
        ;;
    "backend")
        echo "🔧 Starting backend only..."
        cd backend && npm run dev
        ;;
    "frontend")
        echo "🎨 Starting frontend only..."
        cd frontend && npm start
        ;;
    "build")
        echo "🏗️ Building for production..."
        echo "Building backend..."
        cd backend && npm run build
        echo "Building frontend..."
        cd ../frontend && npm run build
        cd ..
        echo "✅ Build complete!"
        ;;
    "mongodb")
        echo "🗄️ Starting MongoDB with Docker..."
        if command -v docker &> /dev/null; then
            docker run -d -p 27017:27017 --name neotalent-mongodb \
                -e MONGO_INITDB_ROOT_USERNAME=neotalent \
                -e MONGO_INITDB_ROOT_PASSWORD=neotalent123 \
                -e MONGO_INITDB_DATABASE=neotalent \
                mongo:7.0
            echo "✅ MongoDB started on port 27017"
            echo "Username: neotalent, Password: neotalent123"
        else
            echo "❌ Docker not found. Please install Docker first."
        fi
        ;;
    "stop")
        echo "🛑 Stopping all services..."
        pkill -f "npm run dev"
        pkill -f "npm start"
        if command -v docker &> /dev/null; then
            docker stop neotalent-mongodb 2>/dev/null || true
            docker rm neotalent-mongodb 2>/dev/null || true
        fi
        echo "✅ All services stopped!"
        ;;
    *)
        echo "NeoTalent Development Manager"
        echo "Usage: $0 {install|dev|backend|frontend|build|mongodb|stop}"
        echo ""
        echo "Commands:"
        echo "  install   - Install all dependencies"
        echo "  dev       - Start full development environment"
        echo "  backend   - Start backend only"
        echo "  frontend  - Start frontend only"
        echo "  build     - Build for production"
        echo "  mongodb   - Start MongoDB container"
        echo "  stop      - Stop all services"
        echo ""
        echo "Examples:"
        echo "  $0 install               # Install dependencies"
        echo "  $0 dev                   # Start development"
        echo "  $0 mongodb               # Start MongoDB"
        echo "  $0 stop                  # Stop everything"
        ;;
esac
