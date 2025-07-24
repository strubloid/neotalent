/**
 * Server Configuration Interface
 */
export interface ServerConfig {
    port: number;
    environment: string;
    host: string;
}

/**
 * Security Configuration Interface
 */
export interface SecurityConfig {
    sessionSecret: string;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    corsOrigin: string;
}

/**
 * OpenAI Configuration Interface
 */
export interface OpenAIConfig {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
}

/**
 * Services Configuration Interface
 */
export interface ServicesConfig {
    openai: OpenAIConfig;
}

/**
 * Database Configuration Interface
 */
export interface DatabaseConfig {
    mongodb: {
        uri: string;
        options: {
            maxPoolSize: number;
            serverSelectionTimeoutMS: number;
            socketTimeoutMS: number;
        };
    };
}

/**
 * Application Settings Interface
 */
export interface AppSettings {
    maxSearchHistoryPerSession: number;
    maxFoodInputLength: number;
    sessionCookieMaxAge: number;
    frontendPath: string;
}

/**
 * Environment Configuration Interface
 */
export interface EnvironmentConfig {
    logging: boolean;
    cors: {
        origin: string | string[];
        credentials: boolean;
    };
    helmet: {
        contentSecurityPolicy?: boolean | object;
    };
    session?: {
        secure: boolean;
        httpOnly: boolean;
        maxAge: number;
        sameSite: 'strict' | 'lax' | 'none';
    };
}

/**
 * Connection Status Interface
 */
export interface ConnectionStatus {
    isConnected: boolean;
    readyState: string;
    host?: string;
    port?: number;
    name?: string;
}
