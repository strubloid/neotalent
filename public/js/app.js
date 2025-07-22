// Import all components and services
import { ApiService } from './services/apiService.js';
import { DOMUtils } from './utils/domUtils.js';
import { LoadingStateManager } from './components/loadingStateManager.js';
import { ErrorHandler } from './components/errorHandler.js';
import { BreadcrumbsComponent } from './components/breadcrumbsComponent.js';
import { ResultsComponent } from './components/resultsComponent.js';
import { InputManager } from './components/inputManager.js';

/**
 * Main Calorie Tracker Application Controller
 */
export class CalorieTrackerApp {
    constructor() {
        this.initializeDOMElements();
        this.initializeServices();
        this.initializeComponents();
        this.initializeEventListeners();
        this.startup();
    }

    /**
     * Initialize DOM element references
     */
    initializeDOMElements() {
        this.form = document.getElementById('calorieForm');
        this.foodInput = document.getElementById('foodInput');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.errorAlert = document.getElementById('errorAlert');
        this.resultsCard = document.getElementById('resultsCard');
        this.newAnalysisBtn = document.getElementById('newAnalysisBtn');
        this.charCount = document.getElementById('charCount');
        this.breadcrumbsCard = document.getElementById('breadcrumbsCard');
        this.breadcrumbsList = document.getElementById('breadcrumbsList');
    }

    /**
     * Initialize services
     */
    initializeServices() {
        this.apiService = new ApiService();
    }

    /**
     * Initialize components
     */
    initializeComponents() {
        this.loadingManager = new LoadingStateManager();
        this.errorHandler = new ErrorHandler(this.errorAlert, this.foodInput);
        this.resultsComponent = new ResultsComponent(this.resultsCard);
        this.inputManager = new InputManager(
            this.foodInput, 
            this.charCount, 
            () => this.errorHandler.clearErrors()
        );
        this.breadcrumbsComponent = new BreadcrumbsComponent(
            this.breadcrumbsCard,
            this.breadcrumbsList,
            (searchId, element) => this.loadPreviousSearch(searchId, element)
        );
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.analyzeFood();
        });

        // New analysis button
        this.newAnalysisBtn.addEventListener('click', () => {
            this.resetForm();
        });

        // Keyboard shortcuts
        this.inputManager.addKeyboardShortcuts(() => this.analyzeFood());
    }

    /**
     * Application startup
     */
    async startup() {
        this.inputManager.updateCharCount();
        await this.loadBreadcrumbs();
        
        console.log('🚀 NeoTalent Calorie Tracker initialized');
    }

    /**
     * Analyze food calories
     */
    async analyzeFood() {
        const foodText = this.inputManager.getValue();

        // Validation
        const validation = this.errorHandler.validateFoodInput(foodText);
        if (!validation.isValid) {
            this.errorHandler.showError(validation.message);
            this.inputManager.focus();
            return;
        }

        try {
            this.loadingManager.setMainLoadingState(this.analyzeBtn, this.foodInput, true);
            this.errorHandler.hideError();
            this.resultsComponent.hide();

            const result = await this.apiService.analyzeCalories(foodText);

            if (result.success && result.data) {
                this.resultsComponent.display(result.data, foodText, result.search_id);
                // Refresh breadcrumbs after successful analysis
                await this.loadBreadcrumbs();
            } else {
                throw new Error('Invalid response format');
            }

        } catch (error) {
            console.error('Analysis error:', error);
            this.errorHandler.showError(error.message);
        } finally {
            this.loadingManager.setMainLoadingState(this.analyzeBtn, this.foodInput, false);
        }
    }

    /**
     * Load breadcrumbs from API
     */
    async loadBreadcrumbs() {
        try {
            const result = await this.apiService.getBreadcrumbs();
            
            if (result.success && result.data.length > 0) {
                this.breadcrumbsComponent.display(result.data);
            } else {
                this.breadcrumbsComponent.hide();
            }
        } catch (error) {
            console.warn('Failed to load breadcrumbs:', error);
            this.breadcrumbsComponent.hide();
        }
    }

    /**
     * Load previous search
     * @param {string} searchId 
     * @param {HTMLElement} breadcrumbElement 
     */
    async loadPreviousSearch(searchId, breadcrumbElement = null) {
        try {
            // Show loading state on the specific breadcrumb if provided
            if (breadcrumbElement) {
                this.loadingManager.setBreadcrumbLoadingState(breadcrumbElement, true);
            } else {
                this.loadingManager.setMainLoadingState(this.analyzeBtn, this.foodInput, true);
            }
            this.errorHandler.hideError();

            const result = await this.apiService.getPreviousSearch(searchId);

            if (result.success && result.data) {
                // Fill the input with the previous query
                this.inputManager.setValue(result.data.query);
                
                // Display the previous results
                this.resultsComponent.display(result.data, result.data.query, searchId);
            } else {
                this.errorHandler.showError('Failed to load previous search');
            }
        } catch (error) {
            console.error('Failed to load previous search:', error);
            this.errorHandler.showError('Failed to load previous search');
        } finally {
            // Hide loading state
            if (breadcrumbElement) {
                this.loadingManager.setBreadcrumbLoadingState(breadcrumbElement, false);
            } else {
                this.loadingManager.setMainLoadingState(this.analyzeBtn, this.foodInput, false);
            }
        }
    }

    /**
     * Reset form to initial state
     */
    resetForm() {
        this.form.reset();
        this.errorHandler.hideError();
        this.resultsComponent.hide();
        this.inputManager.updateCharCount();
        this.inputManager.focus();
        
        // Refresh breadcrumbs
        this.loadBreadcrumbs();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.calorieTracker = new CalorieTrackerApp();
    
    // Service worker registration for offline support (optional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker not available, that's okay
        });
    }
});
