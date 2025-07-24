import path from 'path';
import dotenv from 'dotenv';

// IMPORTANT: Load environment variables FIRST, before any other imports
// This ensures all modules have access to environment variables during initialization
const backendRoot = path.resolve(__dirname, '..');  // Always resolve to backend folder
const envFile = path.join(backendRoot, '.env');

console.log(`🔧 Loading environment from: ${envFile}`);
dotenv.config({ path: envFile });

// Also try parent directory as fallback for root .env
dotenv.config({ path: path.join(backendRoot, '../.env') });

// Now import everything else AFTER environment is loaded
import express from 'express';

// Import TypeScript modules
import appConfig from './config/appConfig';
import databaseManager from './config/database';
import { MiddlewareConfig } from './config/MiddlewareConfig';
import ErrorHandler from './middleware/ErrorHandler';
import apiRoutes from './routes/apiRoutes';

/**
 * NeoTalent Calorie Tracker Backend Server
 */
class Server {
    private app: express.Application;
    private port: number;
    private environment: string;

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
    private initializeMiddleware(): void {
        MiddlewareConfig.setupMiddleware(this.app, this.environment);
    }

    /**
     * Initialize routes
     */
    private initializeRoutes(): void {
        // API routes
        this.app.use('/api', apiRoutes);

        // Serve frontend for SPA
        this.app.get('*', (req: express.Request, res: express.Response) => {
            const frontendPath = path.resolve(__dirname, appConfig.app.frontendPath);
            res.sendFile(path.join(frontendPath, 'index.html'));
        });
    }

    /**
     * Initialize error handling
     */
    private initializeErrorHandling(): void {
        // 404 handler
        this.app.use('*', ErrorHandler.notFound);

        // Global error handler
        this.app.use(ErrorHandler.handle);
    }

    /**
     * Start the server
     */
    public async start(): Promise<any> {
        try {
            // Validate configuration
            appConfig.validateConfig();

            // Connect to database
            await databaseManager.connect();

            // Start server
            const server = this.app.listen(this.port, () => {
                console.log(`🚀 NeoTalent Backend Server started`);
                console.log(`📍 Environment: ${this.environment}`);
                console.log(`🌐 Server running on port ${this.port}`);
                console.log(`🔗 API available at: http://localhost:${this.port}/api`);
                console.log(`📊 Health check: http://localhost:${this.port}/api/health`);
                console.log(`🔐 Auth endpoints: http://localhost:${this.port}/api/auth`);
                
                if (this.environment === 'development') {
                    console.log(`🎯 Test OpenAI: http://localhost:${this.port}/api/nutrition/test`);
                }
            });

            // Graceful shutdown handling
            this.setupGracefulShutdown(server);

            return server;

        } catch (error: any) {
            console.error('❌ Failed to start server:', error.message);
            process.exit(1);
        }
    }

    /**
     * Setup graceful shutdown
     */
    private setupGracefulShutdown(server: any): void {
        const gracefulShutdown = async (signal: string) => {
            console.log(`\n📧 Received ${signal}. Starting graceful shutdown...`);
            
            server.close(async () => {
                console.log('🔌 HTTP server closed');
                
                // Disconnect from database
                try {
                    await databaseManager.disconnect();
                } catch (error: any) {
                    console.error('❌ Error disconnecting from database:', error);
                }
                
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

export default Server;
