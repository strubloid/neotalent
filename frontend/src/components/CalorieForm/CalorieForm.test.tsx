import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CalorieForm from './CalorieForm';
import { CalorieFormProps } from '../../interfaces';

describe('CalorieForm', () => {
  const mockOnAnalyze = jest.fn();

  const defaultProps: CalorieFormProps = {
    onAnalyze: mockOnAnalyze,
    isLoading: false,
    error: '',
    resetTrigger: undefined
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the form with all elements', () => {
      render(<CalorieForm {...defaultProps} />);

      expect(screen.getByText('Analyze Your Food')).toBeInTheDocument();
      expect(screen.getByLabelText('Describe your food or meal:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /analyze calories/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
      expect(screen.getByText(/be as specific as possible/i)).toBeInTheDocument();
      expect(screen.getByText(/include portion sizes/i)).toBeInTheDocument();
    });

    it('renders placeholder text correctly', () => {
      render(<CalorieForm {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder', 'e.g., 2 slices of whole wheat toast with avocado and a poached egg');
    });

    it('has correct maxLength attribute', () => {
      render(<CalorieForm {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', '500');
    });
  });

  describe('User interactions', () => {
    it('updates textarea value when user types', () => {
      render(<CalorieForm {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Apple pie' } });

      expect(textarea).toHaveValue('Apple pie');
    });

    it('shows character count when user types', () => {
      render(<CalorieForm {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Apple pie' } });

      expect(screen.getByText('9/500 characters')).toBeInTheDocument();
    });

    it('enables submit button when text is entered', () => {
      render(<CalorieForm {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /analyze calories/i });

      expect(submitButton).toBeDisabled();

      fireEvent.change(textarea, { target: { value: 'Apple pie' } });

      expect(submitButton).not.toBeDisabled();
    });

    it('enables clear button when text is entered', () => {
      render(<CalorieForm {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      const clearButton = screen.getByRole('button', { name: /clear/i });

      expect(clearButton).toBeDisabled();

      fireEvent.change(textarea, { target: { value: 'Apple pie' } });

      expect(clearButton).not.toBeDisabled();
    });

    it('clears textarea when clear button is clicked', () => {
      render(<CalorieForm {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      const clearButton = screen.getByRole('button', { name: /clear/i });

      fireEvent.change(textarea, { target: { value: 'Apple pie' } });
      expect(textarea).toHaveValue('Apple pie');

      fireEvent.click(clearButton);
      expect(textarea).toHaveValue('');
    });

    it('calls onAnalyze when form is submitted with valid text', () => {
      render(<CalorieForm {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /analyze calories/i });

      fireEvent.change(textarea, { target: { value: 'Apple pie' } });
      fireEvent.click(submitButton);

      expect(mockOnAnalyze).toHaveBeenCalledWith('Apple pie');
    });

    it('trims whitespace before calling onAnalyze', () => {
      render(<CalorieForm {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /analyze calories/i });

      fireEvent.change(textarea, { target: { value: '  Apple pie  ' } });
      fireEvent.click(submitButton);

      expect(mockOnAnalyze).toHaveBeenCalledWith('Apple pie');
    });

    it('does not call onAnalyze when form is submitted with only whitespace', () => {
      render(<CalorieForm {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      const form = textarea.closest('form');

      fireEvent.change(textarea, { target: { value: '   ' } });
      fireEvent.submit(form!);

      expect(mockOnAnalyze).not.toHaveBeenCalled();
    });

    it('calls onAnalyze when form is submitted via Enter key', () => {
      render(<CalorieForm {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      const form = textarea.closest('form');

      fireEvent.change(textarea, { target: { value: 'Apple pie' } });
      fireEvent.submit(form!);

      expect(mockOnAnalyze).toHaveBeenCalledWith('Apple pie');
    });
  });

  describe('Loading state', () => {
    it('shows loading state when isLoading is true', () => {
      render(<CalorieForm {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
      expect(document.querySelector('.spinner-border')).toBeInTheDocument(); // spinner
    });

    it('disables form elements when loading', () => {
      render(<CalorieForm {...defaultProps} isLoading={true} />);

      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /analyzing/i });
      const clearButton = screen.getByRole('button', { name: /clear/i });

      expect(textarea).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(clearButton).toBeDisabled();
    });
  });

  describe('Error state', () => {
    it('shows error message when error prop is provided', () => {
      const errorMessage = 'Unable to analyze food';
      render(<CalorieForm {...defaultProps} error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('adds error styling to textarea when error exists', () => {
      const errorMessage = 'Unable to analyze food';
      render(<CalorieForm {...defaultProps} error={errorMessage} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('is-invalid');
    });

    it('does not show error when error prop is empty', () => {
      render(<CalorieForm {...defaultProps} error={''} />);

      expect(screen.queryByText(/unable to analyze/i)).not.toBeInTheDocument();
    });
  });

  describe('Reset functionality', () => {
    it('resets form when resetTrigger changes', () => {
      const { rerender } = render(<CalorieForm {...defaultProps} resetTrigger={1} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Apple pie' } });
      expect(textarea).toHaveValue('Apple pie');

      // Change resetTrigger to trigger reset
      rerender(<CalorieForm {...defaultProps} resetTrigger={2} />);

      expect(textarea).toHaveValue('');
    });

    it('does not reset when resetTrigger remains the same', () => {
      const { rerender } = render(<CalorieForm {...defaultProps} resetTrigger={1} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Apple pie' } });
      expect(textarea).toHaveValue('Apple pie');

      // Re-render with same resetTrigger
      rerender(<CalorieForm {...defaultProps} resetTrigger={1} />);

      expect(textarea).toHaveValue('Apple pie');
    });

    it('does not reset when resetTrigger is undefined', () => {
      const { rerender } = render(<CalorieForm {...defaultProps} resetTrigger={undefined} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Apple pie' } });
      expect(textarea).toHaveValue('Apple pie');

      // Re-render with undefined resetTrigger
      rerender(<CalorieForm {...defaultProps} resetTrigger={undefined} />);

      expect(textarea).toHaveValue('Apple pie');
    });
  });

  describe('Character limit', () => {
    it('shows character count correctly', () => {
      render(<CalorieForm {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      const longText = 'a'.repeat(250);

      fireEvent.change(textarea, { target: { value: longText } });

      expect(screen.getByText('250/500 characters')).toBeInTheDocument();
    });

    it('does not show character count when empty', () => {
      render(<CalorieForm {...defaultProps} />);

      expect(screen.queryByText(/\/500 characters/)).not.toBeInTheDocument();
    });
  });
});
