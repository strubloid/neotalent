@echo off
echo 🚀 Setting up NeoTalent Calorie Tracker...

:: Check if Node.js is installed
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ and try again.
    pause
    exit /b 1
)

echo ✅ Node.js detected
node -v

:: Install dependencies
echo 📦 Installing dependencies...
call npm install

:: Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please add your OpenAI API key to the .env file before starting the server.
)

echo 🧪 Running tests...
call npm test

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Add your OpenAI API key to the .env file
echo 2. Run 'npm start' to start the production server
echo 3. Or run 'npm run dev' for development mode
echo 4. Open http://localhost:3000 in your browser
echo.
echo Happy coding! 🎉
pause
