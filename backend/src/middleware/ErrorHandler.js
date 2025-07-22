/**
 * Global Error Handler Middleware
 */
class ErrorHandler {
    /**
     * Handle application errors
     * @param {Error} err - Error object
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @param {Function} next - Next middleware
     */
    static handle(err, req, res, next) {
        console.error('Application Error:', {
            message: err.message,
            stack: err.stack,
            code: err.code,
            status: err.status,
            url: req.url,
            method: req.method,
            timestamp: new Date().toISOString()
        });

        // Default error response
        let errorResponse = {
            success: false,
            error: 'Internal server error',
            status: 500,
            timestamp: new Date().toISOString()
        };

        // Handle Joi validation errors
        if (err.isJoi) {
            errorResponse = {
                success: false,
                error: 'Validation failed',
                details: err.details[0].message,
                status: 400,
                timestamp: new Date().toISOString()
            };
        }
        // Handle OpenAI API errors
        else if (err.code && err.code.startsWith('OPENAI_')) {
            errorResponse = {
                success: false,
                error: err.message,
                code: err.code,
                status: err.status || 500,
                timestamp: new Date().toISOString()
            };
        }
        // Handle custom application errors
        else if (err.status && err.message) {
            errorResponse = {
                success: false,
                error: err.message,
                code: err.code,
                status: err.status,
                timestamp: new Date().toISOString()
            };
        }
        // Handle specific error types
        else if (err.type === 'entity.parse.failed') {
            errorResponse = {
                success: false,
                error: 'Invalid JSON in request body',
                status: 400,
                timestamp: new Date().toISOString()
            };
        }
        else if (err.type === 'entity.too.large') {
            errorResponse = {
                success: false,
                error: 'Request body too large',
                status: 413,
                timestamp: new Date().toISOString()
            };
        }

        // Add development details if in development mode
        if (process.env.NODE_ENV === 'development') {
            errorResponse.details = {
                message: err.message,
                stack: err.stack,
                code: err.code
            };
        }

        res.status(errorResponse.status).json(errorResponse);
    }

    /**
     * Handle 404 Not Found errors
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     */
    static notFound(req, res) {
        res.status(404).json({
            success: false,
            error: 'Route not found',
            message: `Cannot ${req.method} ${req.url}`,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Create a custom application error
     * @param {string} message - Error message
     * @param {number} status - HTTP status code
     * @param {string} code - Error code
     * @returns {Error}
     */
    static createError(message, status = 500, code = null) {
        const error = new Error(message);
        error.status = status;
        if (code) error.code = code;
        return error;
    }
}

module.exports = ErrorHandler;
