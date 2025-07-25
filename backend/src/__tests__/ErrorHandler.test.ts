import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../middleware/ErrorHandler';

describe('ErrorHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      url: '/api/test',
      method: 'GET',
      originalUrl: '/api/test'
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    it('should handle generic errors with 500 status', () => {
      const error = new Error('Generic error message') as any;

      ErrorHandler.handle(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        status: 500,
        timestamp: expect.any(String)
      });
    });

    it('should handle errors with custom status codes', () => {
      const error = new Error('Bad request') as any;
      error.status = 400;
      error.message = 'Bad request';

      ErrorHandler.handle(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Bad request',
        status: 400,
        timestamp: expect.any(String)
      });
    });

    it('should handle Joi validation errors', () => {
      const error = new Error('Validation failed') as any;
      error.isJoi = true;
      error.details = [{ message: 'Username is required' }];

      ErrorHandler.handle(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: 'Username is required',
        status: 400,
        timestamp: expect.any(String)
      });
    });

    it('should handle OpenAI API errors', () => {
      const error = new Error('OpenAI API Error') as any;
      error.code = 'OPENAI_API_ERROR';
      error.status = 429;

      ErrorHandler.handle(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'OpenAI API Error',
        code: 'OPENAI_API_ERROR',
        status: 429,
        timestamp: expect.any(String)
      });
    });

    it('should handle JSON parse errors', () => {
      const error = new Error('Invalid JSON') as any;
      error.type = 'entity.parse.failed';

      ErrorHandler.handle(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid JSON in request body',
        status: 400,
        timestamp: expect.any(String)
      });
    });

    it('should handle request too large errors', () => {
      const error = new Error('Request too large') as any;
      error.type = 'entity.too.large';

      ErrorHandler.handle(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(413);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Request body too large',
        status: 413,
        timestamp: expect.any(String)
      });
    });

    it('should include development details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalJestWorker = process.env.JEST_WORKER_ID;
      
      process.env.NODE_ENV = 'development';
      delete process.env.JEST_WORKER_ID; // Simulate non-test environment
      
      const error = new Error('Test error') as any;
      error.stack = 'Error stack trace';

      ErrorHandler.handle(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            message: 'Test error',
            stack: 'Error stack trace'
          })
        })
      );
      
      process.env.NODE_ENV = originalEnv;
      if (originalJestWorker) {
        process.env.JEST_WORKER_ID = originalJestWorker;
      }
    });

    it('should not include development details in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new Error('Sensitive error details') as any;

      ErrorHandler.handle(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.not.objectContaining({
          details: expect.anything()
        })
      );
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should include timestamp in error response', () => {
      const error = new Error('Test error') as any;

      ErrorHandler.handle(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        })
      );
    });
  });

  describe('notFound', () => {
    it('should handle 404 errors for unknown routes', () => {
      mockRequest.url = '/api/unknown-endpoint';
      mockRequest.method = 'GET';

      ErrorHandler.notFound(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Route not found',
        message: 'Cannot GET /api/unknown-endpoint',
        status: 404,
        timestamp: expect.any(String)
      });
    });
  });

  describe('createError', () => {
    it('should create error with message and status code', () => {
      const error = ErrorHandler.createError('Custom error', 422);

      expect(error.message).toBe('Custom error');
      expect((error as any).status).toBe(422);
    });

    it('should create error with default 500 status code', () => {
      const error = ErrorHandler.createError('Default error');

      expect(error.message).toBe('Default error');
      expect((error as any).status).toBe(500);
    });

    it('should create error with custom code', () => {
      const error = ErrorHandler.createError('Custom error', 400, 'CUSTOM_CODE');

      expect(error.message).toBe('Custom error');
      expect((error as any).status).toBe(400);
      expect((error as any).code).toBe('CUSTOM_CODE');
    });
  });
});
