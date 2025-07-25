/**
 * Application Configuration
 */

import { 
    ServerConfig, 
    SecurityConfig, 
    OpenAIConfig, 
    ServicesConfig, 
    DatabaseConfig, 
    AppSettings, 
    EnvironmentConfig 
} from '../interfaces';

class AppConfig {
    public server: ServerConfig;
    public security: SecurityConfig;
    public services: ServicesConfig;
    public database: DatabaseConfig;
    public app: AppSettings;

    constructor() {
        // Server Configuration
        this.server = {
            port: parseInt(process.env.PORT || '3000'),
            environment: process.env.NODE_ENV || 'development',
            host: process.env.HOST || 'localhost'
        };

        // Security Configuration
        this.security = {
            sessionSecret: process.env.SESSION_SECRET || 'your-secret-key-change-me-in-production',
            rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
            rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
            corsOrigin: process.env.CORS_ORIGIN || '*'
        };
        
        // External Services Configuration
        this.services = {
            openai: {
                apiKey: process.env.OPENAI_API_KEY || '',
                model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
                maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
                temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3')
            }
        };

        // Database Configuration
        this.database = {
            mongodb: {
                uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/calorietracker',
                options: {
                    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
                    serverSelectionTimeoutMS: parseInt(process.env.DB_TIMEOUT || '5000'),
                    socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || '45000'),
                }
            }
        };

        // Application Configuration
        this.app = {
            maxSearchHistoryPerSession: parseInt(process.env.MAX_SEARCH_HISTORY || '50'),
            maxFoodInputLength: parseInt(process.env.MAX_FOOD_INPUT_LENGTH || '500'),
            sessionCookieMaxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE || '604800000'), // 7 days
            frontendPath: process.env.FRONTEND_PATH || '../../frontend/public'
        };
    }

    /**
     * Validate required configuration
     */
    public validateConfig(): void {
        // Only validate in production mode
        if (this.server.environment === 'production') {
            const requiredConfigs = [
                { 
                    key: 'OPENAI_API_KEY', 
                    value: this.services.openai.apiKey, 
                    message: 'OpenAI API key is required in production' 
                }
            ];

            const missingConfigs = requiredConfigs.filter(config => !config.value);
            
            if (missingConfigs.length > 0) {
                const messages = missingConfigs.map(config => config.message);
                throw new Error(`Missing required configuration: ${messages.join(', ')}`);
            }
        }
        
        // In development, just warn about missing configs
        if (this.server.environment === 'development' && !this.services.openai.apiKey) {
            console.log('💡 Tip: Add OPENAI_API_KEY to .env file to enable nutrition analysis features');
        }
    }

    /**
     * Get configuration for specific environment
     */
    public getEnvironmentConfig(): EnvironmentConfig {
        const configs: { [key: string]: EnvironmentConfig } = {
            development: {
                logging: true,
                cors: { 
                    origin: this.security.corsOrigin,
                    credentials: true
                },
                helmet: {
                    contentSecurityPolicy: false // Disable CSP in development
                }
            },
            production: {
                logging: false,
                cors: { 
                    origin: this.security.corsOrigin.split(',').map(origin => origin.trim()),
                    credentials: true
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
                cors: { 
                    origin: '*',
                    credentials: true
                },
                helmet: {
                    contentSecurityPolicy: false
                }
            }
        };

        return configs[this.server.environment] || configs.development;
    }
}

export default new AppConfig();
