import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthModals from './AuthModals';
import { AuthModalsProps } from '../../interfaces';

// Mock Bootstrap modal methods
const mockModalHide = jest.fn();
const mockModalGetInstance = jest.fn(() => ({
  hide: mockModalHide
}));

(window as any).bootstrap = {
  Modal: {
    getInstance: mockModalGetInstance
  }
};

describe('AuthModals', () => {
  const mockOnLogin = jest.fn();
  const mockOnRegister = jest.fn();

  const defaultProps: AuthModalsProps = {
    onLogin: mockOnLogin,
    onRegister: mockOnRegister
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clear any DOM elements that may have been added
    document.body.innerHTML = '';
  });

  describe('Login Modal', () => {
    it('renders login modal with correct elements', () => {
      render(<AuthModals {...defaultProps} />);
      
      expect(screen.getByText('Login to Your Journey')).toBeInTheDocument();
      expect(document.querySelector('#loginUsername')).toBeInTheDocument(); // Specific login username
      expect(document.querySelector('#loginPassword')).toBeInTheDocument(); // Specific login password
      expect(document.querySelector('#loginModal button[type="submit"]')).toBeInTheDocument(); // Login button
    });

    it('handles username input change', () => {
      render(<AuthModals {...defaultProps} />);
      
      const usernameInput = document.querySelector('#loginUsername') as HTMLInputElement;
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      
      expect(usernameInput).toHaveValue('testuser');
    });

    it('handles password input change', () => {
      render(<AuthModals {...defaultProps} />);
      
      const passwordInput = document.querySelector('#loginPassword') as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      
      expect(passwordInput).toHaveValue('testpass');
    });

    it('shows error when submitting empty form', async () => {
      render(<AuthModals {...defaultProps} />);
      
      const loginButton = document.querySelector('#loginModal button[type="submit"]');
      fireEvent.click(loginButton!);
      
      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
      });
    });

    it('calls onLogin with correct credentials', async () => {
      render(<AuthModals {...defaultProps} />);
      
      const usernameInput = document.querySelector('#loginUsername') as HTMLInputElement;
      const passwordInput = document.querySelector('#loginPassword') as HTMLInputElement;
      const loginButton = document.querySelector('#loginModal button[type="submit"]');
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(loginButton!);
      
      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'testpass'
        });
      });
    });

    it('shows loading state during login', async () => {
      const slowOnLogin = jest.fn(() => new Promise<void>(resolve => setTimeout(resolve, 100)));
      render(<AuthModals {...defaultProps} onLogin={slowOnLogin} />);
      
      const usernameInput = document.querySelector('#loginUsername') as HTMLInputElement;
      const passwordInput = document.querySelector('#loginPassword') as HTMLInputElement;
      const loginButton = document.querySelector('#loginModal button[type="submit"]');
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(loginButton!);
      
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
      expect(loginButton).toBeDisabled();
    });

    it('handles login error', async () => {
      const errorOnLogin = jest.fn(() => Promise.reject<void>(new Error('Invalid credentials')));
      render(<AuthModals {...defaultProps} onLogin={errorOnLogin} />);
      
      const usernameInput = document.querySelector('#loginUsername') as HTMLInputElement;
      const passwordInput = document.querySelector('#loginPassword') as HTMLInputElement;
      const loginButton = document.querySelector('#loginModal button[type="submit"]');
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(loginButton!);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });
  });

  describe('Register Modal', () => {
    it('renders register modal with correct elements', () => {
      render(<AuthModals {...defaultProps} />);
      
      expect(screen.getByText('Create Your Account')).toBeInTheDocument();
      expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
      expect(document.querySelector('#registerUsername')).toBeInTheDocument(); // Specific register username
      expect(document.querySelector('#registerPassword')).toBeInTheDocument(); // Specific register password
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      
      const createAccountButton = document.querySelector('#registerModal button[type="submit"]');
      expect(createAccountButton).toBeInTheDocument();
    });

    it('handles all form inputs', () => {
      render(<AuthModals {...defaultProps} />);
      
      const nicknameInput = screen.getByLabelText('Display Name');
      const usernameInput = document.querySelector('#registerUsername') as HTMLInputElement; // Specific register username
      const passwordInput = document.querySelector('#registerPassword') as HTMLInputElement; // Specific register password
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      
      fireEvent.change(nicknameInput, { target: { value: 'Test User' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'testpass' } });
      
      expect(nicknameInput).toHaveValue('Test User');
      expect(usernameInput).toHaveValue('testuser');
      expect(passwordInput).toHaveValue('testpass');
      expect(confirmPasswordInput).toHaveValue('testpass');
    });

    it('shows error when passwords do not match', async () => {
      render(<AuthModals {...defaultProps} />);
      
      const nicknameInput = screen.getByLabelText('Display Name');
      const usernameInput = document.querySelector('#registerUsername') as HTMLInputElement;
      const passwordInput = document.querySelector('#registerPassword') as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const registerButton = document.querySelector('#registerModal .modal-footer button[type="submit"]') as HTMLButtonElement;
      
      fireEvent.change(nicknameInput, { target: { value: 'Test User' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpass' } });
      fireEvent.click(registerButton);
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('shows error when password is too short', async () => {
      render(<AuthModals {...defaultProps} />);
      
      const nicknameInput = screen.getByLabelText('Display Name');
      const usernameInput = document.querySelector('#registerUsername') as HTMLInputElement;
      const passwordInput = document.querySelector('#registerPassword') as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const registerButton = document.querySelector('#registerModal .modal-footer button[type="submit"]') as HTMLButtonElement;
      
      fireEvent.change(nicknameInput, { target: { value: 'Test User' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
      fireEvent.click(registerButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
      });
    });

    it('calls onRegister with correct data', async () => {
      render(<AuthModals {...defaultProps} />);
      
      const nicknameInput = screen.getByLabelText('Display Name');
      const usernameInput = screen.getAllByLabelText(/Username/)[1];
      const passwordInput = screen.getAllByLabelText(/^Password$/)[1];
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const registerButton = document.querySelector('#registerModal .modal-footer button[type="submit"]') as HTMLButtonElement;
      
      fireEvent.change(nicknameInput, { target: { value: 'Test User' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'testpass' } });
      fireEvent.click(registerButton);
      
      await waitFor(() => {
        expect(mockOnRegister).toHaveBeenCalledWith({
          nickname: 'Test User',
          username: 'testuser',
          password: 'testpass'
        });
      });
    });

    it('shows loading state during registration', async () => {
      const slowOnRegister = jest.fn(() => new Promise<void>(resolve => setTimeout(resolve, 100)));
      render(<AuthModals {...defaultProps} onRegister={slowOnRegister} />);
      
      const nicknameInput = screen.getByLabelText('Display Name');
      const usernameInput = screen.getAllByLabelText(/Username/)[1];
      const passwordInput = screen.getAllByLabelText(/^Password$/)[1];
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const registerButton = document.querySelector('#registerModal .modal-footer button[type="submit"]') as HTMLButtonElement;
      
      fireEvent.change(nicknameInput, { target: { value: 'Test User' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'testpass' } });
      fireEvent.click(registerButton);
      
      expect(screen.getByText('Creating Account...')).toBeInTheDocument();
      expect(registerButton).toBeDisabled();
    });

    it('handles registration error', async () => {
      const errorOnRegister = jest.fn(() => Promise.reject<void>(new Error('Username already exists')));
      render(<AuthModals {...defaultProps} onRegister={errorOnRegister} />);
      
      const nicknameInput = screen.getByLabelText('Display Name');
      const usernameInput = screen.getAllByLabelText(/Username/)[1];
      const passwordInput = screen.getAllByLabelText(/^Password$/)[1];
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const registerButton = document.querySelector('#registerModal .modal-footer button[type="submit"]') as HTMLButtonElement;
      
      fireEvent.change(nicknameInput, { target: { value: 'Test User' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'testpass' } });
      fireEvent.click(registerButton);
      
      await waitFor(() => {
        expect(screen.getByText('Username already exists')).toBeInTheDocument();
      });
    });
  });
});
