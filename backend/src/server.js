const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// Import configuration and middleware
const appConfig = require('./config/appConfig');
const ErrorHandler = require('./middleware/ErrorHandler');
const SecurityMiddleware = require('./middleware/SecurityMiddleware');
const apiRoutes = require('./routes/apiRoutes');

/**
 * NeoTalent Calorie Tracker Backend Server
 */
class Server {
    constructor() {
        this.app = express();
        this.port = appConfig.server.port;
        this.environment = appConfig.server.environment;
        
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    /**
     * Initialize middleware
     */
    initializeMiddleware() {
        // Trust proxy for accurate IP addresses
        this.app.set('trust proxy', 1);

        // Security middleware
        this.app.use(SecurityMiddleware.securityHeaders());
        
        // Helmet for security headers
        const envConfig = appConfig.getEnvironmentConfig();
        this.app.use(helmet(envConfig.helmet));

        // CORS configuration
        this.app.use(cors(envConfig.cors));

        // Rate limiting
        this.app.use(SecurityMiddleware.createRateLimit());

        // Request logging (development only)
        if (this.environment === 'development') {
            this.app.use(SecurityMiddleware.requestLogger());
        }

        // Body parsing
        this.app.use(express.json({ 
            limit: '10mb',
            verify: (req, res, buf) => {
                req.rawBody = buf;
            }
        }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Session configuration
        this.app.use(session({
            secret: appConfig.security.sessionSecret,
            resave: false,
            saveUninitialized: false,
            name: 'neotalent.sid',
            cookie: {
                secure: this.environment === 'production',
                httpOnly: true,
                maxAge: appConfig.app.sessionCookieMaxAge,
                sameSite: this.environment === 'production' ? 'strict' : 'lax'
            }
        }));

        // Session validation
        this.app.use('/api', SecurityMiddleware.validateSession());

        // Serve static files (frontend)
        const frontendPath = path.resolve(__dirname, appConfig.app.frontendPath);
        this.app.use(express.static(frontendPath));
    }

    /**
     * Initialize routes
     */
    initializeRoutes() {
        // API routes
        this.app.use('/api', apiRoutes);

        // Serve frontend for SPA
        this.app.get('*', (req, res) => {
            const frontendPath = path.resolve(__dirname, appConfig.app.frontendPath);
            res.sendFile(path.join(frontendPath, 'index.html'));
        });
    }

    /**
     * Initialize error handling
     */
    initializeErrorHandling() {
        // 404 handler
        this.app.use('*', ErrorHandler.notFound);

        // Global error handler
        this.app.use(ErrorHandler.handle);
    }

    /**
     * Start the server
     */
    async start() {
        try {
            // Validate configuration
            appConfig.validateConfig();

            // Start server
            const server = this.app.listen(this.port, () => {
                console.log(`🚀 NeoTalent Backend Server started`);
                console.log(`📍 Environment: ${this.environment}`);
                console.log(`🌐 Server running on port ${this.port}`);
                console.log(`🔗 API available at: http://localhost:${this.port}/api`);
                console.log(`📊 Health check: http://localhost:${this.port}/api/health`);
                
                if (this.environment === 'development') {
                    console.log(`🎯 Test OpenAI: http://localhost:${this.port}/api/nutrition/test`);
                }
            });

            // Graceful shutdown handling
            this.setupGracefulShutdown(server);

            return server;

        } catch (error) {
            console.error('❌ Failed to start server:', error.message);
            process.exit(1);
        }
    }

    /**
     * Setup graceful shutdown
     */
    setupGracefulShutdown(server) {
        const gracefulShutdown = (signal) => {
            console.log(`\n📧 Received ${signal}. Starting graceful shutdown...`);
            
            server.close(() => {
                console.log('✅ Server closed successfully');
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.log('⚠️  Forcing shutdown');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason) => {
            console.error('❌ Unhandled Rejection:', reason);
            process.exit(1);
        });
    }
}

// Start server if called directly
if (require.main === module) {
    const server = new Server();
    server.start();
}

module.exports = Server;
