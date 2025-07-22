import { DOMUtils } from '../utils/domUtils.js';

/**
 * Loading state manager component
 */
export class LoadingStateManager {
    constructor() {
        this.activeLoadings = new Set();
    }

    /**
     * Set loading state for main analyze button
     * @param {HTMLElement} analyzeBtn 
     * @param {HTMLElement} foodInput 
     * @param {boolean} isLoading 
     */
    setMainLoadingState(analyzeBtn, foodInput, isLoading) {
        const btnText = analyzeBtn?.querySelector('.btn-text');
        const btnLoading = analyzeBtn?.querySelector('.btn-loading');

        if (!btnText || !btnLoading) return;

        if (isLoading) {
            this.activeLoadings.add('main');
            DOMUtils.toggleClass(btnText, 'd-none', true);
            DOMUtils.toggleClass(btnLoading, 'd-none', false);
            if (analyzeBtn) analyzeBtn.disabled = true;
            if (foodInput) foodInput.disabled = true;
        } else {
            this.activeLoadings.delete('main');
            DOMUtils.toggleClass(btnText, 'd-none', false);
            DOMUtils.toggleClass(btnLoading, 'd-none', true);
            if (analyzeBtn) analyzeBtn.disabled = false;
            if (foodInput) foodInput.disabled = false;
        }
    }

    /**
     * Set loading state for breadcrumb item
     * @param {HTMLElement} breadcrumbElement 
     * @param {boolean} isLoading 
     */
    setBreadcrumbLoadingState(breadcrumbElement, isLoading) {
        if (!breadcrumbElement) return;

        const content = breadcrumbElement.querySelector('.d-flex');
        const timeElement = breadcrumbElement.querySelector('.text-muted');
        const loadingElement = breadcrumbElement.querySelector('.breadcrumb-loading');
        const breadcrumbId = breadcrumbElement.dataset.searchId;

        if (isLoading) {
            this.activeLoadings.add(`breadcrumb-${breadcrumbId}`);
            // Hide content and show loading
            if (content) content.style.display = 'none';
            if (timeElement) timeElement.style.display = 'none';
            if (loadingElement) loadingElement.classList.remove('d-none');
            
            // Disable the breadcrumb
            breadcrumbElement.style.pointerEvents = 'none';
            breadcrumbElement.style.opacity = '0.7';
        } else {
            this.activeLoadings.delete(`breadcrumb-${breadcrumbId}`);
            // Show content and hide loading
            if (content) content.style.display = '';
            if (timeElement) timeElement.style.display = '';
            if (loadingElement) loadingElement.classList.add('d-none');
            
            // Re-enable the breadcrumb
            breadcrumbElement.style.pointerEvents = '';
            breadcrumbElement.style.opacity = '';
        }
    }

    /**
     * Check if any loading is active
     * @returns {boolean}
     */
    isLoading() {
        return this.activeLoadings.size > 0;
    }

    /**
     * Clear all loading states
     */
    clearAll() {
        this.activeLoadings.clear();
    }
}
