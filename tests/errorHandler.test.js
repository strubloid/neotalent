const { errorHandler } = require('../middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should handle generic errors', () => {
    const error = new Error('Generic error');
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal server error',
      timestamp: expect.any(String)
    });
  });

  it('should handle Joi validation errors', () => {
    const joiError = {
      isJoi: true,
      details: [{ message: 'Validation failed' }]
    };
    
    errorHandler(joiError, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation failed',
      details: 'Validation failed',
      timestamp: expect.any(String)
    });
  });

  it('should handle OpenAI invalid request errors', () => {
    const openaiError = {
      type: 'invalid_request_error',
      message: 'Invalid request'
    };
    
    errorHandler(openaiError, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid request to AI service',
      timestamp: expect.any(String)
    });
  });

  it('should handle rate limit errors', () => {
    const rateLimitError = {
      type: 'rate_limit_exceeded',
      message: 'Rate limit exceeded'
    };
    
    errorHandler(rateLimitError, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Rate limit exceeded',
      timestamp: expect.any(String)
    });
  });

  it('should handle custom errors with status', () => {
    const customError = {
      message: 'Custom error message',
      status: 422
    };
    
    errorHandler(customError, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Custom error message',
      timestamp: expect.any(String)
    });
  });

  it('should include timestamp in response', () => {
    const error = new Error('Test error');
    
    errorHandler(error, req, res, next);
    
    const call = res.json.mock.calls[0][0];
    expect(call.timestamp).toBeDefined();
    expect(new Date(call.timestamp)).toBeInstanceOf(Date);
  });
});
