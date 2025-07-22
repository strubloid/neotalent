/**
 * Input sanitization utilities
 */

/**
 * Sanitize user input to prevent injection attacks
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return '';
    }

    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .substring(0, 500); // Enforce max length
}

/**
 * Sanitize text for safe HTML display
 * @param {string} text - Text to sanitize
 * @returns {string} - HTML-safe text
 */
function sanitizeForHTML(text) {
    if (typeof text !== 'string') {
        return '';
    }

    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize numeric input
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {number|null} - Sanitized number or null if invalid
 */
function sanitizeNumber(value, options = {}) {
    const {
        min = Number.MIN_SAFE_INTEGER,
        max = Number.MAX_SAFE_INTEGER,
        defaultValue = null
    } = options;

    const num = Number(value);
    
    if (isNaN(num) || !isFinite(num)) {
        return defaultValue;
    }
    
    if (num < min || num > max) {
        return defaultValue;
    }
    
    return num;
}

/**
 * Sanitize and validate email format
 * @param {string} email - Email to validate
 * @returns {string|null} - Sanitized email or null if invalid
 */
function sanitizeEmail(email) {
    if (typeof email !== 'string') {
        return null;
    }

    const sanitized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return emailRegex.test(sanitized) ? sanitized : null;
}

/**
 * Remove excessive whitespace and normalize line breaks
 * @param {string} text - Text to normalize
 * @returns {string} - Normalized text
 */
function normalizeWhitespace(text) {
    if (typeof text !== 'string') {
        return '';
    }

    return text
        .replace(/\r\n/g, '\n') // Normalize line breaks
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n') // Limit consecutive line breaks
        .replace(/[ \t]+/g, ' ') // Normalize spaces and tabs
        .trim();
}

/**
 * Validate and sanitize URL
 * @param {string} url - URL to validate
 * @param {Array} allowedProtocols - Allowed protocols (default: ['http:', 'https:'])
 * @returns {string|null} - Sanitized URL or null if invalid
 */
function sanitizeURL(url, allowedProtocols = ['http:', 'https:']) {
    if (typeof url !== 'string') {
        return null;
    }

    try {
        const urlObj = new URL(url.trim());
        
        if (!allowedProtocols.includes(urlObj.protocol)) {
            return null;
        }
        
        return urlObj.toString();
    } catch (error) {
        return null;
    }
}

/**
 * Sanitize filename for safe file operations
 * @param {string} filename - Filename to sanitize
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(filename) {
    if (typeof filename !== 'string') {
        return 'untitled';
    }

    return filename
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove invalid file characters
        .replace(/^\.+/, '') // Remove leading dots
        .trim()
        .substring(0, 255) || 'untitled'; // Ensure valid filename
}

module.exports = {
    sanitizeInput,
    sanitizeForHTML,
    sanitizeNumber,
    sanitizeEmail,
    normalizeWhitespace,
    sanitizeURL,
    sanitizeFilename
};
