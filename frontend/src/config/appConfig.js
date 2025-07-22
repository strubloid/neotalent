/**
 * Frontend Application Configuration
 */
class FrontendConfig {
    constructor() {
        // API Configuration
        this.api = {
            baseUrl: this.detectBackendUrl(),
            endpoints: {
                nutrition: {
                    analyze: '/api/nutrition/analyze',
                    test: '/api/nutrition/test',
                    breadcrumbs: '/api/nutrition/breadcrumbs',
                    history: '/api/nutrition/history',
                    search: '/api/nutrition/search',
                    stats: '/api/nutrition/stats'
                },
                health: '/api/health',
                info: '/api/info'
            },
            timeout: 30000, // 30 seconds
            retryAttempts: 3
        };

        // UI Configuration
        this.ui = {
            animations: {
                duration: 300,
                easing: 'ease-in-out'
            },
            input: {
                maxLength: 500,
                warningThreshold: 350,
                errorThreshold: 450
            },
            pagination: {
                defaultPageSize: 20,
                maxPageSize: 50
            },
            breadcrumbs: {
                maxItems: 5,
                maxTextLength: 30
            }
        };

        // Feature Flags
        this.features = {
            offlineSupport: true,
            autoSave: true,
            analytics: false,
            notifications: true
        };

        // Development Configuration
        this.development = {
            enableLogging: this.isDevelopment(),
            showDebugInfo: this.isDevelopment(),
            mockAPI: false
        };
    }

    /**
     * Detect backend URL based on environment
     * @returns {string}
     */
    detectBackendUrl() {
        // Check if we're in development with a separate backend server
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Try to detect if backend is running on a different port
            const currentPort = window.location.port;
            const backendPort = currentPort === '8080' ? '3000' : currentPort;
            return `${window.location.protocol}//${window.location.hostname}:${backendPort}`;
        }
        
        // In production, use the same origin
        return window.location.origin;
    }

    /**
     * Check if running in development mode
     * @returns {boolean}
     */
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('dev');
    }

    /**
     * Get full API URL for endpoint
     * @param {string} endpoint 
     * @returns {string}
     */
    getApiUrl(endpoint) {
        return `${this.api.baseUrl}${endpoint}`;
    }

    /**
     * Get environment-specific configuration
     * @returns {Object}
     */
    getEnvironmentConfig() {
        return {
            development: {
                logging: true,
                debugMode: true,
                strictMode: false
            },
            production: {
                logging: false,
                debugMode: false,
                strictMode: true
            }
        }[this.isDevelopment() ? 'development' : 'production'];
    }

    /**
     * Update configuration at runtime
     * @param {Object} updates 
     */
    updateConfig(updates) {
        Object.assign(this, updates);
    }
}

export default new FrontendConfig();
