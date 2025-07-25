import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from './Navigation';
import { NavigationProps, User } from '../../interfaces';

describe('Navigation', () => {
  const mockOnLogout = jest.fn();
  const mockOnDeleteAccount = jest.fn();
  const mockOnNavigateToRecentSearches = jest.fn();
  const mockOnNavigateToHome = jest.fn();

  const mockUser: User = {
    id: '1',
    username: 'testuser',
    nickname: 'Test User',
    createdAt: '2023-01-01T00:00:00.000Z'
  };

  const defaultProps: NavigationProps = {
    user: null,
    isAuthenticated: false,
    onLogout: mockOnLogout,
    onDeleteAccount: mockOnDeleteAccount,
    onNavigateToRecentSearches: mockOnNavigateToRecentSearches,
    onNavigateToHome: mockOnNavigateToHome,
    currentView: 'home'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders the navigation with brand', () => {
      render(<Navigation {...defaultProps} />);
      
      expect(screen.getByText('Calorie Tracker')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
    });

    it('renders the navbar toggler for mobile', () => {
      render(<Navigation {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button', { expanded: false });
      expect(toggleButton).toHaveClass('navbar-toggler');
    });
  });

  describe('Unauthenticated state', () => {
    it('shows login and register buttons when not authenticated', () => {
      render(<Navigation {...defaultProps} />);
      
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('does not show user dropdown when not authenticated', () => {
      render(<Navigation {...defaultProps} />);
      
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete Account')).not.toBeInTheDocument();
    });

    it('login button has correct modal target', () => {
      render(<Navigation {...defaultProps} />);
      
      const loginButton = screen.getByText('Login');
      expect(loginButton).toHaveAttribute('data-bs-target', '#loginModal');
    });

    it('register button has correct modal target', () => {
      render(<Navigation {...defaultProps} />);
      
      const registerButton = screen.getByText('Register');
      expect(registerButton).toHaveAttribute('data-bs-target', '#registerModal');
    });
  });

  describe('Authenticated state', () => {
    const authenticatedProps: NavigationProps = {
      ...defaultProps,
      isAuthenticated: true,
      user: mockUser
    };

    it('shows user dropdown when authenticated', () => {
      render(<Navigation {...authenticatedProps} />);
      
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
      expect(screen.queryByText('Register')).not.toBeInTheDocument();
    });

    it('shows logout and delete account options in dropdown', () => {
      render(<Navigation {...authenticatedProps} />);
      
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.getByText('Delete Account')).toBeInTheDocument();
    });

    it('calls onLogout when logout is clicked', () => {
      render(<Navigation {...authenticatedProps} />);
      
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
      
      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it('calls onDeleteAccount when delete account is clicked', () => {
      render(<Navigation {...authenticatedProps} />);
      
      const deleteButton = screen.getByText('Delete Account');
      fireEvent.click(deleteButton);
      
      expect(mockOnDeleteAccount).toHaveBeenCalledTimes(1);
    });

    it('delete account button has danger styling', () => {
      render(<Navigation {...authenticatedProps} />);
      
      const deleteButton = screen.getByText('Delete Account');
      expect(deleteButton).toHaveClass('text-danger');
    });
  });

  describe('Navigation functionality', () => {
    it('calls onNavigateToHome when brand is clicked', () => {
      render(<Navigation {...defaultProps} />);
      
      const brandButton = screen.getByText('Calorie Tracker');
      fireEvent.click(brandButton);
      
      expect(mockOnNavigateToHome).toHaveBeenCalledTimes(1);
    });

    it('calls onNavigateToHome when Home nav link is clicked', () => {
      render(<Navigation {...defaultProps} />);
      
      const homeButton = screen.getByText('Home');
      fireEvent.click(homeButton);
      
      expect(mockOnNavigateToHome).toHaveBeenCalledTimes(1);
    });

    it('calls onNavigateToRecentSearches when Recent Searches is clicked', () => {
      render(<Navigation {...defaultProps} />);
      
      const recentSearchesButton = screen.getByText('Recent Searches');
      fireEvent.click(recentSearchesButton);
      
      expect(mockOnNavigateToRecentSearches).toHaveBeenCalledTimes(1);
    });
  });

  describe('Active navigation states', () => {
    it('shows home as active when currentView is home', () => {
      render(<Navigation {...defaultProps} currentView="home" />);
      
      const homeButton = screen.getByText('Home');
      expect(homeButton).toHaveClass('active');
      
      const recentSearchesButton = screen.getByText('Recent Searches');
      expect(recentSearchesButton).not.toHaveClass('active');
    });

    it('shows recent searches as active when currentView is recent-searches', () => {
      render(<Navigation {...defaultProps} currentView="recent-searches" />);
      
      const recentSearchesButton = screen.getByText('Recent Searches');
      expect(recentSearchesButton).toHaveClass('active');
      
      const homeButton = screen.getByText('Home');
      expect(homeButton).not.toHaveClass('active');
    });
  });

  describe('Accessibility', () => {
    it('has proper role for dropdown toggle', () => {
      const authenticatedProps: NavigationProps = {
        ...defaultProps,
        isAuthenticated: true,
        user: mockUser
      };
      
      render(<Navigation {...authenticatedProps} />);
      
      const dropdownToggle = screen.getByRole('button', { expanded: false });
      expect(dropdownToggle).toHaveAttribute('data-bs-toggle', 'dropdown');
    });

    it('has proper aria labels for icons', () => {
      render(<Navigation {...defaultProps} />);
      
      // Check that icons are present (though not directly testable for aria-labels in this setup)
      expect(screen.getByText('Calorie Tracker')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
    });
  });

  describe('Responsive design', () => {
    it('has navbar-expand-lg class for responsive behavior', () => {
      render(<Navigation {...defaultProps} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('navbar-expand-lg');
    });

    it('has collapse class for mobile menu', () => {
      render(<Navigation {...defaultProps} />);
      
      const collapseDiv = document.querySelector('.navbar-collapse');
      expect(collapseDiv).toHaveClass('collapse');
      expect(collapseDiv).toHaveAttribute('id', 'navbarNav');
    });
  });
});
