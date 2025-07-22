/**
 * Application Configuration
 */
class AppConfig {
    constructor() {
        // Server Configuration
        this.server = {
            port: parseInt(process.env.PORT) || 3000,
            environment: process.env.NODE_ENV || 'development',
            host: process.env.HOST || 'localhost'
        };

        // Security Configuration
        this.security = {
            sessionSecret: process.env.SESSION_SECRET || 'your-secret-key-change-me-in-production',
            rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
            rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
            corsOrigin: process.env.CORS_ORIGIN || '*'
        };

        // External Services Configuration
        this.services = {
            openai: {
                apiKey: process.env.OPENAI_API_KEY,
                model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
                maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
                temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.3
            }
        };

        // Application Configuration
        this.app = {
            maxSearchHistoryPerSession: parseInt(process.env.MAX_SEARCH_HISTORY) || 50,
            maxFoodInputLength: parseInt(process.env.MAX_FOOD_INPUT_LENGTH) || 500,
            sessionCookieMaxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000, // 7 days
            frontendPath: process.env.FRONTEND_PATH || '../frontend/public'
        };
    }

    /**
     * Validate required configuration
     */
    validateConfig() {
        const requiredConfigs = [
            { key: 'OPENAI_API_KEY', value: this.services.openai.apiKey, message: 'OpenAI API key is required' }
        ];

        const missingConfigs = requiredConfigs.filter(config => !config.value);
        
        if (missingConfigs.length > 0) {
            const messages = missingConfigs.map(config => config.message);
            throw new Error(`Missing required configuration: ${messages.join(', ')}`);
        }
    }

    /**
     * Get configuration for specific environment
     */
    getEnvironmentConfig() {
        return {
            development: {
                logging: true,
                cors: { origin: '*' },
                helmet: {
                    contentSecurityPolicy: false // Disable CSP in development
                }
            },
            production: {
                logging: false,
                cors: { 
                    origin: this.security.corsOrigin.split(',').map(origin => origin.trim())
                },
                helmet: {
                    contentSecurityPolicy: {
                        directives: {
                            defaultSrc: ["'self'"],
                            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                            scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
                            fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
                            imgSrc: ["'self'", "data:", "https:"],
                        },
                    }
                }
            },
            test: {
                logging: false,
                cors: { origin: '*' },
                helmet: {
                    contentSecurityPolicy: false
                }
            }
        }[this.server.environment] || this.getEnvironmentConfig().development;
    }
}

module.exports = new AppConfig();
