import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResultsCard from './ResultsCard';
import { ResultsCardProps, NutritionResult } from '../../interfaces';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve())
  }
});

// Mock window.print
Object.defineProperty(window, 'print', {
  value: jest.fn()
});

// Mock alert
Object.defineProperty(window, 'alert', {
  value: jest.fn()
});

describe('ResultsCard', () => {
  const mockOnNewAnalysis = jest.fn();

  const mockNutritionResult: NutritionResult = {
    searchId: '123',
    query: 'Apple pie',
    totalCalories: 320,
    totalProtein: 4,
    totalCarbs: 58,
    totalFat: 12,
    totalFiber: 3,
    totalSugar: 35,
    totalSodium: 150,
    breakdown: [
      {
        food: 'Apple pie',
        quantity: '1 slice',
        calories: 320,
        protein: 4,
        carbs: 58,
        fat: 12,
        fiber: 3,
        sugar: 35,
        sodium: 150
      }
    ],
    summary: 'A slice of homemade apple pie with cinnamon and sugar',
    timestamp: new Date('2023-01-01T12:00:00Z').toISOString()
  };

  const defaultProps: ResultsCardProps = {
    result: mockNutritionResult,
    onNewAnalysis: mockOnNewAnalysis
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the nutrition analysis results', () => {
      render(<ResultsCard {...defaultProps} />);

      expect(screen.getByText('Nutrition Analysis Results')).toBeInTheDocument();
      expect(screen.getByText('Apple pie')).toBeInTheDocument();
      expect(screen.getByText('320')).toBeInTheDocument(); // calories
      expect(screen.getByText('4g')).toBeInTheDocument(); // protein
      expect(screen.getByText('58g')).toBeInTheDocument(); // carbs
      expect(screen.getByText('12g')).toBeInTheDocument(); // fat
    });

    it('shows macronutrient breakdown with correct percentages', () => {
      render(<ResultsCard {...defaultProps} />);

      // Total macros: 4 + 58 + 12 = 74g
      // Protein: 4/74 = ~5%, Carbs: 58/74 = ~78%, Fat: 12/74 = ~16%
      expect(screen.getByText('5%')).toBeInTheDocument(); // protein percentage
      expect(screen.getByText('78%')).toBeInTheDocument(); // carbs percentage
      expect(screen.getByText('16%')).toBeInTheDocument(); // fat percentage
    });

    it('displays additional nutrition information', () => {
      render(<ResultsCard {...defaultProps} />);

      expect(screen.getByText('3g')).toBeInTheDocument(); // fiber
      expect(screen.getByText('35g')).toBeInTheDocument(); // sugar
      expect(screen.getByText('150mg')).toBeInTheDocument(); // sodium
    });

    it('shows the food breakdown table', () => {
      render(<ResultsCard {...defaultProps} />);

      expect(screen.getByText('Detailed Food Breakdown')).toBeInTheDocument();
      expect(screen.getByText('1 slice')).toBeInTheDocument();
    });

    it('displays the summary when provided', () => {
      render(<ResultsCard {...defaultProps} />);

      expect(screen.getByText('A slice of homemade apple pie with cinnamon and sugar')).toBeInTheDocument();
    });

    it('shows analysis info with formatted dates', () => {
      render(<ResultsCard {...defaultProps} />);

      expect(screen.getByText('ID: 123')).toBeInTheDocument();
      // Date formatting may vary by locale, so just check if date elements exist
      expect(screen.getByText(/1\/1\/2023/)).toBeInTheDocument(); // Date
    });
  });

  describe('Expand/Collapse functionality', () => {
    it('starts expanded by default', () => {
      render(<ResultsCard {...defaultProps} />);

      // Should show content when expanded
      expect(screen.getByText('Apple pie')).toBeInTheDocument();
      expect(screen.getByText('320')).toBeInTheDocument();
    });

    it('toggles expanded state when header is clicked', () => {
      render(<ResultsCard {...defaultProps} />);

      const header = screen.getByText('Nutrition Analysis Results').closest('.card-header');
      
      // Click to collapse
      fireEvent.click(header!);
      
      // Should show up chevron when collapsed (though we can't directly test CSS transitions)
      const chevron = document.querySelector('.bi-chevron-up');
      expect(chevron).toBeInTheDocument();
    });
  });

  describe('Action buttons', () => {
    it('calls onNewAnalysis when "Analyze Another Food" button is clicked', () => {
      render(<ResultsCard {...defaultProps} />);

      const analyzeButton = screen.getByText('Analyze Another Food');
      fireEvent.click(analyzeButton);

      expect(mockOnNewAnalysis).toHaveBeenCalledTimes(1);
    });

    it('calls onNewAnalysis when "New Analysis" button in header is clicked', () => {
      render(<ResultsCard {...defaultProps} />);

      const newAnalysisButton = screen.getByText('New Analysis');
      fireEvent.click(newAnalysisButton);

      expect(mockOnNewAnalysis).toHaveBeenCalledTimes(1);
    });

    it('does not toggle expansion when New Analysis button is clicked', () => {
      render(<ResultsCard {...defaultProps} />);

      const newAnalysisButton = screen.getByText('New Analysis');
      fireEvent.click(newAnalysisButton);

      // Should still show down chevron (expanded state)
      const chevron = document.querySelector('.bi-chevron-down');
      expect(chevron).toBeInTheDocument();
    });

    it('calls window.print when print button is clicked', () => {
      render(<ResultsCard {...defaultProps} />);

      const printButton = screen.getByText('Print Results');
      fireEvent.click(printButton);

      expect(window.print).toHaveBeenCalledTimes(1);
    });

    it('copies simple results to clipboard when copy simple button is clicked', async () => {
      render(<ResultsCard {...defaultProps} />);

      const copySimpleButton = screen.getByText('Copy Simple');
      fireEvent.click(copySimpleButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Apple pie: 320 calories');
        expect(window.alert).toHaveBeenCalledWith('Simple results copied to clipboard!');
      });
    });

    it('copies extended results to clipboard when copy extended button is clicked', async () => {
      render(<ResultsCard {...defaultProps} />);

      const copyExtendedButton = screen.getByText('Copy Extended');
      fireEvent.click(copyExtendedButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('Food Analysis: Apple pie')
        );
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('Total Calories: 320')
        );
        expect(window.alert).toHaveBeenCalledWith('Extended nutrition analysis copied to clipboard!');
      });
    });
  });

  describe('Edge cases', () => {
    it('handles zero macros gracefully', () => {
      const zeroMacrosResult = {
        ...mockNutritionResult,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0
      };

      render(<ResultsCard {...defaultProps} result={zeroMacrosResult} />);

      // Should show 0% for all macros when total is 0
      const percentages = screen.getAllByText('0%');
      expect(percentages).toHaveLength(3); // protein, carbs, fat
    });

    it('handles missing optional nutrition values', () => {
      const minimalResult = {
        ...mockNutritionResult,
        totalFiber: undefined,
        totalSugar: undefined,
        totalSodium: undefined
      };

      render(<ResultsCard {...defaultProps} result={minimalResult} />);

      // Should show 0 for undefined values
      expect(screen.getByText('0g')).toBeInTheDocument(); // fiber
      expect(screen.getByText('0mg')).toBeInTheDocument(); // sodium
    });

    it('handles empty breakdown array', () => {
      const noBreakdownResult = {
        ...mockNutritionResult,
        breakdown: []
      };

      render(<ResultsCard {...defaultProps} result={noBreakdownResult} />);

      // Should not show the breakdown table
      expect(screen.queryByText('Detailed Food Breakdown')).not.toBeInTheDocument();
    });

    it('handles missing summary', () => {
      const noSummaryResult = {
        ...mockNutritionResult,
        summary: ''
      };

      render(<ResultsCard {...defaultProps} result={noSummaryResult} />);

      // Should not show the summary section when empty
      expect(screen.queryByText('A slice of homemade apple pie with cinnamon and sugar')).not.toBeInTheDocument();
    });
  });

  describe('Calculations', () => {
    it('calculates macronutrient percentages correctly', () => {
      const testResult = {
        ...mockNutritionResult,
        totalProtein: 10,
        totalCarbs: 20,
        totalFat: 10
      };

      render(<ResultsCard {...defaultProps} result={testResult} />);

      // Total: 40g, Protein: 25%, Carbs: 50%, Fat: 25%
      expect(screen.getByText('25%')).toBeInTheDocument(); // protein and fat
      expect(screen.getByText('50%')).toBeInTheDocument(); // carbs
    });

    it('rounds percentages correctly', () => {
      const testResult = {
        ...mockNutritionResult,
        totalProtein: 3, // 3/10 = 30%
        totalCarbs: 3,   // 3/10 = 30%
        totalFat: 4      // 4/10 = 40%
      };

      render(<ResultsCard {...defaultProps} result={testResult} />);

      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('40%')).toBeInTheDocument();
    });
  });
});
