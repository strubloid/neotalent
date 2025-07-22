import { DOMUtils } from '../utils/domUtils.js';

/**
 * Results display component
 */
export class ResultsComponent {
    constructor(resultsCard) {
        this.resultsCard = resultsCard;
        this.totalCaloriesEl = document.getElementById('totalCalories');
        this.servingSizeEl = document.getElementById('servingSize');
        this.confidenceBadgeEl = document.getElementById('confidenceBadge');
        this.proteinEl = document.getElementById('protein');
        this.carbsEl = document.getElementById('carbs');
        this.fatEl = document.getElementById('fat');
        this.breakdownListEl = document.getElementById('breakdownList');
    }

    /**
     * Display analysis results
     * @param {Object} data 
     * @param {string} originalQuery 
     * @param {string} searchId 
     */
    display(data, originalQuery, searchId) {
        this.updateTotalCalories(data.totalCalories);
        this.updateServingSize(data.servingSize);
        this.updateConfidence(data.confidence);
        this.updateMacros(data.macros);
        this.updateBreakdown(data.breakdown);
        
        // Store search ID for potential future use
        if (searchId) {
            this.resultsCard.setAttribute('data-search-id', searchId);
        }

        this.show();
        
        // Scroll to results
        setTimeout(() => {
            DOMUtils.scrollToElement(this.resultsCard, 'start');
        }, 100);
    }

    /**
     * Update total calories display
     * @param {number} calories 
     */
    updateTotalCalories(calories) {
        if (this.totalCaloriesEl) {
            this.totalCaloriesEl.textContent = calories || 0;
        }
    }

    /**
     * Update serving size display
     * @param {string} servingSize 
     */
    updateServingSize(servingSize) {
        if (this.servingSizeEl) {
            this.servingSizeEl.textContent = servingSize || 'Not specified';
        }
    }

    /**
     * Update confidence badge
     * @param {string} confidence 
     */
    updateConfidence(confidence = 'medium') {
        if (this.confidenceBadgeEl) {
            this.confidenceBadgeEl.textContent = `${confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence`;
            this.confidenceBadgeEl.className = `badge confidence-${confidence}`;
        }
    }

    /**
     * Update macros display
     * @param {Object} macros 
     */
    updateMacros(macros) {
        if (macros) {
            if (this.proteinEl) this.proteinEl.textContent = `${macros.protein || 0}g`;
            if (this.carbsEl) this.carbsEl.textContent = `${macros.carbs || 0}g`;
            if (this.fatEl) this.fatEl.textContent = `${macros.fat || 0}g`;
        }
    }

    /**
     * Update breakdown display
     * @param {Array} breakdown 
     */
    updateBreakdown(breakdown) {
        if (!this.breakdownListEl) return;

        if (!breakdown || breakdown.length === 0) {
            this.breakdownListEl.innerHTML = '<p class="text-muted">No detailed breakdown available.</p>';
            return;
        }

        const breakdownHTML = breakdown.map(item => `
            <div class="breakdown-item p-3 mb-2 rounded">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${DOMUtils.escapeHtml(item.item || 'Unknown item')}</h6>
                        <small class="text-muted">Individual component</small>
                    </div>
                    <div class="text-end">
                        <h5 class="mb-0 text-primary">${item.calories || 0}</h5>
                        <small class="text-muted">calories</small>
                    </div>
                </div>
            </div>
        `).join('');

        this.breakdownListEl.innerHTML = breakdownHTML;
    }

    /**
     * Show results card
     */
    show() {
        DOMUtils.toggleClass(this.resultsCard, 'd-none', false);
    }

    /**
     * Hide results card
     */
    hide() {
        DOMUtils.toggleClass(this.resultsCard, 'd-none', true);
    }
}
