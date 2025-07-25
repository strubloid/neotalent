import request from 'supertest';
import express from 'express';
import AuthController from '../controllers/AuthController';
import User from '../models/User';
import { SessionHelper } from '../services/SessionHelper';

// Add Jest types
/// <reference types="jest" />

// Mock the User model
jest.mock('../models/User');
jest.mock('../services/SessionHelper');

const MockedUser = User as jest.Mocked<typeof User>;

describe('AuthController', () => {
  let app: express.Application;
  let authController: AuthController;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.session = {
        isAuthenticated: false,
        save: jest.fn((callback) => callback()),
        destroy: jest.fn((callback) => callback())
      } as any;
      next();
    });
    
    authController = new AuthController();
    
    // Mock routes for testing
    app.post('/api/auth/register', authController.register.bind(authController));
    app.post('/api/auth/login', authController.login.bind(authController));
    app.post('/api/auth/logout', authController.logout.bind(authController));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('should return 400 if username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'password123',
          nickname: 'TestUser'
        })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Username, password, and nickname are required'
      });
    });

    test('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          nickname: 'TestUser'
        })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Username, password, and nickname are required'
      });
    });

    test('should return 400 if nickname is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Username, password, and nickname are required'
      });
    });

    test('should return 409 if username already exists', async () => {
      const existingUser = {
        _id: 'existing-user-id',
        username: 'testuser',
        nickname: 'Existing User'
      };

      MockedUser.findByUsername.mockResolvedValue(existingUser as any);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          nickname: 'TestUser'
        })
        .expect(409);

      expect(response.body).toEqual({
        success: false,
        message: 'Username already exists'
      });
    });

    test('should create user successfully with valid data', async () => {
      const newUser = {
        _id: 'new-user-id',
        username: 'newuser',
        nickname: 'New User',
        save: jest.fn().mockResolvedValue({
          _id: 'new-user-id',
          username: 'newuser',
          nickname: 'New User'
        })
      };

      MockedUser.findByUsername.mockResolvedValue(null);
      // Fix: Use proper constructor mocking
      (MockedUser as any).mockImplementation(() => newUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'password123',
          nickname: 'New User'
        })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User registered successfully'
      });
      expect(response.body.user).toMatchObject({
        username: 'newuser',
        nickname: 'New User'
      });
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should handle database errors during registration', async () => {
      MockedUser.findByUsername.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          nickname: 'TestUser'
        })
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Internal server error during registration'
      });
    });
  });

  describe('POST /api/auth/login', () => {
    test('should return 400 if username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 401 if user does not exist', async () => {
      MockedUser.findByUsername.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid username or password'
      });
    });

    test('should return 401 if password is incorrect', async () => {
      const existingUser = {
        _id: 'user-id',
        username: 'testuser',
        password: 'correctpassword',
        nickname: 'Test User',
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      MockedUser.findByUsername.mockResolvedValue(existingUser as any);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid username or password'
      });
    });

    test('should login successfully with correct credentials', async () => {
      const existingUser = {
        _id: 'user-id',
        username: 'testuser',
        password: 'password123',
        nickname: 'Test User',
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      MockedUser.findByUsername.mockResolvedValue(existingUser as any);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Login successful'
      });
      expect(response.body.user).toMatchObject({
        username: 'testuser',
        nickname: 'Test User'
      });
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should handle database errors during login', async () => {
      MockedUser.findByUsername.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Internal server error during login'
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Logout successful'
      });
    });

    test('should handle session destruction errors', async () => {
      // Create a new app instance for this test
      const testApp = express();
      testApp.use(express.json());
      
      // Mock session with error
      testApp.use((req, res, next) => {
        req.session = {
          destroy: jest.fn((callback) => callback(new Error('Session error')))
        } as any;
        next();
      });
      
      testApp.post('/api/auth/logout', authController.logout.bind(authController));

      const response = await request(testApp)
        .post('/api/auth/logout')
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Logout failed'
      });
    });
  });

  describe('GET /api/auth/profile', () => {
    test('should return user profile when authenticated', async () => {
      // Create a new app instance for this test with authenticated session
      const testApp = express();
      testApp.use(express.json());
      testApp.use((req, res, next) => {
        req.session = {
          isAuthenticated: true,
          userId: 'user-id',
          username: 'testuser',
          nickname: 'Test User'
        } as any;
        next();
      });

      jest.spyOn(SessionHelper, 'isAuthenticated').mockReturnValue(true);
      
      testApp.get('/api/auth/profile', authController.getCurrentUser.bind(authController));

      const response = await request(testApp)
        .get('/api/auth/profile')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        user: {
          id: 'user-id',
          username: 'testuser',
          nickname: 'Test User',
          createdAt: expect.any(String)
        }
      });
    });

    test('should return 401 when not authenticated', async () => {
      jest.spyOn(SessionHelper, 'isAuthenticated').mockReturnValue(false);

      // Create test app for this test
      const testApp = express();
      testApp.use(express.json());
      testApp.use((req, res, next) => {
        req.session = {
          isAuthenticated: false
        } as any;
        next();
      });
      
      testApp.get('/api/auth/profile', authController.getCurrentUser.bind(authController));

      const response = await request(testApp)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Not authenticated'
      });
    });
  });
});
