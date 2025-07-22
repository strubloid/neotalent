import { DOMUtils } from '../utils/domUtils.js';

/**
 * Error handling component
 */
export class ErrorHandler {
    constructor(errorAlert, foodInput) {
        this.errorAlert = errorAlert;
        this.foodInput = foodInput;
        this.errorMessage = document.getElementById('errorMessage');
        this.foodInputError = document.getElementById('foodInputError');
    }

    /**
     * Show error message
     * @param {string} message 
     */
    showError(message) {
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
        }
        
        DOMUtils.toggleClass(this.errorAlert, 'd-none', false);
        
        // Add invalid state to input
        DOMUtils.toggleClass(this.foodInput, 'is-invalid', true);
        
        if (this.foodInputError) {
            this.foodInputError.textContent = message;
        }

        // Scroll to error
        DOMUtils.scrollToElement(this.errorAlert, 'center');
    }

    /**
     * Hide error message
     */
    hideError() {
        DOMUtils.toggleClass(this.errorAlert, 'd-none', true);
        this.clearErrors();
    }

    /**
     * Clear error states
     */
    clearErrors() {
        DOMUtils.toggleClass(this.foodInput, 'is-invalid', false);
        
        if (this.foodInputError) {
            this.foodInputError.textContent = '';
        }
    }

    /**
     * Validate food input
     * @param {string} foodText 
     * @returns {Object} validation result
     */
    validateFoodInput(foodText) {
        if (!foodText.trim()) {
            return {
                isValid: false,
                message: 'Please enter some food or ingredients to analyze.'
            };
        }

        if (foodText.length > 500) {
            return {
                isValid: false,
                message: 'Please keep your input under 500 characters.'
            };
        }

        return { isValid: true };
    }
}
