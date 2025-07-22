/**
 * DOM utility functions
 */
export class DOMUtils {
    /**
     * Escape HTML to prevent XSS
     * @param {string} text 
     * @returns {string}
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Truncate text to specified length
     * @param {string} text 
     * @param {number} maxLength 
     * @returns {string}
     */
    static truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Format timestamp to relative time
     * @param {string|Date} timestamp 
     * @returns {string}
     */
    static formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }

    /**
     * Smooth scroll to element
     * @param {HTMLElement} element 
     * @param {string} block 
     */
    static scrollToElement(element, block = 'start') {
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block });
        }
    }

    /**
     * Add/remove class with optional condition
     * @param {HTMLElement} element 
     * @param {string} className 
     * @param {boolean} condition 
     */
    static toggleClass(element, className, condition) {
        if (!element) return;
        
        if (condition) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    }
}
