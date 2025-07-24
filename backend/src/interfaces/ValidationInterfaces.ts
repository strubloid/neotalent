/**
 * Validation interfaces for input validation utilities
 */

export interface ValidationResult {
    error?: any; // Joi.ValidationError
    value: any;
}

export interface NutritionRequestData {
    food: string;
}

export interface PaginationParams {
    page?: number;
    per_page?: number;
    limit?: number;
}

export interface SanitizeNumberOptions {
    min?: number;
    max?: number;
    defaultValue?: number | null;
}
