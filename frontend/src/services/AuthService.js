/**
 * Authentication Service
 * Handles all authentication-related API calls and state management
 */
class AuthService {
    constructor() {
        this.apiBaseUrl = window.location.origin;
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Auth UI elements
        this.authButtons = document.getElementById('authButtons');
        this.userMenu = document.getElementById('userMenu');
        this.userNickname = document.getElementById('userNickname');
        this.userUsername = document.getElementById('userUsername');
        
        // Modals
        this.loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        this.registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
        this.deleteAccountModal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));
        
        // Forms
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        
        // Buttons
        this.loginBtn = document.getElementById('loginBtn');
        this.registerBtn = document.getElementById('registerBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.deleteAccountBtn = document.getElementById('deleteAccountBtn');
        this.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        
        this.initializeEventListeners();
        this.checkAuthStatus();
    }

    initializeEventListeners() {
        // Modal triggers
        this.loginBtn.addEventListener('click', () => {
            this.loginModal.show();
        });

        this.registerBtn.addEventListener('click', () => {
            this.registerModal.show();
        });

        this.deleteAccountBtn.addEventListener('click', () => {
            this.deleteAccountModal.show();
        });

        // Form submissions
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        this.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Logout
        this.logoutBtn.addEventListener('click', () => {
            this.handleLogout();
        });

        // Delete account
        this.confirmDeleteBtn.addEventListener('click', () => {
            this.handleDeleteAccount();
        });

        // Clear form errors on input
        this.addFormErrorClearListeners();
    }

    addFormErrorClearListeners() {
        const clearError = (inputId, errorId) => {
            const input = document.getElementById(inputId);
            const error = document.getElementById(errorId);
            input.addEventListener('input', () => {
                input.classList.remove('is-invalid');
                error.textContent = '';
            });
        };

        clearError('loginUsername', 'loginUsernameError');
        clearError('loginPassword', 'loginPasswordError');
        clearError('registerUsername', 'registerUsernameError');
        clearError('registerPassword', 'registerPasswordError');
        clearError('registerNickname', 'registerNicknameError');
    }

    async checkAuthStatus() {
        try {
            const response = await this.makeRequest('/api/auth/status');
            
            if (response.success && response.isAuthenticated) {
                this.setAuthenticatedState(response.user);
            } else {
                this.setUnauthenticatedState();
            }
        } catch (error) {
            console.error('Auth status check failed:', error);
            this.setUnauthenticatedState();
        }
    }

    async handleLogin() {
        const submitBtn = document.getElementById('loginSubmitBtn');
        const errorAlert = document.getElementById('loginError');
        
        try {
            this.setButtonLoading(submitBtn, true);
            this.hideError(errorAlert);

            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;

            const response = await this.makeRequest('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            if (response.success) {
                this.setAuthenticatedState(response.user);
                this.loginModal.hide();
                this.resetForm(this.loginForm);
                this.showSuccessMessage('Login successful!');
            } else {
                this.showError(errorAlert, response.message || 'Login failed');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showError(errorAlert, 'Network error. Please try again.');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async handleRegister() {
        const submitBtn = document.getElementById('registerSubmitBtn');
        const errorAlert = document.getElementById('registerError');
        
        try {
            this.setButtonLoading(submitBtn, true);
            this.hideError(errorAlert);

            const username = document.getElementById('registerUsername').value.trim();
            const password = document.getElementById('registerPassword').value;
            const nickname = document.getElementById('registerNickname').value.trim();

            const response = await this.makeRequest('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, nickname })
            });

            if (response.success) {
                this.registerModal.hide();
                this.resetForm(this.registerForm);
                this.showSuccessMessage('Registration successful! You can now login.');
                // Auto-open login modal
                setTimeout(() => {
                    this.loginModal.show();
                }, 500);
            } else {
                this.showError(errorAlert, response.message || 'Registration failed');
            }

        } catch (error) {
            console.error('Registration error:', error);
            this.showError(errorAlert, 'Network error. Please try again.');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async handleLogout() {
        try {
            const response = await this.makeRequest('/api/auth/logout', {
                method: 'POST'
            });

            if (response.success) {
                this.setUnauthenticatedState();
                this.showSuccessMessage('Logged out successfully!');
                // Trigger breadcrumb reload for guest state
                if (window.calorieTracker) {
                    window.calorieTracker.loadBreadcrumbs();
                }
            } else {
                console.error('Logout failed:', response.message);
            }

        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async handleDeleteAccount() {
        const submitBtn = document.getElementById('confirmDeleteBtn');
        const errorAlert = document.getElementById('deleteAccountError');
        
        try {
            this.setButtonLoading(submitBtn, true);
            this.hideError(errorAlert);

            const response = await this.makeRequest('/api/auth/delete', {
                method: 'DELETE'
            });

            if (response.success) {
                this.setUnauthenticatedState();
                this.deleteAccountModal.hide();
                this.showSuccessMessage('Account deleted successfully!');
                // Clear any local data
                if (window.calorieTracker) {
                    window.calorieTracker.clearLocalBreadcrumbs();
                }
            } else {
                this.showError(errorAlert, response.message || 'Failed to delete account');
            }

        } catch (error) {
            console.error('Delete account error:', error);
            this.showError(errorAlert, 'Network error. Please try again.');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    setAuthenticatedState(user) {
        this.isAuthenticated = true;
        this.currentUser = user;
        
        this.authButtons.classList.add('d-none');
        this.userMenu.classList.remove('d-none');
        
        this.userNickname.textContent = user.nickname;
        this.userUsername.textContent = user.username;
    }

    setUnauthenticatedState() {
        this.isAuthenticated = false;
        this.currentUser = null;
        
        this.authButtons.classList.remove('d-none');
        this.userMenu.classList.add('d-none');
    }

    async makeRequest(url, options = {}) {
        const defaultOptions = {
            credentials: 'same-origin', // Include session cookies
        };
        
        const response = await fetch(this.apiBaseUrl + url, {
            ...defaultOptions,
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    setButtonLoading(button, loading) {
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');
        
        if (loading) {
            btnText.classList.add('d-none');
            btnLoading.classList.remove('d-none');
            button.disabled = true;
        } else {
            btnText.classList.remove('d-none');
            btnLoading.classList.add('d-none');
            button.disabled = false;
        }
    }

    showError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.classList.remove('d-none');
    }

    hideError(errorElement) {
        errorElement.classList.add('d-none');
        errorElement.textContent = '';
    }

    resetForm(form) {
        form.reset();
        // Remove validation classes
        form.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
        // Clear error messages
        form.querySelectorAll('.invalid-feedback').forEach(el => {
            el.textContent = '';
        });
    }

    showSuccessMessage(message) {
        // Create a toast or temporary alert
        const toast = document.createElement('div');
        toast.className = 'position-fixed top-0 end-0 m-3 alert alert-success alert-dismissible fade show';
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <i class="bi bi-check-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }
}

// Initialize auth service when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authService = new AuthService();
});
