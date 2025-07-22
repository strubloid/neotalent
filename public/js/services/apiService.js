/**
 * API service for handling HTTP requests
 */
export class ApiService {
    constructor(baseUrl = window.location.origin) {
        this.baseUrl = baseUrl;
    }

    /**
     * Make a generic API request
     * @param {string} endpoint 
     * @param {Object} options 
     * @returns {Promise<Object>}
     */
    async request(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            ...options
        };

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, config);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Request failed');
            }

            return result;
        } catch (error) {
            throw this.formatError(error);
        }
    }

    /**
     * Analyze food calories
     * @param {string} foodText 
     * @returns {Promise<Object>}
     */
    async analyzeCalories(foodText) {
        return this.request('/api/calories', {
            method: 'POST',
            body: JSON.stringify({ food: foodText })
        });
    }

    /**
     * Get breadcrumbs/search history
     * @returns {Promise<Object>}
     */
    async getBreadcrumbs() {
        return this.request('/api/breadcrumbs');
    }

    /**
     * Get previous search by ID
     * @param {string} searchId 
     * @returns {Promise<Object>}
     */
    async getPreviousSearch(searchId) {
        return this.request(`/api/searches/${searchId}`);
    }

    /**
     * Format error messages for user display
     * @param {Error} error 
     * @returns {Error}
     */
    formatError(error) {
        const message = error.message || 'An unexpected error occurred';
        
        // User-friendly error messages
        if (message.includes('quota')) {
            error.message = 'Service is currently busy. Please try again in a few minutes.';
        } else if (message.includes('network') || message.includes('fetch')) {
            error.message = 'Network error. Please check your connection and try again.';
        } else if (message.includes('configuration')) {
            error.message = 'Service is temporarily unavailable. Please try again later.';
        } else if (message.includes('validation')) {
            error.message = 'Please check your input and try again.';
        }
        
        return error;
    }
}
