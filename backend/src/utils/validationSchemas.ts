import Joi from 'joi';
import appConfig from '../config/appConfig';

/**
 * Validation Result Interface
 */
interface ValidationResult {
    error?: Joi.ValidationError;
    value: any;
}

/**
 * Nutrition Request Data Interface
 */
interface NutritionRequestData {
    food: string;
}

/**
 * Pagination Parameters Interface
 */
interface PaginationParams {
    page?: number;
    per_page?: number;
    limit?: number;
}

/**
 * Auth validation schemas
 */
const authSchemas = {
    register: Joi.object({
        username: Joi.string()
            .alphanum()
            .min(3)
            .max(50)
            .required()
            .messages({
                'string.empty': 'Username is required',
                'string.min': 'Username must be at least 3 characters long',
                'string.max': 'Username cannot exceed 50 characters',
                'string.alphanum': 'Username can only contain letters and numbers'
            }),
        password: Joi.string()
            .min(6)
            .max(100)
            .required()
            .messages({
                'string.empty': 'Password is required',
                'string.min': 'Password must be at least 6 characters long',
                'string.max': 'Password cannot exceed 100 characters'
            }),
        nickname: Joi.string()
            .min(1)
            .max(100)
            .required()
            .messages({
                'string.empty': 'Nickname is required',
                'string.max': 'Nickname cannot exceed 100 characters'
            })
    }),
    login: Joi.object({
        username: Joi.string()
            .required()
            .messages({
                'string.empty': 'Username is required'
            }),
        password: Joi.string()
            .required()
            .messages({
                'string.empty': 'Password is required'
            })
    })
};

/**
 * Validation schema for nutrition analysis request
 */
const nutritionRequestSchema = Joi.object({
    food: Joi.string()
        .min(1)
        .max(appConfig.app.maxFoodInputLength || 500)
        .required()
        .messages({
            'string.empty': 'Food input is required',
            'string.max': `Food input must be less than ${appConfig.app.maxFoodInputLength || 500} characters`,
            'any.required': 'Food input is required'
        })
});

/**
 * Validation schema for pagination parameters
 */
const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    per_page: Joi.number().integer().min(1).max(50).default(20),
    limit: Joi.number().integer().min(1).max(10).default(5)
});

/**
 * Validate nutrition analysis request
 */
function validateNutritionRequest(data: NutritionRequestData): ValidationResult {
    return nutritionRequestSchema.validate(data);
}

/**
 * Validate pagination parameters
 */
function validatePaginationParams(data: PaginationParams): ValidationResult {
    return paginationSchema.validate(data);
}

/**
 * Validate search ID parameter
 */
function validateSearchId(searchId: string): ValidationResult {
    const schema = Joi.string().pattern(/^search_\d+_[a-z0-9]+$/).required();
    return schema.validate(searchId);
}

/**
 * Validate session ID parameter
 */
function validateSessionId(sessionId: string): ValidationResult {
    const schema = Joi.string().pattern(/^session_\d+_[a-z0-9]+$/).required();
    return schema.validate(sessionId);
}

export {
    validateNutritionRequest,
    validatePaginationParams,
    validateSearchId,
    validateSessionId,
    nutritionRequestSchema,
    paginationSchema,
    authSchemas
};

export default {
    validateNutritionRequest,
    validatePaginationParams,
    validateSearchId,
    validateSessionId,
    nutritionRequestSchema,
    paginationSchema,
    authSchemas
};
