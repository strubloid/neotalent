const mongoose = require('mongoose');
const appConfig = require('./appConfig');

/**
 * Database Connection Manager
 */
class DatabaseManager {
    constructor() {
        this.isConnected = false;
        this.connection = null;
    }

    /**
     * Connect to MongoDB
     */
    async connect() {
        try {
            if (this.isConnected) {
                console.log('📦 Database already connected');
                return this.connection;
            }

            const { uri, options } = appConfig.database.mongodb;

            // Set up connection events
            mongoose.connection.on('connected', () => {
                console.log('📦 MongoDB connected successfully');
                this.isConnected = true;
            });

            mongoose.connection.on('error', (error) => {
                console.error('❌ MongoDB connection error:', error);
                this.isConnected = false;
            });

            mongoose.connection.on('disconnected', () => {
                console.log('📦 MongoDB disconnected');
                this.isConnected = false;
            });

            // Handle application termination
            process.on('SIGINT', async () => {
                await this.disconnect();
                process.exit(0);
            });

            // Connect to database
            this.connection = await mongoose.connect(uri, options);
            
            return this.connection;

        } catch (error) {
            console.error('❌ Failed to connect to MongoDB:', error.message);
            throw error;
        }
    }

    /**
     * Disconnect from MongoDB
     */
    async disconnect() {
        try {
            if (this.connection) {
                await mongoose.disconnect();
                this.isConnected = false;
                this.connection = null;
                console.log('📦 MongoDB disconnected gracefully');
            }
        } catch (error) {
            console.error('❌ Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    /**
     * Check if database is connected
     */
    isDbConnected() {
        return this.isConnected && mongoose.connection.readyState === 1;
    }

    /**
     * Get database connection status
     */
    getConnectionStatus() {
        const readyStates = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        return {
            isConnected: this.isConnected,
            readyState: readyStates[mongoose.connection.readyState] || 'unknown',
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name
        };
    }
}

// Create and export singleton instance
const databaseManager = new DatabaseManager();

module.exports = databaseManager;
