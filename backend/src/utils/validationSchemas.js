const Joi = require('joi');
const appConfig = require('../config/appConfig');

/**
 * Validation schema for nutrition analysis request
 */
const nutritionRequestSchema = Joi.object({
    food: Joi.string()
        .min(1)
        .max(appConfig?.app?.maxFoodInputLength || 500)
        .required()
        .messages({
            'string.empty': 'Food input is required',
            'string.max': `Food input must be less than ${appConfig?.app?.maxFoodInputLength || 500} characters`,
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
 * @param {Object} data - Request body data
 * @returns {Object} - Joi validation result
 */
function validateNutritionRequest(data) {
    return nutritionRequestSchema.validate(data);
}

/**
 * Validate pagination parameters
 * @param {Object} data - Query parameters
 * @returns {Object} - Joi validation result
 */
function validatePaginationParams(data) {
    return paginationSchema.validate(data);
}

/**
 * Validate search ID parameter
 * @param {string} searchId - Search ID to validate
 * @returns {Object} - Validation result
 */
function validateSearchId(searchId) {
    const schema = Joi.string().pattern(/^search_\d+_[a-z0-9]+$/).required();
    return schema.validate(searchId);
}

/**
 * Validate session ID parameter
 * @param {string} sessionId - Session ID to validate
 * @returns {Object} - Validation result
 */
function validateSessionId(sessionId) {
    const schema = Joi.string().pattern(/^session_\d+_[a-z0-9]+$/).required();
    return schema.validate(sessionId);
}

module.exports = {
    validateNutritionRequest,
    validatePaginationParams,
    validateSearchId,
    validateSessionId,
    nutritionRequestSchema,
    paginationSchema
};
