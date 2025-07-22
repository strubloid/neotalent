class CalorieTracker {
    constructor() {
        this.form = document.getElementById('calorieForm');
        this.foodInput = document.getElementById('foodInput');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.errorAlert = document.getElementById('errorAlert');
        this.resultsCard = document.getElementById('resultsCard');
        this.newAnalysisBtn = document.getElementById('newAnalysisBtn');
        this.charCount = document.getElementById('charCount');

        this.initializeEventListeners();
        this.updateCharCount();
    }

    initializeEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.analyzeFood();
        });

        // Character counter
        this.foodInput.addEventListener('input', () => {
            this.updateCharCount();
            this.clearErrors();
        });

        // New analysis button
        this.newAnalysisBtn.addEventListener('click', () => {
            this.resetForm();
        });

        // Enter key support for textarea
        this.foodInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.analyzeFood();
            }
        });
    }

    updateCharCount() {
        const count = this.foodInput.value.length;
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

    async analyzeFood() {
        const foodText = this.foodInput.value.trim();

        // Validation
        if (!foodText) {
            this.showError('Please enter some food or ingredients to analyze.');
            this.foodInput.focus();
            return;
        }

        if (foodText.length > 500) {
            this.showError('Please keep your input under 500 characters.');
            this.foodInput.focus();
            return;
        }

        try {
            this.setLoadingState(true);
            this.hideError();
            this.hideResults();

            const response = await fetch('/api/calories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ food: foodText })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Failed to analyze food');
            }

            if (result.success && result.data) {
                this.displayResults(result.data, foodText);
            } else {
                throw new Error('Invalid response format');
            }

        } catch (error) {
            console.error('Analysis error:', error);
            this.showError(this.getErrorMessage(error));
        } finally {
            this.setLoadingState(false);
        }
    }

    displayResults(data, originalQuery) {
        // Update total calories
        document.getElementById('totalCalories').textContent = data.totalCalories || 0;
        
        // Update serving size
        document.getElementById('servingSize').textContent = data.servingSize || 'Not specified';
        
        // Update confidence badge
        const confidenceBadge = document.getElementById('confidenceBadge');
        const confidence = data.confidence || 'medium';
        confidenceBadge.textContent = `${confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence`;
        confidenceBadge.className = `badge confidence-${confidence}`;

        // Update macros
        if (data.macros) {
            document.getElementById('protein').textContent = `${data.macros.protein || 0}g`;
            document.getElementById('carbs').textContent = `${data.macros.carbs || 0}g`;
            document.getElementById('fat').textContent = `${data.macros.fat || 0}g`;
        }

        // Update breakdown
        this.displayBreakdown(data.breakdown || []);

        // Show results
        this.showResults();
        
        // Scroll to results
        setTimeout(() => {
            this.resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    displayBreakdown(breakdown) {
        const breakdownList = document.getElementById('breakdownList');
        
        if (!breakdown || breakdown.length === 0) {
            breakdownList.innerHTML = '<p class="text-muted">No detailed breakdown available.</p>';
            return;
        }

        const breakdownHTML = breakdown.map(item => `
            <div class="breakdown-item p-3 mb-2 rounded">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${this.escapeHtml(item.item || 'Unknown item')}</h6>
                        <small class="text-muted">Individual component</small>
                    </div>
                    <div class="text-end">
                        <h5 class="mb-0 text-primary">${item.calories || 0}</h5>
                        <small class="text-muted">calories</small>
                    </div>
                </div>
            </div>
        `).join('');

        breakdownList.innerHTML = breakdownHTML;
    }

    setLoadingState(isLoading) {
        const btnText = this.analyzeBtn.querySelector('.btn-text');
        const btnLoading = this.analyzeBtn.querySelector('.btn-loading');

        if (isLoading) {
            btnText.classList.add('d-none');
            btnLoading.classList.remove('d-none');
            this.analyzeBtn.disabled = true;
            this.foodInput.disabled = true;
        } else {
            btnText.classList.remove('d-none');
            btnLoading.classList.add('d-none');
            this.analyzeBtn.disabled = false;
            this.foodInput.disabled = false;
        }
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        this.errorAlert.classList.remove('d-none');
        
        // Add invalid state to input
        this.foodInput.classList.add('is-invalid');
        document.getElementById('foodInputError').textContent = message;

        // Scroll to error
        this.errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    hideError() {
        this.errorAlert.classList.add('d-none');
        this.clearErrors();
    }

    clearErrors() {
        this.foodInput.classList.remove('is-invalid');
        document.getElementById('foodInputError').textContent = '';
    }

    showResults() {
        this.resultsCard.classList.remove('d-none');
    }

    hideResults() {
        this.resultsCard.classList.add('d-none');
    }

    resetForm() {
        this.form.reset();
        this.hideError();
        this.hideResults();
        this.updateCharCount();
        this.foodInput.focus();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    getErrorMessage(error) {
        const message = error.message || 'An unexpected error occurred';
        
        // User-friendly error messages
        if (message.includes('quota')) {
            return 'Service is currently busy. Please try again in a few minutes.';
        }
        
        if (message.includes('network') || message.includes('fetch')) {
            return 'Network error. Please check your connection and try again.';
        }
        
        if (message.includes('configuration')) {
            return 'Service is temporarily unavailable. Please try again later.';
        }
        
        if (message.includes('validation')) {
            return 'Please check your input and try again.';
        }
        
        return message;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new CalorieTracker();
    
    // Add some visual feedback
    console.log('🚀 NeoTalent Calorie Tracker initialized');
    
    // Service worker registration for offline support (optional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker not available, that's okay
        });
    }
});
