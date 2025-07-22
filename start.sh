#!/bin/bash

echo "🚀 Starting NeoTalent Calorie Tracker"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: Please run this script from the neotalent project directory"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please add your OpenAI API key to the .env file"
fi

echo ""
echo "✅ Starting Node.js backend server..."
echo "📍 Backend will be available at: http://localhost:3000"
echo "🌐 Frontend will be available at: http://localhost:3000"
echo ""
echo "🔍 Features available:"
echo "   • AI-powered calorie analysis"
echo "   • Breadcrumb navigation (recent searches)"
echo "   • Search history with persistence"
echo "   • Session management"
echo ""
echo "📡 API Endpoints:"
echo "   • POST /api/calories - Analyze food"
echo "   • GET /api/breadcrumbs - Recent searches"
echo "   • GET /api/searches/:id - Load specific search"
echo "   • GET /api/history - Full search history"
echo "   • GET /health - Health check"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the server
node server.js
