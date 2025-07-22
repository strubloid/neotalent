# NeoTalent - AI Calorie Tracker

A simple, production-ready web application that uses AI to estimate calorie information for meals and ingredients.

## Features

- **AI-Powered Calorie Estimation**: Input meals or ingredients to get detailed calorie breakdowns
- **Clean Bootstrap UI**: Responsive, modern interface
- **Real-time Processing**: Fast API responses with AI integration
- **Input Validation**: Robust form validation and error handling

## Tech Stack

- **Frontend**: HTML5, Bootstrap 5, Vanilla JavaScript
- **Backend**: Node.js with Express
- **AI Integration**: OpenAI GPT API
- **Testing**: Jest for unit and integration tests

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Add your OpenAI API key to .env
   ```

3. Run the application:
   ```bash
   npm start
   ```

4. Open http://localhost:3000 in your browser

## Testing

Run tests with:
```bash
npm test
```

## Architecture

- Single-page application with clean separation of concerns
- RESTful API design
- Environment-based configuration
- Comprehensive error handling
- Input sanitization and validation
