# Backend Codebase Explanation

## What the Project Does and Who It's For
This is the backend API for the "AI Calorie Tracker" web application. It provides endpoints for nutrition analysis (using OpenAI), user authentication, and search history management. The backend is designed for users of the calorie tracker frontend, supporting both anonymous and registered users.

## Project Structure and Rationale
- **`src/`**: All TypeScript source code, organized by responsibility:
  - **`config/`**: App, database, and environment configuration.
  - **`controllers/`**: Route logic for nutrition analysis and authentication.
  - **`interfaces/`**: TypeScript interfaces for models, requests, and responses.
  - **`middleware/`**: Express middleware (error handling, etc.).
  - **`models/`**: Mongoose models (e.g., User).
  - **`routes/`**: API route definitions.
  - **`services/`**: Business logic and integrations (OpenAI, session, etc.).
  - **`utils/`**: Helper functions (validation, sanitization, etc.).
  - **`__tests__/`**: Unit/integration tests.
  - **`server.ts`**: Main entry point, sets up and starts the server.
- **`sessions/`**: Stores session files for express-session (file-based session store).
- **Config files**: TypeScript, environment, and Docker configs for robust development and deployment.

This structure separates concerns, making the backend maintainable and scalable.

## Frameworks, Libraries, and Build Tools
- **Express**: Main web framework for API endpoints.
- **TypeScript**: For static typing and maintainability.
- **Mongoose**: MongoDB object modeling for user and history data.
- **OpenAI SDK**: For AI-powered nutrition analysis.
- **Joi**: Input validation.
- **express-session** & **session-file-store**: Session management (file-based, Docker-friendly).
- **Helmet**: Security headers.
- **dotenv**: Environment variable management.
- **Jest** & **Supertest**: Testing.
- **ESLint**: Linting.
- **Docker**: Containerized deployment.

## App Startup and Main Flow
- The app starts at `src/server.ts`, which loads environment variables, configures Express, connects to MongoDB, and sets up middleware, routes, and error handling.
- Main API endpoints are under `/api/` (see `routes/apiRoutes.ts`).
- Nutrition analysis requests are handled by the `NutritionController`, which calls OpenAI for food analysis.
- Authentication and user management are handled by the `AuthController` and `User` model.

## Key Files and Components
- **`server.ts`**: Loads config, sets up Express, connects to DB, and starts the server.
- **`config/appConfig.ts`**: Centralizes all app, security, and service config (from environment variables).
- **`config/database.ts`**: Handles MongoDB connection and status.
- **`routes/apiRoutes.ts`**: Defines all API endpoints (health, info, auth, nutrition, etc.).
- **`controllers/NutritionController.ts`**: Handles nutrition analysis requests (validates, sanitizes, calls OpenAI).
- **`controllers/AuthController.ts`**: Handles registration, login, logout, and user management.
- **`models/User.ts`**: Mongoose user schema, with password hashing and search history.
- **`services/OpenAIService.ts`**: Encapsulates OpenAI API calls for nutrition analysis.
- **`middleware/ErrorHandler.ts`**: Global error handling for all API routes.
- **`interfaces/`**: TypeScript interfaces for all major data structures.

## Routing, State, and Data Handling
- **Routing**: All API endpoints are defined in `routes/apiRoutes.ts` and handled by controllers.
- **State**: User sessions are managed via express-session (file-based store for Docker compatibility).
- **Data**: User and search history data are stored in MongoDB via Mongoose models.
- **AI Integration**: Nutrition analysis is performed by calling OpenAI's API with user input.

## Security and Validation
- **Helmet**: Sets HTTP security headers.
- **Joi**: Validates incoming requests.
- **Input Sanitization**: User input is sanitized before processing.
- **Session Management**: Uses secure, file-based sessions.
- **Password Hashing**: Uses Node.js crypto for password hashing (no bcrypt, for Docker compatibility).

## Testing, Environment, and Deployment
- **Testing**: Jest and Supertest for unit/integration tests (`__tests__/` folder, test scripts in package.json).
- **Environment**: `.env.example` and dotenv for config; all sensitive info is loaded from environment variables.
- **Deployment**: Dockerfile builds and runs the app, with a non-root user and health checks. Sessions are file-based for persistence in containers.

## Notable or Clever Aspects
- **File-based Sessions**: Uses session-file-store for Docker compatibility (no Redis needed).
- **Password Hashing**: Uses Node.js crypto (pbkdf2) for hashing, avoiding native bcrypt dependency.
- **OpenAI Integration**: Modular service for AI-powered nutrition analysis.
- **Strong Typing**: TypeScript interfaces for all models, requests, and responses.
- **Graceful Shutdown**: Handles SIGINT/SIGTERM for clean shutdowns.
- **Config Validation**: Validates all required config at startup.
- **Security**: Helmet, input validation, and error handling throughout.

---

This backend is a robust, TypeScript-based Express API for AI-powered calorie/nutrition tracking, with clear separation of concerns, strong security, and production-ready deployment. It is approachable for new developers and easy to extend.
