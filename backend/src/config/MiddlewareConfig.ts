import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import appConfig from '../config/appConfig';

/**
 * Middleware Configuration
 * Organizes middleware setup in one place
 */
export class MiddlewareConfig {
    /**
     * Setup all middleware for the app
     */
    static setupMiddleware(app: express.Application, environment: string): void {
        // Trust proxy for accurate IP addresses
        app.set('trust proxy', 1);
        
        // Security middleware
        this.setupSecurity(app);
        
        // CORS middleware
        this.setupCORS(app);
        
        // Logging middleware
        this.setupLogging(app, environment);
        
        // Body parsing middleware
        this.setupBodyParsing(app);
        
        // Session middleware
        this.setupSessions(app);
        
        // Static files middleware
        this.setupStaticFiles(app);
    }

    /**
     * Setup security middleware
     */
    private static setupSecurity(app: express.Application): void {
        const envConfig = appConfig.getEnvironmentConfig();
        app.use(helmet(envConfig.helmet));
    }

    /**
     * Setup CORS middleware
     */
    private static setupCORS(app: express.Application): void {
        const envConfig = appConfig.getEnvironmentConfig();
        app.use(cors({
            origin: envConfig.cors.origin,
            credentials: envConfig.cors.credentials,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
            exposedHeaders: ['Set-Cookie']
        }));
    }

    /**
     * Setup logging middleware
     */
    private static setupLogging(app: express.Application, environment: string): void {
        if (environment === 'development') {
            app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
                console.log(`📥 ${req.method} ${req.url} - Origin: ${req.get('Origin') || 'none'}`);
                
                // Log response completion
                const originalSend = res.send;
                res.send = function(data) {
                    console.log(`📤 ${req.method} ${req.url} - Status: ${res.statusCode}`);
                    return originalSend.call(this, data);
                };
                
                next();
            });
        }
    }

    /**
     * Setup body parsing middleware
     */
    private static setupBodyParsing(app: express.Application): void {
        app.use(express.json({ 
            limit: '10mb',
            verify: (req: express.Request, res: express.Response, buf: Buffer) => {
                (req as any).rawBody = buf;
            }
        }));
        app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    }

    /**
     * Setup session middleware
     */
    private static setupSessions(app: express.Application): void {
        const FileStore = require('session-file-store')(session);
        
        // Ensure sessions directory exists
        const sessionsPath = path.join(__dirname, '../../sessions');
        if (!fs.existsSync(sessionsPath)) {
            fs.mkdirSync(sessionsPath, { recursive: true });
            console.log('📁 Created sessions directory:', sessionsPath);
        }
        
        app.use(session({
            secret: process.env.SESSION_SECRET || 'neotalent-dev-secret-key-change-in-production',
            resave: false,
            saveUninitialized: true,
            name: 'neotalent.sid',
            store: new FileStore({
                path: sessionsPath,
                retries: 3,
                ttl: 24 * 60 * 60, // 24 hours in seconds
                reapInterval: 3600, // Cleanup expired sessions every hour
                logFn: console.log
            }),
            cookie: {
                secure: false, // Set to false for development (HTTP)
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                sameSite: 'lax'
            }
        }));
    }

    /**
     * Setup static files middleware
     */
    private static setupStaticFiles(app: express.Application): void {
        const frontendPath = path.resolve(__dirname, appConfig.app.frontendPath);
        app.use(express.static(frontendPath));
    }
}
