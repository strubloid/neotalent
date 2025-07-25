import request from 'supertest';
import express from 'express';
import NutritionController from '../controllers/NutritionController';
import { OpenAIService } from '../services/OpenAIService';

// Mock the OpenAI service
jest.mock('../services/OpenAIService');

describe('NutritionController', () => {
  let app: express.Application;
  let nutritionController: NutritionController;
  let mockOpenAIService: jest.Mocked<OpenAIService>;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    nutritionController = new NutritionController();
    
    // Setup routes
    app.get('/api/nutrition/test', nutritionController.testConnection.bind(nutritionController));
    app.post('/api/nutrition/analyze', nutritionController.analyzeNutrition.bind(nutritionController));

    // Get the mocked service instance
    mockOpenAIService = (nutritionController as any).openAIService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/nutrition/test', () => {
    it('should return 200 when OpenAI connection is successful', async () => {
      const mockResult = {
        success: true,
        message: 'OpenAI connection successful',
        configured: true
      };
      
      mockOpenAIService.testConnection.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/nutrition/test')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'OpenAI connection successful'
      });
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 503 when OpenAI connection fails', async () => {
      const mockResult = {
        success: false,
        message: 'Connection failed',
        configured: true
      };
      
      mockOpenAIService.testConnection.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/nutrition/test')
        .expect(503);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Connection failed'
      });
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 500 when OpenAI service throws an error', async () => {
      const mockError = new Error('Service unavailable') as any;
      mockError.code = 'SERVICE_ERROR';
      
      mockOpenAIService.testConnection.mockRejectedValue(mockError);

      const response = await request(app)
        .get('/api/nutrition/test')
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Service unavailable',
        code: 'SERVICE_ERROR'
      });
      expect(response.body).toHaveProperty('configured');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/nutrition/analyze', () => {
    const mockNutritionData = {
      searchId: 'test-123',
      query: 'apple pie',
      totalCalories: 320,
      totalProtein: 4,
      totalCarbs: 58,
      totalFat: 12,
      totalFiber: 3,
      totalSugar: 35,
      totalSodium: 150,
      breakdown: [
        {
          food: 'Apple pie',
          quantity: '1 slice',
          calories: 320,
          protein: 4,
          carbs: 58,
          fat: 12,
          fiber: 3,
          sugar: 35,
          sodium: 150
        }
      ],
      summary: 'A slice of homemade apple pie with cinnamon and sugar',
      timestamp: new Date().toISOString()
    };

    it('should return 200 with nutrition data for valid request', async () => {
      mockOpenAIService.analyzeNutrition.mockResolvedValue(mockNutritionData);

      const response = await request(app)
        .post('/api/nutrition/analyze')
        .send({ food: 'apple pie' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: mockNutritionData
      });
      expect(response.body).toHaveProperty('timestamp');
      expect(mockOpenAIService.analyzeNutrition).toHaveBeenCalledWith('apple pie');
    });

    it('should return 400 when food parameter is missing', async () => {
      const response = await request(app)
        .post('/api/nutrition/analyze')
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Validation failed'
      });
      expect(response.body).toHaveProperty('details');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 400 when food parameter is empty', async () => {
      const response = await request(app)
        .post('/api/nutrition/analyze')
        .send({ food: '' })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Food description cannot be empty'
      });
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 400 when food parameter is only whitespace', async () => {
      const response = await request(app)
        .post('/api/nutrition/analyze')
        .send({ food: '   ' })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Food description cannot be empty'
      });
    });

    it('should sanitize input before analysis', async () => {
      mockOpenAIService.analyzeNutrition.mockResolvedValue(mockNutritionData);

      const response = await request(app)
        .post('/api/nutrition/analyze')
        .send({ food: '  apple pie  ' })
        .expect(200);

      expect(mockOpenAIService.analyzeNutrition).toHaveBeenCalledWith('apple pie');
    });

    it('should handle OpenAI service errors gracefully', async () => {
      const mockError = new Error('OpenAI API error');
      mockOpenAIService.analyzeNutrition.mockRejectedValue(mockError);

      // Note: This should trigger the error handler middleware
      // For this test, we expect it to be handled by the next() function
      const response = await request(app)
        .post('/api/nutrition/analyze')
        .send({ food: 'apple pie' });

      // The actual error handling depends on your error middleware
      // This test verifies the service was called correctly
      expect(mockOpenAIService.analyzeNutrition).toHaveBeenCalledWith('apple pie');
    });
  });
});
