import { SanitizeNumberOptions } from '../interfaces';

/**
 * Input sanitization utilities
 */

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: any): string {
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
 */
export function sanitizeForHTML(text: any): string {
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
 */
export function sanitizeNumber(value: any, options: SanitizeNumberOptions = {}): number | null {
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
 */
export function sanitizeEmail(email: any): string | null {
    if (typeof email !== 'string') {
        return null;
    }

    const sanitized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return emailRegex.test(sanitized) ? sanitized : null;
}

/**
 * Remove excessive whitespace and normalize line breaks
 */
export function normalizeWhitespace(text: any): string {
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
 */
export function sanitizeURL(url: any, allowedProtocols: string[] = ['http:', 'https:']): string | null {
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
 */
export function sanitizeFilename(filename: any): string {
    if (typeof filename !== 'string') {
        return 'untitled';
    }

    return filename
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove invalid file characters
        .replace(/^\.+/, '') // Remove leading dots
        .trim()
        .substring(0, 255) || 'untitled'; // Ensure valid filename
}

// Default export for backwards compatibility
export default {
    sanitizeInput,
    sanitizeForHTML,
    sanitizeNumber,
    sanitizeEmail,
    normalizeWhitespace,
    sanitizeURL,
    sanitizeFilename,
    sanitizeObject: function(obj: any) {
        if (!obj || typeof obj !== 'object') return {};
        const sanitized: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = typeof obj[key] === 'string' ? sanitizeInput(obj[key]) : obj[key];
            }
        }
        return sanitized;
    }
};

// Named export for compatibility
export const inputSanitizer = {
    sanitizeInput,
    sanitizeForHTML,
    sanitizeNumber,
    sanitizeEmail,
    normalizeWhitespace,
    sanitizeURL,
    sanitizeFilename,
    sanitizeObject: function(obj: any) {
        if (!obj || typeof obj !== 'object') return {};
        const sanitized: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = typeof obj[key] === 'string' ? sanitizeInput(obj[key]) : obj[key];
            }
        }
        return sanitized;
    }
};
