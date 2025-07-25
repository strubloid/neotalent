import request from 'supertest';
import express from 'express';
import AuthController from '../controllers/AuthController';

// Add Jest types
/// <reference types="jest" />

// Mock the User model
jest.mock('../models/User');
jest.mock('../services/SessionHelper');

describe('AuthController', () => {
  let app: express.Application;
  let authController: AuthController;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    authController = new AuthController();
    
    // Mock routes for testing
    app.post('/api/auth/register', authController.register.bind(authController));
    app.post('/api/auth/login', authController.login.bind(authController));
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
  });
});
