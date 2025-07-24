/**
 * Error handling interfaces for middleware
 */

export interface ErrorResponse {
    success: false;
    error: string;
    details?: string | {
        message: string;
        stack?: string;
        code?: string;
    };
    code?: string;
    status: number;
    timestamp: string;
    message?: string;
}

export interface CustomError extends Error {
    status?: number;
    code?: string;
    isJoi?: boolean;
    details?: Array<{ message: string }>;
    type?: string;
}
