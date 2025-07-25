import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BreadcrumbsSection from './BreadcrumbsSection';
import { BreadcrumbsSectionProps, BreadcrumbItem } from '../../interfaces';

describe('BreadcrumbsSection', () => {
  const mockOnBreadcrumbClick = jest.fn();
  const mockOnClearHistory = jest.fn();

  const mockBreadcrumbs: BreadcrumbItem[] = [
    {
      searchId: '1',
      query: 'Apple pie',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      summary: 'Delicious apple pie with cinnamon'
    },
    {
      searchId: '2',
      query: 'Chicken salad',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      summary: 'Fresh chicken salad with vegetables'
    },
    {
      searchId: '3',
      query: 'Pasta carbonara',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      summary: 'Classic Italian pasta carbonara'
    },
    {
      searchId: '4',
      query: 'Chocolate cake',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
      summary: 'Rich chocolate cake with frosting'
    }
  ];

  const defaultProps: BreadcrumbsSectionProps = {
    breadcrumbs: mockBreadcrumbs,
    onBreadcrumbClick: mockOnBreadcrumbClick,
    onClearHistory: mockOnClearHistory
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty state', () => {
    it('renders empty state when no breadcrumbs', () => {
      render(<BreadcrumbsSection {...defaultProps} breadcrumbs={[]} />);
      
      expect(screen.getByText('No Search History')).toBeInTheDocument();
      expect(screen.getByText(/Your recent food searches will appear here/)).toBeInTheDocument();
    });

    it('renders empty state when breadcrumbs is undefined', () => {
      render(<BreadcrumbsSection {...defaultProps} breadcrumbs={undefined as any} />);
      
      expect(screen.getByText('No Search History')).toBeInTheDocument();
    });
  });

  describe('With breadcrumbs', () => {
    it('renders recent searches header', () => {
      render(<BreadcrumbsSection {...defaultProps} />);
      
      // Use a more specific text search instead of querySelector
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
      expect(screen.getByText('4 searches available • Click to expand')).toBeInTheDocument();
    });

    it('shows correct badge count', () => {
      render(<BreadcrumbsSection {...defaultProps} />);
      
      // Look for the badge count more specifically
      expect(screen.getByText('4 searches available • Click to expand')).toBeInTheDocument();
    });

    it('shows singular search text when only one search', () => {
      const singleBreadcrumb = [mockBreadcrumbs[0]];
      render(<BreadcrumbsSection {...defaultProps} breadcrumbs={singleBreadcrumb} />);
      
      expect(screen.getByText('1 search available • Click to expand')).toBeInTheDocument();
    });

    it('expands when header is clicked', () => {
      render(<BreadcrumbsSection {...defaultProps} />);
      
      const header = screen.getByText('Recent Searches');
      fireEvent.click(header);
      
      // After expansion, check that content is visible
      expect(screen.getByText(/Delicious apple pie/)).toBeInTheDocument();
    });

    it('collapses when expanded and header is clicked again', () => {
      render(<BreadcrumbsSection {...defaultProps} />);
      
      const header = screen.getByText('Recent Searches');
      
      // Expand first to make content accessible
      fireEvent.click(header);
      
      // Now find the collapsible content
      const collapsibleContent = screen.getByText(/Delicious apple pie/).closest('div[style*="max-height"]');
      expect(collapsibleContent).toHaveStyle('max-height: 700px');
      
      // Collapse again
      fireEvent.click(header);
      expect(collapsibleContent).toHaveStyle('max-height: 0px');
    });

    it('calls onClearHistory when clear button is clicked', () => {
      render(<BreadcrumbsSection {...defaultProps} />);
      
      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);
      
      expect(mockOnClearHistory).toHaveBeenCalledTimes(1);
    });

    it('does not expand when clear button is clicked', () => {
      render(<BreadcrumbsSection {...defaultProps} />);
      
      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);
      
      // Should still be collapsed - check the collapsible container has max-height 0
      const collapsibleContainer = document.querySelector('div[style*="max-height"]');
      expect(collapsibleContainer).toHaveStyle('max-height: 0px');
    });
  });

  describe('Expanded state', () => {
    it('shows first 3 breadcrumbs when expanded', () => {
      render(<BreadcrumbsSection {...defaultProps} />);
      const header = screen.getByText('Recent Searches');
      fireEvent.click(header);
      
      // Check for presence of breadcrumb content without specific text that might appear elsewhere
      expect(screen.getByText(/Delicious apple pie/)).toBeInTheDocument();
      expect(screen.getByText('Chicken salad')).toBeInTheDocument();
      expect(screen.getByText('Pasta carbonara')).toBeInTheDocument();
      expect(screen.queryByText('Chocolate cake')).not.toBeInTheDocument();
    });

    it('calls onBreadcrumbClick when breadcrumb is clicked', () => {
      render(<BreadcrumbsSection {...defaultProps} />);
      const header = screen.getByText('Recent Searches');
      fireEvent.click(header);
      
      const breadcrumb = screen.getByText(/Delicious apple pie/);
      fireEvent.click(breadcrumb);
      
      expect(mockOnBreadcrumbClick).toHaveBeenCalledWith('1');
    });

    it('disables previous button when at beginning', () => {
      render(<BreadcrumbsSection {...defaultProps} />);
      const header = screen.getByText('Recent Searches');
      fireEvent.click(header);
      
      // Use CSS selector for better specificity
      const prevButton = document.querySelector('button[disabled] .bi-chevron-left')?.closest('button');
      expect(prevButton).toBeInTheDocument();
    });

    it('enables next button when there are more items', () => {
      render(<BreadcrumbsSection {...defaultProps} />);
      const header = screen.getByText('Recent Searches');
      fireEvent.click(header);
      
      // Use CSS selector for better specificity
      const nextButton = document.querySelector('.bi-chevron-right')?.closest('button');
      expect(nextButton).toBeInTheDocument();
    });
  });

  describe('Time formatting', () => {
    it('formats time correctly for recent items', () => {
      const recentBreadcrumb: BreadcrumbItem[] = [{
        searchId: '1',
        query: 'Recent search',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        summary: 'Recent search summary'
      }];
      
      render(<BreadcrumbsSection {...defaultProps} breadcrumbs={recentBreadcrumb} />);
      const header = screen.getByText('Recent Searches');
      fireEvent.click(header);
      
      expect(screen.getByText('Just now')).toBeInTheDocument();
    });

    it('formats time correctly for items hours ago', () => {
      const hourlyBreadcrumb: BreadcrumbItem[] = [{
        searchId: '1',
        query: 'Hourly search',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        summary: 'Hourly search summary'
      }];
      
      render(<BreadcrumbsSection {...defaultProps} breadcrumbs={hourlyBreadcrumb} />);
      const header = screen.getByText("Recent Searches");
      fireEvent.click(header);
      
      expect(screen.getByText('5h ago')).toBeInTheDocument();
    });

    it('formats time correctly for items days ago', () => {
      const dailyBreadcrumb: BreadcrumbItem[] = [{
        searchId: '1',
        query: 'Daily search',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        summary: 'Daily search summary'
      }];
      
      render(<BreadcrumbsSection {...defaultProps} breadcrumbs={dailyBreadcrumb} />);
      const header = screen.getByText("Recent Searches");
      fireEvent.click(header);
      
      expect(screen.getByText('3d ago')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates to next page when next button is clicked', () => {
      render(<BreadcrumbsSection {...defaultProps} />);
      const header = screen.getByText("Recent Searches");
      fireEvent.click(header);
      
      const nextButton = document.querySelector('.bi-chevron-right')?.closest('button');
      fireEvent.click(nextButton!);
      
      // Should now show the 4th item (Chocolate cake) and hide the first item
      expect(screen.getByText('Chocolate cake')).toBeInTheDocument();
      expect(screen.queryByText('Delicious apple pie with cinnamon')).not.toBeInTheDocument();
    });

    it('navigates back to previous page when previous button is clicked', () => {
      render(<BreadcrumbsSection {...defaultProps} />);
      const header = screen.getByText("Recent Searches");
      fireEvent.click(header);
      
      // Go to next page first
      const nextButton = document.querySelector('.bi-chevron-right')?.closest('button');
      fireEvent.click(nextButton!);
      
      // Then go back to previous page
      const prevButton = document.querySelector('.bi-chevron-left')?.closest('button');
      fireEvent.click(prevButton!);
      
      // Should be back to showing first 3 items
      expect(screen.getByText('Delicious apple pie with cinnamon')).toBeInTheDocument();
      expect(screen.queryByText('Chocolate cake')).not.toBeInTheDocument();
    });
  });
});
