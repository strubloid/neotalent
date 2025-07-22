@echo off
echo 🚀 Starting NeoTalent Calorie Tracker
echo ====================================

rem Check if we're in the right directory
if not exist "server.js" (
    echo ❌ Error: Please run this script from the neotalent project directory
    pause
    exit /b 1
)

rem Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

rem Check if .env file exists
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please add your OpenAI API key to the .env file
)

echo.
echo ✅ Starting Node.js backend server...
echo 📍 Backend will be available at: http://localhost:3000
echo 🌐 Frontend will be available at: http://localhost:3000
echo.
echo 🔍 Features available:
echo    • AI-powered calorie analysis
echo    • Breadcrumb navigation (recent searches)
echo    • Search history with persistence
echo    • Session management
echo.
echo 📡 API Endpoints:
echo    • POST /api/calories - Analyze food
echo    • GET /api/breadcrumbs - Recent searches
echo    • GET /api/searches/:id - Load specific search
echo    • GET /api/history - Full search history
echo    • GET /health - Health check
echo.
echo 🛑 Press Ctrl+C to stop the server
echo.

rem Start the server
node server.js
