import { OpenAIService } from '../services/OpenAIService';

// Mock the OpenAI library
jest.mock('openai');

describe('OpenAIService', () => {
  let openAIService: OpenAIService;
  let mockOpenAI: any;

  beforeEach(() => {
    // Set default API key for testing
    process.env.OPENAI_API_KEY = 'test-api-key';
    
    // Get the mocked OpenAI instance
    const { OpenAI } = require('openai');
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    };
    
    // Mock the OpenAI constructor to return our mock
    OpenAI.mockImplementation(() => mockOpenAI);
    
    openAIService = new OpenAIService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('testConnection', () => {
    it('should return success when API key is configured and connection works', async () => {
      // Mock successful API call
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'OpenAI connection successful' } }]
      });

      const result = await openAIService.testConnection();

      expect(result).toEqual({
        success: true,
        message: 'OpenAI connection successful',
        configured: true
      });
    });

    it('should return failure when API key is not configured', async () => {
      delete process.env.OPENAI_API_KEY;
      
      // Create new service instance without API key
      openAIService = new OpenAIService();

      const result = await openAIService.testConnection();

      expect(result).toEqual({
        success: false,
        message: 'OpenAI API key not configured',
        configured: false
      });
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      const apiError = new Error('API Error');
      mockOpenAI.chat.completions.create.mockRejectedValue(apiError);

      const result = await openAIService.testConnection();

      expect(result).toEqual({
        success: false,
        message: 'OpenAI connection failed: API Error',
        configured: true
      });
    });
  });

  describe('analyzeNutrition', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-api-key';
    });

    it('should return nutrition data for valid food description', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
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
              summary: 'A slice of homemade apple pie with cinnamon and sugar'
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await openAIService.analyzeNutrition('apple pie');

      expect(result).toMatchObject({
        searchId: 'test-123',
        query: 'apple pie',
        totalCalories: 320,
        totalProtein: 4,
        totalCarbs: 58,
        totalFat: 12
      });
      expect(result).toHaveProperty('timestamp');
      expect(result.breakdown).toHaveLength(1);
    });

    it('should handle invalid JSON response from OpenAI', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      await expect(openAIService.analyzeNutrition('apple pie'))
        .rejects
        .toThrow('Failed to parse nutrition data');
    });

    it('should handle empty response from OpenAI', async () => {
      const mockResponse = {
        choices: []
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      await expect(openAIService.analyzeNutrition('apple pie'))
        .rejects
        .toThrow('No response from OpenAI');
    });

    it('should handle OpenAI API errors', async () => {
      const apiError = new Error('API rate limit exceeded');
      mockOpenAI.chat.completions.create.mockRejectedValue(apiError);

      await expect(openAIService.analyzeNutrition('apple pie'))
        .rejects
        .toThrow('API rate limit exceeded');
    });

    it('should throw error when API key is not configured', async () => {
      delete process.env.OPENAI_API_KEY;
      
      // Create new service instance without API key
      openAIService = new OpenAIService();

      await expect(openAIService.analyzeNutrition('apple pie'))
        .rejects
        .toThrow('OpenAI API key not configured');
    });

    it('should include timestamp in response', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              searchId: 'test-123',
              query: 'apple pie',
              totalCalories: 320,
              totalProtein: 4,
              totalCarbs: 58,
              totalFat: 12,
              breakdown: [],
              summary: 'Test summary'
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await openAIService.analyzeNutrition('apple pie');

      expect(result).toHaveProperty('timestamp');
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });
});
