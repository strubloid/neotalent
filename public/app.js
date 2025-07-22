class CalorieTracker {
    constructor() {
        this.form = document.getElementById('calorieForm');
        this.foodInput = document.getElementById('foodInput');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.errorAlert = document.getElementById('errorAlert');
        this.resultsCard = document.getElementById('resultsCard');
        this.newAnalysisBtn = document.getElementById('newAnalysisBtn');
        this.charCount = document.getElementById('charCount');
        this.breadcrumbsCard = document.getElementById('breadcrumbsCard');
        this.breadcrumbsList = document.getElementById('breadcrumbsList');

        // Use Elixir backend if available, fallback to Node.js
        this.apiBaseUrl = this.detectBackend();
        
        this.initializeEventListeners();
        this.updateCharCount();
        this.loadBreadcrumbs();
    }

    detectBackend() {
        // For now, always use the current origin (Node.js backend)
        // In production, you could implement actual backend detection
        return window.location.origin;
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

        // Breadcrumb click handling using event delegation
        this.breadcrumbsList.addEventListener('click', (e) => {
            const breadcrumbItem = e.target.closest('.breadcrumb-item');
            if (breadcrumbItem && breadcrumbItem.dataset.searchId) {
                e.preventDefault();
                this.loadPreviousSearch(breadcrumbItem.dataset.searchId, breadcrumbItem);
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

            const response = await fetch(`${this.apiBaseUrl}/api/calories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for session
                body: JSON.stringify({ food: foodText })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Failed to analyze food');
            }

            if (result.success && result.data) {
                this.displayResults(result.data, foodText, result.search_id);
                // Refresh breadcrumbs after successful analysis
                this.loadBreadcrumbs();
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

    async loadBreadcrumbs() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/breadcrumbs`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data.length > 0) {
                    this.displayBreadcrumbs(result.data);
                } else {
                    this.hideBreadcrumbs();
                }
            }
        } catch (error) {
            console.warn('Failed to load breadcrumbs:', error);
            this.hideBreadcrumbs();
        }
    }

    async loadPreviousSearch(searchId, breadcrumbElement = null) {
        try {
            // Show loading state on the specific breadcrumb if provided
            if (breadcrumbElement) {
                this.setBreadcrumbLoadingState(breadcrumbElement, true);
            } else {
                this.setLoadingState(true);
            }
            this.hideError();

            const response = await fetch(`${this.apiBaseUrl}/api/searches/${searchId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    // Fill the input with the previous query
                    this.foodInput.value = result.data.query;
                    this.updateCharCount();
                    
                    // Display the previous results
                    this.displayResults(result.data, result.data.query, searchId);
                    
                    // Scroll to results
                    setTimeout(() => {
                        this.resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                } else {
                    this.showError('Failed to load previous search');
                }
            } else {
                this.showError('Search not found');
            }
        } catch (error) {
            console.error('Failed to load previous search:', error);
            this.showError('Failed to load previous search');
        } finally {
            // Hide loading state
            if (breadcrumbElement) {
                this.setBreadcrumbLoadingState(breadcrumbElement, false);
            } else {
                this.setLoadingState(false);
            }
        }
    }

    displayBreadcrumbs(breadcrumbs) {
        const breadcrumbsHTML = breadcrumbs.map(item => `
            <div class="breadcrumb-item" title="${this.escapeHtml(item.query)}" data-search-id="${item.id}" style="cursor: pointer;">
                <div class="d-flex align-items-center">
                    <span class="me-2">${this.truncateText(item.query, 30)}</span>
                    <span class="calories">${item.totalCalories}cal</span>
                </div>
                <small class="text-muted d-block">${this.formatTimeAgo(item.timestamp)}</small>
                <div class="breadcrumb-loading d-none">
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading...
                </div>
            </div>
        `).join('');

        this.breadcrumbsList.innerHTML = breadcrumbsHTML;
        this.showBreadcrumbs();
    }

    showBreadcrumbs() {
        this.breadcrumbsCard.classList.remove('d-none');
    }

    hideBreadcrumbs() {
        this.breadcrumbsCard.classList.add('d-none');
    }

    displayResults(data, originalQuery, searchId) {
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

        // Store search ID for potential future use
        if (searchId) {
            this.resultsCard.setAttribute('data-search-id', searchId);
        }

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

    setBreadcrumbLoadingState(breadcrumbElement, isLoading) {
        if (!breadcrumbElement) return;

        const content = breadcrumbElement.querySelector('.d-flex');
        const timeElement = breadcrumbElement.querySelector('.text-muted');
        const loadingElement = breadcrumbElement.querySelector('.breadcrumb-loading');

        if (isLoading) {
            // Hide content and show loading
            if (content) content.style.display = 'none';
            if (timeElement) timeElement.style.display = 'none';
            if (loadingElement) loadingElement.classList.remove('d-none');
            
            // Disable the breadcrumb
            breadcrumbElement.style.pointerEvents = 'none';
            breadcrumbElement.style.opacity = '0.7';
        } else {
            // Show content and hide loading
            if (content) content.style.display = '';
            if (timeElement) timeElement.style.display = '';
            if (loadingElement) loadingElement.classList.add('d-none');
            
            // Re-enable the breadcrumb
            breadcrumbElement.style.pointerEvents = '';
            breadcrumbElement.style.opacity = '';
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
        
        // Refresh breadcrumbs
        this.loadBreadcrumbs();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
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
    window.calorieTracker = new CalorieTracker();
    
    // Add some visual feedback
    console.log('🚀 NeoTalent Calorie Tracker initialized');
    
    // Service worker registration for offline support (optional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker not available, that's okay
        });
    }
});
