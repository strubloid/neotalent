const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    status: 500,
    message: 'Internal server error'
  };

  // Validation errors
  if (err.isJoi) {
    error.status = 400;
    error.message = 'Validation failed';
    error.details = err.details[0].message;
  }

  // OpenAI API errors
  if (err.type === 'invalid_request_error') {
    error.status = 400;
    error.message = 'Invalid request to AI service';
  }

  // Rate limit errors
  if (err.type === 'rate_limit_exceeded') {
    error.status = 429;
    error.message = 'Rate limit exceeded';
  }

  // Custom errors
  if (err.message && err.status) {
    error.status = err.status;
    error.message = err.message;
  }

  res.status(error.status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    timestamp: new Date().toISOString()
  });
};

module.exports = { errorHandler };
