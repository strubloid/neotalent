# 🚀 NeoTalent Calorie Tracker - Docker & TypeScript Migration Complete!

## � What We've Accomplished

### ✅ Complete Authentication System
- User registration with username, password, and nickname
- Secure login/logout functionality  
- Session-based authentication with MongoDB storage
- Account deletion capability
- Breadcrumb/search history that works for both authenticated and guest users

### ✅ Full Docker Environment
- **MongoDB Service**: Containerized database with initialization
- **Backend Service**: Node.js + TypeScript + Express API
- **Frontend Service**: React + TypeScript SPA
- **Development & Production** configurations
- **Docker Compose** setup for easy deployment

### ✅ TypeScript Conversion
- **Backend**: Fully converted to TypeScript with proper types
- **Frontend**: React + TypeScript with component architecture  
- **Type Safety**: Comprehensive type definitions for all API interactions
- **Build Pipeline**: Production-ready TypeScript compilation

### ✅ Modern Architecture
- **Microservices**: Separate containerized services
- **RESTful API**: Clean backend API with proper error handling
- **React Components**: Modern functional components with hooks
- **Session Management**: Secure authentication with MongoDB persistence
docker-compose -f docker-compose.dev.yml up frontend

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend
```

## 🛠 Local Development (without Docker)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp ../env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB** (if not using Docker)
   ```bash
   # Using Docker for MongoDB only
   docker run -d -p 27017:27017 --name mongodb \
     -e MONGO_INITDB_ROOT_USERNAME=neotalent \
     -e MONGO_INITDB_ROOT_PASSWORD=neotalent123 \
     mongo:7.0
   ```

5. **Run backend**
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run frontend**
   ```bash
   # Development mode
   npm start
   
   # Production build
   npm run build
   ```

## 🏗 Architecture

### Technology Stack

**Backend:**
- Node.js + TypeScript
- Express.js
- MongoDB with Mongoose
- OpenAI API integration
- bcrypt for password hashing
- Express sessions for authentication

**Frontend:**
- React 18 with TypeScript
- Bootstrap 5 for styling
- Axios for API calls
- React Hooks for state management

**Infrastructure:**
- Docker & Docker Compose
- nginx for production frontend serving
- MongoDB for data persistence

### Project Structure

```
neotalent/
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── config/            # Database and app configuration
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/           # Utilities and validation
│   │   └── server.ts        # Main server file
│   ├── dist/                # TypeScript build output
│   ├── Dockerfile           # Production container
│   ├── Dockerfile.dev       # Development container
│   ├── package.json
│   └── tsconfig.json
├── frontend/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API services
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── build/              # React build output
│   ├── Dockerfile          # Production container
│   ├── Dockerfile.dev      # Development container
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml        # Production compose
├── docker-compose.dev.yml    # Development compose
└── README.md
```

## 🔐 Authentication

The application includes a complete authentication system:

- **User Registration**: Username, password, and nickname
- **User Login/Logout**: Session-based authentication
- **Account Management**: Users can delete their accounts
- **Session Management**: Secure session handling with Express sessions

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `DELETE /api/auth/delete` - Delete user account
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/status` - Check authentication status

**Nutrition:**
- `POST /api/nutrition/analyze` - Analyze food calories
- `GET /api/breadcrumbs` - Get user's search history
- `DELETE /api/history` - Clear search history
- `GET /api/searches/:id` - Load previous search

## 📊 Features

### Core Features
- ✅ AI-powered calorie estimation using OpenAI
- ✅ User authentication and account management
- ✅ Search history with breadcrumbs
- ✅ Detailed nutrition breakdown (calories, protein, carbs, fat)
- ✅ Responsive design with Bootstrap
- ✅ Session-based storage for authenticated users
- ✅ Local storage fallback for guest users

### Technical Features
- ✅ TypeScript for type safety
- ✅ Docker containerization
- ✅ MongoDB integration
- ✅ RESTful API design
- ✅ Error handling and validation
- ✅ Security middleware (helmet, CORS, rate limiting)
- ✅ Production-ready configuration

## 🚦 Environment Variables

### Backend (.env)
```bash
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/neotalent
SESSION_SECRET=your-session-secret
OPENAI_API_KEY=your-openai-api-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:3000
```

### Frontend
The frontend uses the proxy configuration in package.json for development, and environment variables are passed through Docker for production.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   ```bash
   # Check if MongoDB container is running
   docker ps | grep mongo
   
   # Check logs
   docker-compose logs mongodb
   ```

2. **Backend TypeScript Compilation Issues**
   ```bash
   # Clean and rebuild
   cd backend
   rm -rf dist node_modules
   npm install
   npm run build
   ```

3. **Frontend Build Issues**
   ```bash
   # Clean and rebuild
   cd frontend
   rm -rf build node_modules
   npm install
   npm run build
   ```

4. **Port Conflicts**
   ```bash
   # Check what's using the ports
   lsof -i :3000
   lsof -i :3001
   lsof -i :27017
   ```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Development Workflow

1. **Feature Development**
   ```bash
   # Start development environment
   docker-compose -f docker-compose.dev.yml up
   
   # Make changes to code (hot reload enabled)
   # Test changes in browser
   ```

2. **Production Deployment**
   ```bash
   # Build and start production environment
   docker-compose up --build -d
   
   # Check logs
   docker-compose logs -f
   ```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

For more details, check the individual README files in the backend and frontend directories.
