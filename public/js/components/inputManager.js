/**
 * Input manager component
 */
export class InputManager {
    constructor(foodInput, charCount, onInputChange) {
        this.foodInput = foodInput;
        this.charCount = charCount;
        this.onInputChange = onInputChange;
        
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Character counter and input validation
        this.foodInput.addEventListener('input', () => {
            this.updateCharCount();
            if (this.onInputChange) {
                this.onInputChange();
            }
        });
    }

    /**
     * Update character count display
     */
    updateCharCount() {
        const count = this.foodInput.value.length;
        
        if (this.charCount) {
            this.charCount.textContent = count;
            
            // Update color based on character count
            if (count > 450) {
                this.charCount.className = 'text-danger fw-bold';
            } else if (count > 350) {
                this.charCount.className = 'text-warning fw-bold';
            } else {
                this.charCount.className = 'text-muted';
            }
        }
    }

    /**
     * Get current input value
     * @returns {string}
     */
    getValue() {
        return this.foodInput.value.trim();
    }

    /**
     * Set input value
     * @param {string} value 
     */
    setValue(value) {
        this.foodInput.value = value;
        this.updateCharCount();
    }

    /**
     * Focus on input
     */
    focus() {
        this.foodInput.focus();
    }

    /**
     * Clear input
     */
    clear() {
        this.foodInput.value = '';
        this.updateCharCount();
    }

    /**
     * Add keyboard shortcuts
     * @param {Function} onSubmit 
     */
    addKeyboardShortcuts(onSubmit) {
        this.foodInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                onSubmit();
            }
        });
    }
}
