const appConfig = require('../config/appConfig');

/**
 * Search History Service for managing user search history
 */
class SearchHistoryService {
    constructor() {
        // In-memory storage for search history
        // In production, this would be replaced with a proper database
        this.searchHistory = new Map(); // sessionId -> array of searches
        this.maxHistoryPerSession = appConfig.app.maxSearchHistoryPerSession;
    }

    /**
     * Generate a unique session ID
     * @param {Object} req - Express request object
     * @returns {string}
     */
    getOrCreateSessionId(req) {
        if (!req.session.sessionId) {
            req.session.sessionId = this._generateSessionId();
        }
        return req.session.sessionId;
    }

    /**
     * Save search result to history
     * @param {string} sessionId 
     * @param {Object} searchData 
     * @returns {Object} - Saved search record
     */
    saveSearch(sessionId, searchData) {
        if (!this.searchHistory.has(sessionId)) {
            this.searchHistory.set(sessionId, []);
        }
        
        const searches = this.searchHistory.get(sessionId);
        const searchRecord = {
            id: this._generateSearchId(),
            ...searchData,
            timestamp: new Date().toISOString()
        };
        
        // Add to beginning of array (most recent first)
        searches.unshift(searchRecord);
        
        // Keep only the specified number of searches per session
        if (searches.length > this.maxHistoryPerSession) {
            searches.splice(this.maxHistoryPerSession);
        }
        
        return searchRecord;
    }

    /**
     * Get search history for a session
     * @param {string} sessionId 
     * @param {Object} options - Pagination options
     * @returns {Object}
     */
    getSearchHistory(sessionId, options = {}) {
        if (!sessionId || !this.searchHistory.has(sessionId)) {
            return this._emptyHistoryResponse(options);
        }

        const allSearches = this.searchHistory.get(sessionId);
        const page = Math.max(1, parseInt(options.page) || 1);
        const perPage = Math.min(parseInt(options.perPage) || 20, 50);
        
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedSearches = allSearches.slice(startIndex, endIndex);

        return {
            searches: paginatedSearches.map(this._mapSearchForHistory),
            pagination: {
                page,
                perPage,
                totalSearches: allSearches.length,
                totalPages: Math.ceil(allSearches.length / perPage)
            },
            stats: this._calculateStats(allSearches)
        };
    }

    /**
     * Get recent searches for breadcrumb navigation
     * @param {string} sessionId 
     * @param {number} limit 
     * @returns {Array}
     */
    getRecentSearches(sessionId, limit = 5) {
        if (!sessionId || !this.searchHistory.has(sessionId)) {
            return [];
        }

        const searches = this.searchHistory.get(sessionId);
        return searches.slice(0, limit).map(search => ({
            id: search.id,
            query: this._truncateText(search.query, 50),
            totalCalories: search.totalCalories,
            timestamp: search.timestamp
        }));
    }

    /**
     * Get specific search by ID
     * @param {string} sessionId 
     * @param {string} searchId 
     * @returns {Object|null}
     */
    getSearchById(sessionId, searchId) {
        if (!sessionId || !this.searchHistory.has(sessionId)) {
            return null;
        }

        const searches = this.searchHistory.get(sessionId);
        const search = searches.find(s => s.id === searchId);
        
        return search ? this._mapSearchForDetail(search) : null;
    }

    /**
     * Clear search history for a session
     * @param {string} sessionId 
     */
    clearHistory(sessionId) {
        if (sessionId && this.searchHistory.has(sessionId)) {
            this.searchHistory.delete(sessionId);
        }
    }

    /**
     * Get total number of sessions
     * @returns {number}
     */
    getTotalSessions() {
        return this.searchHistory.size;
    }

    /**
     * Get total number of searches across all sessions
     * @returns {number}
     */
    getTotalSearches() {
        let total = 0;
        for (const searches of this.searchHistory.values()) {
            total += searches.length;
        }
        return total;
    }

    /**
     * Generate unique session ID
     * @private
     * @returns {string}
     */
    _generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate unique search ID
     * @private
     * @returns {string}
     */
    _generateSearchId() {
        return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Map search for history listing
     * @private
     * @param {Object} search 
     * @returns {Object}
     */
    _mapSearchForHistory(search) {
        return {
            id: search.id,
            query: search.query,
            totalCalories: search.totalCalories,
            confidence: search.confidence,
            timestamp: search.timestamp
        };
    }

    /**
     * Map search for detailed view
     * @private
     * @param {Object} search 
     * @returns {Object}
     */
    _mapSearchForDetail(search) {
        return {
            id: search.id,
            query: search.query,
            totalCalories: search.totalCalories,
            servingSize: search.servingSize,
            breakdown: search.breakdown,
            macros: search.macros,
            confidence: search.confidence,
            timestamp: search.timestamp
        };
    }

    /**
     * Calculate statistics for search history
     * @private
     * @param {Array} searches 
     * @returns {Object}
     */
    _calculateStats(searches) {
        if (searches.length === 0) {
            return {
                totalSearches: 0,
                totalCaloriesAnalyzed: 0,
                averageCalories: 0,
                firstSearch: null,
                lastSearch: null
            };
        }

        const totalCalories = searches.reduce((sum, search) => sum + search.totalCalories, 0);
        
        return {
            totalSearches: searches.length,
            totalCaloriesAnalyzed: totalCalories,
            averageCalories: Math.round(totalCalories / searches.length),
            firstSearch: searches[searches.length - 1].timestamp,
            lastSearch: searches[0].timestamp
        };
    }

    /**
     * Truncate text to specified length
     * @private
     * @param {string} text 
     * @param {number} maxLength 
     * @returns {string}
     */
    _truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Return empty history response
     * @private
     * @param {Object} options 
     * @returns {Object}
     */
    _emptyHistoryResponse(options) {
        const page = Math.max(1, parseInt(options.page) || 1);
        const perPage = Math.min(parseInt(options.perPage) || 20, 50);
        
        return {
            searches: [],
            pagination: {
                page,
                perPage,
                totalSearches: 0,
                totalPages: 0
            },
            stats: {
                totalSearches: 0,
                totalCaloriesAnalyzed: 0,
                averageCalories: 0,
                firstSearch: null,
                lastSearch: null
            }
        };
    }
}

module.exports = SearchHistoryService;
