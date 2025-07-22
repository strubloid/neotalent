import { DOMUtils } from '../utils/domUtils.js';

/**
 * Breadcrumbs component for managing search history
 */
export class BreadcrumbsComponent {
    constructor(breadcrumbsCard, breadcrumbsList, onBreadcrumbClick) {
        this.breadcrumbsCard = breadcrumbsCard;
        this.breadcrumbsList = breadcrumbsList;
        this.onBreadcrumbClick = onBreadcrumbClick;
        
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Breadcrumb click handling using event delegation
        this.breadcrumbsList.addEventListener('click', (e) => {
            const breadcrumbItem = e.target.closest('.breadcrumb-item');
            if (breadcrumbItem && breadcrumbItem.dataset.searchId) {
                e.preventDefault();
                this.onBreadcrumbClick(breadcrumbItem.dataset.searchId, breadcrumbItem);
            }
        });
    }

    /**
     * Display breadcrumbs
     * @param {Array} breadcrumbs 
     */
    display(breadcrumbs) {
        if (!breadcrumbs || breadcrumbs.length === 0) {
            this.hide();
            return;
        }

        const breadcrumbsHTML = breadcrumbs.map(item => `
            <div class="breadcrumb-item" title="${DOMUtils.escapeHtml(item.query)}" data-search-id="${item.id}" style="cursor: pointer;">
                <div class="d-flex align-items-center">
                    <span class="me-2">${DOMUtils.truncateText(item.query, 30)}</span>
                    <span class="calories">${item.totalCalories}cal</span>
                </div>
                <small class="text-muted d-block">${DOMUtils.formatTimeAgo(item.timestamp)}</small>
                <div class="breadcrumb-loading d-none">
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading...
                </div>
            </div>
        `).join('');

        this.breadcrumbsList.innerHTML = breadcrumbsHTML;
        this.show();
    }

    /**
     * Show breadcrumbs card
     */
    show() {
        DOMUtils.toggleClass(this.breadcrumbsCard, 'd-none', false);
    }

    /**
     * Hide breadcrumbs card
     */
    hide() {
        DOMUtils.toggleClass(this.breadcrumbsCard, 'd-none', true);
    }
}
