import appConfig from '../config/appConfig.js';

/**
 * HTTP Client Service for API communication
 */
class HttpClient {
    constructor() {
        this.baseUrl = appConfig.api.baseUrl;
        this.timeout = appConfig.api.timeout;
        this.retryAttempts = appConfig.api.retryAttempts;
    }

    /**
     * Make HTTP request with retry logic
     * @param {string} url 
     * @param {Object} options 
     * @returns {Promise<Object>}
     */
    async request(url, options = {}) {
        const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include',
            ...options
        };

        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const response = await this._makeRequest(fullUrl, config);
                return await this._handleResponse(response);
            } catch (error) {
                lastError = error;
                
                // Don't retry on client errors (4xx) or for the last attempt
                if (error.status >= 400 && error.status < 500 || attempt === this.retryAttempts) {
                    break;
                }
                
                // Wait before retrying (exponential backoff)
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                await this._delay(delay);
                
                if (appConfig.development.enableLogging) {
                    console.warn(`Request attempt ${attempt} failed, retrying in ${delay}ms...`);
                }
            }
        }
        
        throw lastError;
    }

    /**
     * GET request
     * @param {string} url 
     * @param {Object} options 
     * @returns {Promise<Object>}
     */
    async get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    }

    /**
     * POST request
     * @param {string} url 
     * @param {Object} data 
     * @param {Object} options 
     * @returns {Promise<Object>}
     */
    async post(url, data = null, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : null
        });
    }

    /**
     * PUT request
     * @param {string} url 
     * @param {Object} data 
     * @param {Object} options 
     * @returns {Promise<Object>}
     */
    async put(url, data = null, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : null
        });
    }

    /**
     * DELETE request
     * @param {string} url 
     * @param {Object} options 
     * @returns {Promise<Object>}
     */
    async delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    }

    /**
     * Make actual fetch request with timeout
     * @private
     * @param {string} url 
     * @param {Object} config 
     * @returns {Promise<Response>}
     */
    async _makeRequest(url, config) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw this._createError('Request timeout', 'TIMEOUT', 408);
            }
            
            throw this._createError(
                'Network error',
                'NETWORK_ERROR',
                0,
                error.message
            );
        }
    }

    /**
     * Handle HTTP response
     * @private
     * @param {Response} response 
     * @returns {Promise<Object>}
     */
    async _handleResponse(response) {
        let data;
        
        try {
            const text = await response.text();
            data = text ? JSON.parse(text) : {};
        } catch (error) {
            throw this._createError(
                'Invalid JSON response',
                'PARSE_ERROR',
                response.status
            );
        }

        if (!response.ok) {
            throw this._createError(
                data.error || data.message || 'Request failed',
                data.code || 'HTTP_ERROR',
                response.status,
                data.details
            );
        }

        return data;
    }

    /**
     * Create standardized error object
     * @private
     * @param {string} message 
     * @param {string} code 
     * @param {number} status 
     * @param {any} details 
     * @returns {Error}
     */
    _createError(message, code, status, details = null) {
        const error = new Error(message);
        error.code = code;
        error.status = status;
        if (details) error.details = details;
        return error;
    }

    /**
     * Delay execution
     * @private
     * @param {number} ms 
     * @returns {Promise<void>}
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check if service is available
     * @returns {Promise<boolean>}
     */
    async isServiceAvailable() {
        try {
            await this.get('/api/health');
            return true;
        } catch (error) {
            return false;
        }
    }
}

export default HttpClient;
