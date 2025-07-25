import { Request, Response, NextFunction } from 'express';
import { ErrorResponse, CustomError } from '../interfaces';

/**
 * Global Error Handler Middleware
 */
class ErrorHandler {
    /**
     * Handle application errors
     */
    public static handle(err: CustomError, req: Request, res: Response, next: NextFunction): void {
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
        let errorResponse: ErrorResponse = {
            success: false,
            error: 'Internal server error',
            status: 500,
            timestamp: new Date().toISOString()
        };

        // Handle Joi validation errors
        if (err.isJoi && err.details && err.details.length > 0) {
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

        // Add development details if in development mode (but not during tests)
        if (process.env.NODE_ENV === 'development' && !process.env.JEST_WORKER_ID) {
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
     */
    public static notFound(req: Request, res: Response): void {
        const errorResponse: ErrorResponse = {
            success: false,
            error: 'Route not found',
            message: `Cannot ${req.method} ${req.url}`,
            status: 404,
            timestamp: new Date().toISOString()
        };

        res.status(404).json(errorResponse);
    }

    /**
     * Create a custom application error
     */
    public static createError(message: string, status: number = 500, code?: string): CustomError {
        const error = new Error(message) as CustomError;
        error.status = status;
        if (code) error.code = code;
        return error;
    }
}

export default ErrorHandler;
