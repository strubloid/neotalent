import HttpClient from './HttpClient.js';
import appConfig from '../config/appConfig.js';

/**
 * Nutrition API Service
 */
class NutritionApiService {
    constructor() {
        this.httpClient = new HttpClient();
        this.endpoints = appConfig.api.endpoints.nutrition;
    }

    /**
     * Test API connection
     * @returns {Promise<Object>}
     */
    async testConnection() {
        try {
            const response = await this.httpClient.get(this.endpoints.test);
            return {
                success: true,
                configured: response.configured,
                message: response.message || 'Connection successful'
            };
        } catch (error) {
            return {
                success: false,
                configured: false,
                message: error.message,
                code: error.code
            };
        }
    }

    /**
     * Analyze food nutrition
     * @param {string} foodDescription 
     * @returns {Promise<Object>}
     */
    async analyzeNutrition(foodDescription) {
        if (!foodDescription?.trim()) {
            throw this._createValidationError('Food description is required');
        }

        if (foodDescription.length > appConfig.ui.input.maxLength) {
            throw this._createValidationError(
                `Food description must be less than ${appConfig.ui.input.maxLength} characters`
            );
        }

        try {
            const response = await this.httpClient.post(this.endpoints.analyze, {
                food: foodDescription.trim()
            });

            if (!response.success) {
                throw new Error(response.error || 'Analysis failed');
            }

            return {
                success: true,
                data: response.data,
                searchId: response.searchId,
                query: response.query,
                timestamp: response.timestamp
            };
        } catch (error) {
            throw this._handleApiError(error, 'Failed to analyze nutrition');
        }
    }

    /**
     * Get recent searches for breadcrumbs
     * @param {number} limit 
     * @returns {Promise<Array>}
     */
    async getBreadcrumbs(limit = appConfig.ui.breadcrumbs.maxItems) {
        try {
            const response = await this.httpClient.get(
                `${this.endpoints.breadcrumbs}?limit=${limit}`
            );

            return response.success ? response.data : [];
        } catch (error) {
            if (appConfig.development.enableLogging) {
                console.warn('Failed to load breadcrumbs:', error);
            }
            return [];
        }
    }

    /**
     * Get search history with pagination
     * @param {Object} options 
     * @returns {Promise<Object>}
     */
    async getSearchHistory(options = {}) {
        const params = new URLSearchParams({
            page: options.page || 1,
            per_page: options.perPage || appConfig.ui.pagination.defaultPageSize
        });

        try {
            const response = await this.httpClient.get(
                `${this.endpoints.history}?${params}`
            );

            return response.success ? response.data : this._emptyHistoryResponse();
        } catch (error) {
            if (appConfig.development.enableLogging) {
                console.warn('Failed to load search history:', error);
            }
            return this._emptyHistoryResponse();
        }
    }

    /**
     * Get specific search by ID
     * @param {string} searchId 
     * @returns {Promise<Object>}
     */
    async getSearchById(searchId) {
        if (!searchId) {
            throw this._createValidationError('Search ID is required');
        }

        try {
            const response = await this.httpClient.get(`${this.endpoints.search}/${searchId}`);

            if (!response.success) {
                throw new Error(response.error || 'Search not found');
            }

            return response.data;
        } catch (error) {
            throw this._handleApiError(error, 'Failed to load search');
        }
    }

    /**
     * Clear search history
     * @returns {Promise<boolean>}
     */
    async clearHistory() {
        try {
            const response = await this.httpClient.delete(this.endpoints.history);
            return response.success;
        } catch (error) {
            if (appConfig.development.enableLogging) {
                console.error('Failed to clear history:', error);
            }
            return false;
        }
    }

    /**
     * Get application statistics
     * @returns {Promise<Object>}
     */
    async getStats() {
        try {
            const response = await this.httpClient.get(this.endpoints.stats);
            return response.success ? response.data : null;
        } catch (error) {
            if (appConfig.development.enableLogging) {
                console.warn('Failed to load stats:', error);
            }
            return null;
        }
    }

    /**
     * Create validation error
     * @private
     * @param {string} message 
     * @returns {Error}
     */
    _createValidationError(message) {
        const error = new Error(message);
        error.code = 'VALIDATION_ERROR';
        error.status = 400;
        return error;
    }

    /**
     * Handle API errors with user-friendly messages
     * @private
     * @param {Error} error 
     * @param {string} defaultMessage 
     * @returns {Error}
     */
    _handleApiError(error, defaultMessage) {
        const message = error.message || defaultMessage;
        
        // Map technical errors to user-friendly messages
        const userFriendlyMessages = {
            'TIMEOUT': 'Request timed out. Please check your connection and try again.',
            'NETWORK_ERROR': 'Network error. Please check your connection and try again.',
            'OPENAI_CONFIG_ERROR': 'Service is not properly configured. Please contact support.',
            'OPENAI_QUOTA_EXCEEDED': 'Service is currently busy. Please try again in a few minutes.',
            'OPENAI_NETWORK_ERROR': 'Cannot connect to AI service. Please try again later.',
            'PARSE_ERROR': 'Received invalid response from server.'
        };

        const userMessage = userFriendlyMessages[error.code] || message;
        
        const newError = new Error(userMessage);
        newError.code = error.code;
        newError.status = error.status;
        newError.originalError = error;
        
        return newError;
    }

    /**
     * Return empty history response
     * @private
     * @returns {Object}
     */
    _emptyHistoryResponse() {
        return {
            searches: [],
            pagination: {
                page: 1,
                perPage: appConfig.ui.pagination.defaultPageSize,
                totalSearches: 0,
                totalPages: 0
            },
            stats: {
                totalSearches: 0,
                totalCaloriesAnalyzed: 0,
                averageCalories: 0,
                firstSearch: null,
                lastSearch: null
            }
        };
    }
}

export default NutritionApiService;
