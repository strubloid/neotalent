# Backend Testing Guide

## Overview
This backend uses **Jest** with **TypeScript** and **Supertest** for comprehensive API testing, unit testing, and integration testing. The test suite covers authentication, API endpoints, middleware, services, and database operations.

## 🚀 Quick Start

### Running Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD (no watch, exits after completion)
npm run test:ci

# Run specific test suites
npm test -- --testNamePattern="Auth"
npm test -- --testPathPattern="controllers"
```

## 📁 Test Structure
```
src/
├── controllers/
│   ├── authController.ts
│   ├── authController.test.ts      # API endpoint tests
│   ├── calorieController.ts
│   └── calorieController.test.ts   # API endpoint tests
├── services/
│   ├── openaiService.ts
│   ├── openaiService.test.ts       # Service unit tests
│   ├── authService.ts
│   └── authService.test.ts         # Service unit tests
├── middleware/
│   ├── auth.ts
│   ├── auth.test.ts                # Middleware tests
│   ├── validation.ts
│   └── validation.test.ts          # Validation tests
├── models/
│   ├── User.ts
│   ├── User.test.ts                # Model tests
│   ├── CalorieSearch.ts
│   └── CalorieSearch.test.ts       # Model tests
├── utils/
│   ├── password.ts
│   ├── password.test.ts            # Utility tests
│   └── testHelpers.ts              # Test utilities
└── test/
    ├── setup.ts                    # Global test setup
    ├── teardown.ts                 # Global test teardown
    └── fixtures/                   # Test data fixtures
```

## 🧪 Test Types

### 1. API Integration Tests
Test complete API endpoints with real HTTP requests:

```typescript
// Example: authController.test.ts
import request from 'supertest';
import app from '../app';
import { User } from '../models/User';
import { connectTestDB, clearTestDB, closeTestDB } from '../utils/testHelpers';

describe('Auth Controller', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        nickname: 'Test User',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.body.data.user.nickname).toBe('Test User');
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned

      // Verify user was created in database
      const user = await User.findOne({ username: 'testuser' });
      expect(user).toBeTruthy();
      expect(user?.nickname).toBe('Test User');
    });

    it('should return error for duplicate username', async () => {
      // Create user first
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          nickname: 'Test User',
          password: 'password123'
        });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          nickname: 'Another User',
          password: 'password456'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Username already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser'
          // Missing nickname and password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });

    it('should enforce password strength', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          nickname: 'Test User',
          password: '123' // Too short
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('password');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          nickname: 'Test User',
          password: 'password123'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.headers['set-cookie']).toBeDefined(); // Session cookie
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid credentials');
    });
  });

  describe('POST /api/auth/logout', () => {
    let sessionCookie: string;

    beforeEach(async () => {
      // Register and login to get session
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          nickname: 'Test User',
          password: 'password123'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      sessionCookie = loginResponse.headers['set-cookie'][0];
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out successfully');
    });

    it('should handle logout without session', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
```

### 2. Service Unit Tests
Test business logic in isolation:

```typescript
// Example: openaiService.test.ts
import { OpenAIService } from '../services/openaiService';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai');
const MockedOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

describe('OpenAIService', () => {
  let openaiService: OpenAIService;
  let mockOpenAI: jest.Mocked<OpenAI>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock OpenAI instance
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    } as any;

    MockedOpenAI.mockImplementation(() => mockOpenAI);
    openaiService = new OpenAIService();
  });

  describe('analyzeFood', () => {
    it('should analyze food and return structured data', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              totalCalories: 300,
              totalProtein: 55,
              totalCarbs: 0,
              totalFat: 7,
              breakdown: [{
                food: 'chicken breast',
                calories: 300,
                protein: 55,
                carbs: 0,
                fat: 7,
                quantity: '200g'
              }],
              summary: 'Total: 300 calories - Chicken breast'
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse as any);

      const result = await openaiService.analyzeFood('chicken breast 200g');

      expect(result).toEqual({
        totalCalories: 300,
        totalProtein: 55,
        totalCarbs: 0,
        totalFat: 7,
        breakdown: [{
          food: 'chicken breast',
          calories: 300,
          protein: 55,
          carbs: 0,
          fat: 7,
          quantity: '200g'
        }],
        summary: 'Total: 300 calories - Chicken breast'
      });

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('nutrition expert')
          }),
          expect.objectContaining({
            role: 'user',
            content: 'chicken breast 200g'
          })
        ]),
        temperature: 0.3,
        max_tokens: 1000
      });
    });

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse as any);

      await expect(openaiService.analyzeFood('invalid food'))
        .rejects.toThrow('Failed to parse nutrition analysis');
    });

    it('should handle OpenAI API errors', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('OpenAI API Error')
      );

      await expect(openaiService.analyzeFood('any food'))
        .rejects.toThrow('OpenAI API Error');
    });

    it('should validate required nutrition fields', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              // Missing required fields
              breakdown: []
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse as any);

      await expect(openaiService.analyzeFood('incomplete data'))
        .rejects.toThrow('Invalid nutrition analysis format');
    });
  });

  describe('validateNutritionData', () => {
    it('should validate complete nutrition data', () => {
      const validData = {
        totalCalories: 300,
        totalProtein: 55,
        totalCarbs: 0,
        totalFat: 7,
        breakdown: [{
          food: 'chicken breast',
          calories: 300,
          protein: 55,
          carbs: 0,
          fat: 7,
          quantity: '200g'
        }],
        summary: 'Total: 300 calories'
      };

      expect(() => openaiService.validateNutritionData(validData))
        .not.toThrow();
    });

    it('should reject data with missing fields', () => {
      const invalidData = {
        totalCalories: 300
        // Missing other required fields
      };

      expect(() => openaiService.validateNutritionData(invalidData))
        .toThrow('Invalid nutrition analysis format');
    });

    it('should reject data with invalid breakdown', () => {
      const invalidData = {
        totalCalories: 300,
        totalProtein: 55,
        totalCarbs: 0,
        totalFat: 7,
        breakdown: [
          {
            food: 'chicken breast'
            // Missing required breakdown fields
          }
        ],
        summary: 'Total: 300 calories'
      };

      expect(() => openaiService.validateNutritionData(invalidData))
        .toThrow('Invalid nutrition analysis format');
    });
  });
});
```

### 3. Middleware Tests
Test authentication and validation middleware:

```typescript
// Example: auth.test.ts
import { Request, Response, NextFunction } from 'express';
import { authenticateUser } from '../middleware/auth';
import { User } from '../models/User';

// Mock dependencies
jest.mock('../models/User');
const MockedUser = User as jest.MockedClass<typeof User>;

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      session: {},
      body: {},
      params: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();
  });

  describe('authenticateUser', () => {
    it('should authenticate valid user session', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        nickname: 'Test User'
      };

      mockReq.session = { userId: 'user123' };
      MockedUser.findById = jest.fn().mockResolvedValue(mockUser);

      await authenticateUser(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(MockedUser.findById).toHaveBeenCalledWith('user123');
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject request without session', async () => {
      mockReq.session = {};

      await authenticateUser(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid user ID', async () => {
      mockReq.session = { userId: 'invalid123' };
      MockedUser.findById = jest.fn().mockResolvedValue(null);

      await authenticateUser(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid session'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockReq.session = { userId: 'user123' };
      MockedUser.findById = jest.fn().mockRejectedValue(new Error('DB Error'));

      await authenticateUser(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication error'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
```

### 4. Model Tests
Test Mongoose models and database operations:

```typescript
// Example: User.test.ts
import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { connectTestDB, clearTestDB, closeTestDB } from '../utils/testHelpers';

describe('User Model', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('User Creation', () => {
    it('should create a valid user', async () => {
      const userData = {
        username: 'testuser',
        nickname: 'Test User',
        passwordHash: 'hashedpassword123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe('testuser');
      expect(savedUser.nickname).toBe('Test User');
      expect(savedUser.passwordHash).toBe('hashedpassword123');
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should require username', async () => {
      const userData = {
        nickname: 'Test User',
        passwordHash: 'hashedpassword123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow(/username.*required/);
    });

    it('should require unique username', async () => {
      const userData = {
        username: 'testuser',
        nickname: 'Test User',
        passwordHash: 'hashedpassword123'
      };

      // Create first user
      const user1 = new User(userData);
      await user1.save();

      // Try to create second user with same username
      const user2 = new User(userData);
      
      await expect(user2.save()).rejects.toThrow(/duplicate key/);
    });

    it('should validate username format', async () => {
      const invalidUsernames = [
        'a',           // Too short
        'a'.repeat(51), // Too long
        'user name',   // Contains space
        'user@name',   // Contains invalid character
        ''             // Empty
      ];

      for (const username of invalidUsernames) {
        const user = new User({
          username,
          nickname: 'Test User',
          passwordHash: 'hashedpassword123'
        });

        await expect(user.save()).rejects.toThrow();
      }
    });

    it('should validate nickname length', async () => {
      const user = new User({
        username: 'testuser',
        nickname: 'a'.repeat(101), // Too long
        passwordHash: 'hashedpassword123'
      });

      await expect(user.save()).rejects.toThrow(/nickname.*length/);
    });
  });

  describe('User Methods', () => {
    let user: IUser;

    beforeEach(async () => {
      user = new User({
        username: 'testuser',
        nickname: 'Test User',
        passwordHash: 'hashedpassword123'
      });
      await user.save();
    });

    it('should convert to JSON without sensitive fields', () => {
      const json = user.toJSON();

      expect(json.username).toBe('testuser');
      expect(json.nickname).toBe('Test User');
      expect(json.passwordHash).toBeUndefined();
      expect(json.__v).toBeUndefined();
    });

    it('should find user by username', async () => {
      const foundUser = await User.findOne({ username: 'testuser' });

      expect(foundUser).toBeTruthy();
      expect(foundUser?.username).toBe('testuser');
      expect(foundUser?.nickname).toBe('Test User');
    });

    it('should update user fields', async () => {
      user.nickname = 'Updated Name';
      const updatedUser = await user.save();

      expect(updatedUser.nickname).toBe('Updated Name');
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(
        updatedUser.createdAt.getTime()
      );
    });

    it('should delete user', async () => {
      await User.findByIdAndDelete(user._id);
      
      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });
  });

  describe('User Indexes', () => {
    it('should have username index', async () => {
      const indexes = await User.collection.getIndexes();
      
      expect(indexes).toHaveProperty('username_1');
      expect(indexes.username_1).toContainEqual(['username', 1]);
    });

    it('should enforce unique username constraint', async () => {
      const user1 = new User({
        username: 'testuser',
        nickname: 'User 1',
        passwordHash: 'hash1'
      });
      await user1.save();

      const user2 = new User({
        username: 'testuser',
        nickname: 'User 2',
        passwordHash: 'hash2'
      });

      await expect(user2.save()).rejects.toThrow(/duplicate key/);
    });
  });
});
```

## 🔧 Testing Utilities

### Test Database Setup
```typescript
// src/utils/testHelpers.ts
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export const connectTestDB = async (): Promise<void> => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    console.log('Connected to test database');
  } catch (error) {
    console.error('Error connecting to test database:', error);
    throw error;
  }
};

export const clearTestDB = async (): Promise<void> => {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  } catch (error) {
    console.error('Error clearing test database:', error);
    throw error;
  }
};

export const closeTestDB = async (): Promise<void> => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    console.log('Disconnected from test database');
  } catch (error) {
    console.error('Error closing test database:', error);
    throw error;
  }
};

// Test data factories
export const createTestUser = async (overrides: Partial<any> = {}) => {
  const userData = {
    username: 'testuser',
    nickname: 'Test User',
    passwordHash: 'hashedpassword123',
    ...overrides
  };

  const user = new User(userData);
  return await user.save();
};

export const createTestCalorieSearch = async (userId: string, overrides: Partial<any> = {}) => {
  const searchData = {
    userId,
    query: 'chicken breast',
    totalCalories: 300,
    totalProtein: 55,
    totalCarbs: 0,
    totalFat: 7,
    breakdown: [{
      food: 'chicken breast',
      calories: 300,
      protein: 55,
      carbs: 0,
      fat: 7,
      quantity: '200g'
    }],
    summary: 'Total: 300 calories',
    ...overrides
  };

  const search = new CalorieSearch(searchData);
  return await search.save();
};

// Mock data generators
export const mockNutritionResponse = (overrides: Partial<any> = {}) => ({
  totalCalories: 300,
  totalProtein: 55,
  totalCarbs: 0,
  totalFat: 7,
  breakdown: [{
    food: 'chicken breast',
    calories: 300,
    protein: 55,
    carbs: 0,
    fat: 7,
    quantity: '200g'
  }],
  summary: 'Total: 300 calories',
  ...overrides
});

// HTTP request helpers
export const loginUser = async (app: any, credentials: any) => {
  const response = await request(app)
    .post('/api/auth/login')
    .send(credentials);
    
  return response.headers['set-cookie'][0];
};

export const createAuthenticatedRequest = (app: any, sessionCookie: string) => {
  return request(app).set('Cookie', sessionCookie);
};
```

### Environment Setup
```typescript
// src/test/setup.ts
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-key';
process.env.SESSION_SECRET = 'test-secret';

// Increase timeout for async operations
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Any global setup
});

afterAll(async () => {
  // Any global cleanup
});
```

## 📊 Code Coverage

### Viewing Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# Coverage files are generated in:
coverage/
├── lcov-report/
│   └── index.html          # Open this in browser
├── lcov.info               # For CI/CD systems
├── coverage-final.json     # Raw coverage data
└── text-summary.txt        # Terminal summary
```

### Coverage Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.test.{ts,js}',
    '!src/**/*.d.ts',
    '!src/test/**',
    '!src/types/**'
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/']
};
```

## 🚨 Common Testing Patterns

### Testing Authentication Flow
```typescript
describe('Protected Routes', () => {
  let app: any;
  let sessionCookie: string;

  beforeEach(async () => {
    // Create user and login
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        nickname: 'Test User',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });

    sessionCookie = loginResponse.headers['set-cookie'][0];
  });

  it('should access protected route with valid session', async () => {
    const response = await request(app)
      .get('/api/calories/history')
      .set('Cookie', sessionCookie)
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('should reject protected route without session', async () => {
    await request(app)
      .get('/api/calories/history')
      .expect(401);
  });
});
```

### Testing Error Handling
```typescript
describe('Error Handling', () => {
  it('should handle validation errors', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'a', // Too short
        password: '123' // Too short
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('validation');
  });

  it('should handle server errors gracefully', async () => {
    // Mock a service to throw error
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      })
      .expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Internal server error');
  });
});
```

### Testing Async Operations
```typescript
describe('Async Operations', () => {
  it('should handle OpenAI API calls', async () => {
    // Mock OpenAI service
    const mockAnalyze = jest.fn().mockResolvedValue({
      totalCalories: 300,
      totalProtein: 55,
      summary: 'Nutrition analysis'
    });

    OpenAIService.prototype.analyzeFood = mockAnalyze;

    const response = await request(app)
      .post('/api/calories/analyze')
      .set('Cookie', sessionCookie)
      .send({ query: 'chicken breast' })
      .expect(200);

    expect(mockAnalyze).toHaveBeenCalledWith('chicken breast');
    expect(response.body.data.totalCalories).toBe(300);
  });

  it('should handle timeout errors', async () => {
    // Mock service to timeout
    const mockAnalyze = jest.fn().mockImplementation(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 100)
      )
    );

    OpenAIService.prototype.analyzeFood = mockAnalyze;

    const response = await request(app)
      .post('/api/calories/analyze')
      .set('Cookie', sessionCookie)
      .send({ query: 'chicken breast' })
      .expect(500);

    expect(response.body.success).toBe(false);
  });
});
```

## 🎯 Best Practices

### 1. Test Structure (AAA Pattern)
```typescript
it('should create user successfully', async () => {
  // Arrange
  const userData = {
    username: 'testuser',
    nickname: 'Test User',
    password: 'password123'
  };

  // Act
  const response = await request(app)
    .post('/api/auth/register')
    .send(userData);

  // Assert
  expect(response.status).toBe(201);
  expect(response.body.success).toBe(true);
});
```

### 2. Isolate Tests
```typescript
beforeEach(async () => {
  // Clear database before each test
  await clearTestDB();
  
  // Reset all mocks
  jest.clearAllMocks();
});
```

### 3. Test Edge Cases
```typescript
describe('Edge Cases', () => {
  it('should handle very long food descriptions', async () => {
    const longDescription = 'a'.repeat(10000);
    
    const response = await request(app)
      .post('/api/calories/analyze')
      .set('Cookie', sessionCookie)
      .send({ query: longDescription })
      .expect(400);

    expect(response.body.error).toContain('too long');
  });

  it('should handle special characters', async () => {
    const specialChars = '<script>alert("xss")</script>';
    
    const response = await request(app)
      .post('/api/calories/analyze')
      .set('Cookie', sessionCookie)
      .send({ query: specialChars });

    // Should sanitize or reject malicious input
    expect(response.status).toBeLessThan(500);
  });
});
```

### 4. Mock External Services
```typescript
// Mock OpenAI in tests
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  }))
}));
```

## 🔍 Debugging Tests

### Running Specific Tests
```bash
# Run tests for specific controller
npm test authController

# Run tests matching pattern
npm test -- --testNamePattern="login"

# Run tests in specific file
npm test -- --testPathPattern="auth"

# Run with verbose output
npm test -- --verbose

# Run single test
npm test -- --testNamePattern="should register user"
```

### Debug Configuration
```typescript
// For debugging specific tests
describe.only('Debug Test', () => {
  it.only('should debug this test', async () => {
    // Add debugger statement
    debugger;
    
    // Test code here
  });
});
```

### Logging in Tests
```typescript
it('should debug test execution', async () => {
  console.log('Starting test...');
  
  const response = await request(app)
    .post('/api/auth/login')
    .send({ username: 'test', password: 'test' });
    
  console.log('Response:', response.body);
  console.log('Status:', response.status);
  
  expect(response.status).toBe(200);
});
```

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
name: Backend Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        cache-dependency-path: backend/package-lock.json

    - name: Install dependencies
      run: |
        cd backend
        npm ci

    - name: Run linting
      run: |
        cd backend
        npm run lint

    - name: Run type checking
      run: |
        cd backend
        npm run type-check

    - name: Run tests
      run: |
        cd backend
        npm run test:ci
      env:
        NODE_ENV: test
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

    - name: Generate coverage report
      run: |
        cd backend
        npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./backend/coverage/lcov.info
        directory: ./backend/coverage
        flags: backend
        name: backend-coverage
```

### Docker Test Environment
```dockerfile
# Dockerfile.test
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=development

# Copy source code
COPY . .

# Run tests
CMD ["npm", "run", "test:ci"]
```

### Test Scripts Summary
```json
{
  "scripts": {
    "test": "jest --watchAll",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:debug": "node --inspect-brk -r ts-node/register node_modules/.bin/jest --runInBand",
    "lint": "eslint src/**/*.ts",
    "type-check": "tsc --noEmit"
  }
}
```

## 📋 Testing Checklist

When adding new features or endpoints:

### API Endpoints
- [ ] Test successful requests with valid data
- [ ] Test validation with invalid data
- [ ] Test authentication/authorization
- [ ] Test error responses (400, 401, 403, 404, 500)
- [ ] Test edge cases (empty data, large data, special characters)
- [ ] Test rate limiting (if applicable)

### Services
- [ ] Test main functionality with valid inputs
- [ ] Test error handling with invalid inputs
- [ ] Test external API failures
- [ ] Test timeout scenarios
- [ ] Mock all external dependencies

### Models
- [ ] Test successful creation with valid data
- [ ] Test validation rules
- [ ] Test unique constraints
- [ ] Test relationships/references
- [ ] Test model methods and virtuals

### Middleware
- [ ] Test successful execution
- [ ] Test error conditions
- [ ] Test authentication/authorization logic
- [ ] Test request modification
- [ ] Test next() calls

### Integration Tests
- [ ] Test complete user flows
- [ ] Test database transactions
- [ ] Test session management
- [ ] Test file operations
- [ ] Test concurrent requests

---

This comprehensive testing setup ensures robust, reliable backend services with confidence in deployments and feature additions.
