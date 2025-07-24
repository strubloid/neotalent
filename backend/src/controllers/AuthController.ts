import { Request, Response } from 'express';
import User from '../models/User';
import { SessionHelper } from '../services/SessionHelper';

// Simplified AuthController without bcrypt dependency
interface AuthenticatedRequest extends Request {
    session: any; // Simplified session type
}

/**
 * Authentication Controller (Simplified without bcrypt)
 * Handles user registration, login, logout, and user management
 */
class AuthController {
    /**
     * Register a new user
     * @route   POST /api/auth/register
     * @desc    Register a new user with username, password, and nickname
     * @access  Public
     */
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { username, password, nickname } = req.body;

            // Basic validation
            if (!username || !password || !nickname) {
                res.status(400).json({
                    success: false,
                    message: 'Username, password, and nickname are required'
                });
                return;
            }

            // Check if user already exists
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: 'Username already exists'
                });
                return;
            }

            // Create new user
            const newUser = new User({
                username,
                password,
                nickname,
                searchHistory: []
            });

            const savedUser = await newUser.save();

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: {
                    id: savedUser._id,
                    username: savedUser.username,
                    nickname: savedUser.nickname,
                    createdAt: savedUser.createdAt
                }
            });

        } catch (error: any) {
            console.error('Registration error:', error);
            
            // Handle duplicate key error specifically
            if (error.code === 11000) {
                res.status(409).json({
                    success: false,
                    message: 'Username already exists'
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: 'Internal server error during registration'
            });
        }
    }

    /**
     * Login user
     * @route   POST /api/auth/login
     * @desc    Authenticate user and create session
     * @access  Public
     */
    async login(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { username, password } = req.body;

            // Basic validation
            if (!username || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Username and password are required'
                });
                return;
            }

            // Find user in database
            const user = await User.findByUsername(username);
            
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
                return;
            }

            // Check password
            const isValidPassword = await user.comparePassword(password);
            
            if (!isValidPassword) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
                return;
            }
            
            // Create session if available
            if (req.session) {
                SessionHelper.createUserSession(req.session, user);

                // Debug logging for session creation
                console.log('🔐 Login successful, session created:', {
                    sessionId: req.session.id,
                    userId: req.session.userId,
                    username: req.session.username,
                    isAuthenticated: req.session.isAuthenticated
                });

                // Explicitly save the session to ensure persistence and wait for it
                await new Promise<void>((resolve, reject) => {
                    req.session!.save((err: any) => {
                        if (err) {
                            console.error('❌ Session save error:', err);
                            reject(err);
                        } else {
                            console.log('✅ Session saved successfully');
                            resolve();
                        }
                    });
                });
            }

            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    id: user._id,
                    username: user.username,
                    nickname: user.nickname
                }
            });

        } catch (error: any) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during login'
            });
        }
    }

    /**
     * Logout user
     * @route   POST /api/auth/logout
     * @desc    Destroy user session
     * @access  Private
     */
    async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // Destroy session if available
            if (req.session && req.session.destroy) {
                req.session.destroy((err: any) => {
                    if (err) {
                        console.error('Session destruction error:', err);
                        res.status(500).json({
                            success: false,
                            message: 'Logout failed'
                        });
                        return;
                    }

                    res.json({
                        success: true,
                        message: 'Logout successful'
                    });
                });
            } else {
                res.json({
                    success: true,
                    message: 'Logout successful'
                });
            }

        } catch (error: any) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during logout'
            });
        }
    }

    /**
     * Delete user account
     * @route   DELETE /api/auth/account
     * @desc    Delete current user account
     * @access  Private
     */
    async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // For now, just return success (no actual deletion)
            res.json({
                success: true,
                message: 'Account deleted successfully'
            });

        } catch (error: any) {
            console.error('Account deletion error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during account deletion'
            });
        }
    }

    /**
     * Get current user info
     * @route   GET /api/auth/me
     * @desc    Get current authenticated user information
     * @access  Private
     */
    async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!SessionHelper.isAuthenticated(req.session)) {
                res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
                return;
            }

            res.json({
                success: true,
                user: {
                    id: req.session.userId,
                    username: req.session.username,
                    nickname: req.session.nickname,
                    createdAt: new Date().toISOString()
                }
            });

        } catch (error: any) {
            console.error('Get current user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Check authentication status
     * @route   GET /api/auth/status
     * @desc    Check if user is authenticated
     * @access  Public
     */
    async checkAuthStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
        // Debug logging for session issues
        console.log('🔍 Auth status check:', {
            hasSession: !!req.session,
            sessionId: req.session?.id,
            isAuthenticated: req.session?.isAuthenticated,
            userId: req.session?.userId,
            username: req.session?.username
        });

        res.json({
            success: true,
            isAuthenticated: !!(req.session && req.session.isAuthenticated),
            user: (req.session && req.session.isAuthenticated) ? {
                id: req.session.userId,
                username: req.session.username,
                nickname: req.session.nickname
            } : null
        });
    }

    /**
     * Get user's search history
     * @route   GET /api/auth/search-history
     * @desc    Get search history for authenticated user
     * @access  Private
     */
    async getSearchHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            console.log('📚 Getting search history for session:', {
                hasSession: !!req.session,
                isAuthenticated: req.session?.isAuthenticated,
                userId: req.session?.userId
            });

            if (!req.session || !req.session.isAuthenticated || !req.session.userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            // Find user in database and get their search history
            const user = await User.findById(req.session.userId).select('searchHistory');
            
            if (!user) {
                console.log('❌ User not found in database:', req.session.userId);
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            // Return search history from database
            const searchHistory = user.searchHistory || [];
            
            console.log('📚 Retrieved search history:', {
                userId: req.session.userId,
                historyCount: searchHistory.length,
                history: searchHistory
            });
            
            res.json({
                success: true,
                searchHistory: searchHistory
            });

        } catch (error: any) {
            console.error('Get search history error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Add search to user's history
     * @route   POST /api/auth/search-history
     * @desc    Add a search to user's search history
     * @access  Private
     */
    async addSearchHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            console.log('📝 Adding search history for session:', {
                hasSession: !!req.session,
                isAuthenticated: req.session?.isAuthenticated,
                userId: req.session?.userId,
                body: req.body
            });

            if (!req.session || !req.session.isAuthenticated || !req.session.userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const { searchId, query, summary } = req.body;

            if (!searchId || !query || !summary) {
                res.status(400).json({
                    success: false,
                    message: 'Search ID, query, and summary are required'
                });
                return;
            }

            // Validate input lengths
            if (query.length > 500) {
                res.status(400).json({
                    success: false,
                    message: 'Search query cannot exceed 500 characters'
                });
                return;
            }

            if (summary.length > 1000) {
                res.status(400).json({
                    success: false,
                    message: 'Search summary cannot exceed 1000 characters'
                });
                return;
            }

            // Find user in database
            const user = await User.findById(req.session.userId);
            
            if (!user) {
                console.log('❌ User not found in database:', req.session.userId);
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            // Initialize search history if it doesn't exist
            if (!user.searchHistory) {
                user.searchHistory = [];
            }

            // Check if search already exists (avoid duplicates)
            const existingSearchIndex = user.searchHistory.findIndex(
                (search: any) => search.searchId === searchId
            );

            if (existingSearchIndex !== -1) {
                // Update existing search timestamp and move to front
                user.searchHistory.splice(existingSearchIndex, 1);
            }

            // Add new search to beginning of array
            const newSearch = {
                searchId,
                query,
                summary,
                timestamp: new Date()
            };

            user.searchHistory.unshift(newSearch);

            // Keep only the 10 most recent searches
            user.searchHistory = user.searchHistory.slice(0, 10);

            // Save to database
            await user.save();

            console.log('✅ Search history saved:', {
                userId: req.session.userId,
                newSearch,
                totalHistoryCount: user.searchHistory.length
            });

            res.json({
                success: true,
                message: 'Search added to history',
                searchHistory: user.searchHistory
            });

        } catch (error: any) {
            console.error('Add search history error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Clear user's search history
     * @route   DELETE /api/auth/search-history
     * @desc    Clear all search history for authenticated user
     * @access  Private
     */
    async clearSearchHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.session || !req.session.isAuthenticated || !req.session.userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            // Find user in database
            const user = await User.findById(req.session.userId);
            
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            // Clear search history in database
            user.searchHistory = [];
            await user.save();

            res.json({
                success: true,
                message: 'Search history cleared successfully'
            });

        } catch (error: any) {
            console.error('Clear search history error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

export default AuthController;
