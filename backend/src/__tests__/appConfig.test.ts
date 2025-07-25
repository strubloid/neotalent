import appConfig from '../config/appConfig';

describe('App Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env to original state
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Environment Variables', () => {
    it('should have default values when environment variables are not set', () => {
      // Clear environment variables
      delete process.env.PORT;
      delete process.env.NODE_ENV;
      delete process.env.SESSION_SECRET;
      delete process.env.OPENAI_API_KEY;

      // Re-import to get fresh config
      jest.resetModules();
      const freshConfig = require('../config/appConfig').default;

      expect(freshConfig.server.port).toBe(3000);
      expect(freshConfig.server.environment).toBe('development');
      expect(freshConfig.security.sessionSecret).toBeDefined();
      expect(typeof freshConfig.security.sessionSecret).toBe('string');
    });

    it('should use environment variables when available', () => {
      process.env.PORT = '4000';
      process.env.NODE_ENV = 'production';
      process.env.SESSION_SECRET = 'test-secret';
      process.env.OPENAI_API_KEY = 'test-openai-key';

      jest.resetModules();
      const freshConfig = require('../config/appConfig').default;

      expect(freshConfig.server.port).toBe(4000);
      expect(freshConfig.server.environment).toBe('production');
      expect(freshConfig.security.sessionSecret).toBe('test-secret');
      expect(freshConfig.services.openai.apiKey).toBe('test-openai-key');
    });
  });

  describe('Server Configuration', () => {
    it('should have valid server configuration', () => {
      expect(appConfig.server).toBeDefined();
      expect(typeof appConfig.server.port).toBe('number');
      expect(appConfig.server.port).toBeGreaterThan(0);
      expect(appConfig.server.port).toBeLessThan(65536);
    });

    it('should have host configuration', () => {
      expect(appConfig.server.host).toBeDefined();
      expect(typeof appConfig.server.host).toBe('string');
      expect(appConfig.server.host.length).toBeGreaterThan(0);
    });

    it('should have environment configuration', () => {
      expect(appConfig.server.environment).toBeDefined();
      expect(typeof appConfig.server.environment).toBe('string');
    });
  });

  describe('Database Configuration', () => {
    it('should have database configuration', () => {
      expect(appConfig.database).toBeDefined();
      expect(appConfig.database.mongodb.uri).toBeDefined();
      expect(typeof appConfig.database.mongodb.uri).toBe('string');
    });

    it('should have database options', () => {
      expect(appConfig.database.mongodb.options).toBeDefined();
      expect(typeof appConfig.database.mongodb.options).toBe('object');
    });

    it('should have valid database connection settings', () => {
      expect(typeof appConfig.database.mongodb.options.maxPoolSize).toBe('number');
      expect(typeof appConfig.database.mongodb.options.serverSelectionTimeoutMS).toBe('number');
      expect(typeof appConfig.database.mongodb.options.socketTimeoutMS).toBe('number');
    });
  });

  describe('Security Configuration', () => {
    it('should have security configuration', () => {
      expect(appConfig.security).toBeDefined();
      expect(appConfig.security.sessionSecret).toBeDefined();
      expect(typeof appConfig.security.sessionSecret).toBe('string');
      expect(appConfig.security.sessionSecret.length).toBeGreaterThan(0);
    });

    it('should have rate limiting settings', () => {
      expect(typeof appConfig.security.rateLimitWindowMs).toBe('number');
      expect(typeof appConfig.security.rateLimitMaxRequests).toBe('number');
      expect(appConfig.security.rateLimitWindowMs).toBeGreaterThan(0);
      expect(appConfig.security.rateLimitMaxRequests).toBeGreaterThan(0);
    });

    it('should have CORS origin setting', () => {
      expect(appConfig.security.corsOrigin).toBeDefined();
      expect(typeof appConfig.security.corsOrigin).toBe('string');
    });
  });

  describe('OpenAI Configuration', () => {
    it('should have OpenAI configuration', () => {
      expect(appConfig.services.openai).toBeDefined();
    });

    it('should handle missing API key gracefully', () => {
      delete process.env.OPENAI_API_KEY;
      jest.resetModules();
      const freshConfig = require('../config/appConfig').default;

      expect(freshConfig.services.openai.apiKey).toBeDefined();
      // Should either be undefined or have a default value
    });

    it('should have OpenAI model configuration', () => {
      expect(appConfig.services.openai.model).toBeDefined();
      expect(typeof appConfig.services.openai.model).toBe('string');
      expect(appConfig.services.openai.model.length).toBeGreaterThan(0);
    });

    it('should have OpenAI parameters', () => {
      expect(typeof appConfig.services.openai.maxTokens).toBe('number');
      expect(typeof appConfig.services.openai.temperature).toBe('number');
      expect(appConfig.services.openai.maxTokens).toBeGreaterThan(0);
      expect(appConfig.services.openai.temperature).toBeGreaterThanOrEqual(0);
      expect(appConfig.services.openai.temperature).toBeLessThanOrEqual(2);
    });
  });

  describe('App Configuration', () => {
    it('should have app-level configuration', () => {
      expect(appConfig.app).toBeDefined();
    });

    it('should have frontend path configuration', () => {
      expect(appConfig.app.frontendPath).toBeDefined();
      expect(typeof appConfig.app.frontendPath).toBe('string');
    });

    it('should have app limits configuration', () => {
      expect(typeof appConfig.app.maxSearchHistoryPerSession).toBe('number');
      expect(typeof appConfig.app.maxFoodInputLength).toBe('number');
      expect(typeof appConfig.app.sessionCookieMaxAge).toBe('number');
      
      expect(appConfig.app.maxSearchHistoryPerSession).toBeGreaterThan(0);
      expect(appConfig.app.maxFoodInputLength).toBeGreaterThan(0);
      expect(appConfig.app.sessionCookieMaxAge).toBeGreaterThan(0);
    });
  });

  describe('Configuration Validation', () => {
    it('should have all required configuration sections', () => {
      expect(appConfig.server).toBeDefined();
      expect(appConfig.database).toBeDefined();
      expect(appConfig.security).toBeDefined();
      expect(appConfig.services).toBeDefined();
      expect(appConfig.app).toBeDefined();
      
      expect(typeof appConfig.server).toBe('object');
      expect(typeof appConfig.database).toBe('object');
      expect(typeof appConfig.security).toBe('object');
      expect(typeof appConfig.services).toBe('object');
      expect(typeof appConfig.app).toBe('object');
    });

    it('should export configuration as default export', () => {
      expect(appConfig).toBeDefined();
      expect(typeof appConfig).toBe('object');
    });

    it('should not have null or undefined required values', () => {
      expect(appConfig.server.port).not.toBeNull();
      expect(appConfig.server.port).not.toBeUndefined();
      expect(appConfig.security.sessionSecret).not.toBeNull();
      expect(appConfig.security.sessionSecret).not.toBeUndefined();
      expect(appConfig.server.environment).not.toBeNull();
      expect(appConfig.server.environment).not.toBeUndefined();
    });

    it('should have validateConfig method', () => {
      expect(typeof appConfig.validateConfig).toBe('function');
    });

    it('should validate config without throwing in development', () => {
      expect(() => appConfig.validateConfig()).not.toThrow();
    });
  });

  describe('Environment-Specific Configuration', () => {
    it('should have getEnvironmentConfig method', () => {
      expect(typeof appConfig.getEnvironmentConfig).toBe('function');
    });

    it('should return environment-specific configuration', () => {
      const envConfig = appConfig.getEnvironmentConfig();
      
      expect(envConfig).toBeDefined();
      expect(typeof envConfig).toBe('object');
      expect(envConfig.cors).toBeDefined();
      expect(envConfig.helmet).toBeDefined();
      expect(typeof envConfig.logging).toBe('boolean');
    });

    it('should adjust configuration for production environment', () => {
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      const prodConfig = require('../config/appConfig').default;

      expect(prodConfig.server.environment).toBe('production');
      
      const envConfig = prodConfig.getEnvironmentConfig();
      expect(envConfig.logging).toBe(false);
    });

    it('should adjust configuration for development environment', () => {
      process.env.NODE_ENV = 'development';
      jest.resetModules();
      const devConfig = require('../config/appConfig').default;

      expect(devConfig.server.environment).toBe('development');
      
      const envConfig = devConfig.getEnvironmentConfig();
      expect(envConfig.logging).toBe(true);
    });

    it('should adjust configuration for test environment', () => {
      process.env.NODE_ENV = 'test';
      jest.resetModules();
      const testConfig = require('../config/appConfig').default;

      expect(testConfig.server.environment).toBe('test');
      
      const envConfig = testConfig.getEnvironmentConfig();
      expect(envConfig.logging).toBe(false);
    });
  });
});
