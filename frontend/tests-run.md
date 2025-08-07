# Frontend Testing Guide

## Overview
This frontend uses **Jest** and **React Testing Library** for comprehensive unit and integration testing. All tests are written in TypeScript and follow modern React testing best practices.

## 🚀 Quick Start

### Running Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD (no watch, exits after completion)
npm run test:ci
```

## 📁 Test Structure
```
src/
├── components/
│   ├── AuthModals/
│   │   ├── AuthModals.tsx
│   │   ├── AuthModals.test.tsx     # Component tests
│   │   └── index.ts
│   ├── Navigation/
│   │   ├── Navigation.tsx
│   │   ├── Navigation.test.tsx     # Component tests
│   │   └── index.ts
│   └── ... (other components)
├── setupTests.ts                   # Global test setup
└── react-app-env.d.ts             # Type definitions
```

## 🧪 Test Types

### 1. Component Unit Tests
Test individual components in isolation:

```typescript
// Example: Navigation.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from './Navigation';

describe('Navigation Component', () => {
  const mockProps = {
    user: null,
    isAuthenticated: false,
    onLogout: jest.fn(),
    onDeleteAccount: jest.fn(),
    onNavigateToRecentSearches: jest.fn(),
    onNavigateToHome: jest.fn(),
    currentView: 'home' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders navigation brand correctly', () => {
    render(<Navigation {...mockProps} />);
    
    expect(screen.getByText('Calorie Tracker')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calorie tracker/i })).toBeInTheDocument();
  });

  it('shows login button when user is not authenticated', () => {
    render(<Navigation {...mockProps} />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('shows user info when authenticated', () => {
    const authenticatedProps = {
      ...mockProps,
      user: { id: '1', username: 'testuser', nickname: 'Test User' },
      isAuthenticated: true
    };

    render(<Navigation {...authenticatedProps} />);
    
    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls navigation handlers when buttons are clicked', () => {
    render(<Navigation {...mockProps} />);
    
    fireEvent.click(screen.getByText('Home'));
    expect(mockProps.onNavigateToHome).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Form Component Tests
Test form interactions and validation:

```typescript
// Example: CalorieForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalorieForm from './CalorieForm';

describe('CalorieForm Component', () => {
  const mockProps = {
    onAnalyze: jest.fn(),
    isLoading: false,
    error: '',
    resetTrigger: 0
  };

  it('submits form with food description', async () => {
    const user = userEvent.setup();
    render(<CalorieForm {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText(/describe the food/i);
    const submitButton = screen.getByText('Analyze Nutrition');
    
    await user.type(textarea, 'chicken breast with rice');
    await user.click(submitButton);
    
    expect(mockProps.onAnalyze).toHaveBeenCalledWith('chicken breast with rice');
  });

  it('prevents submission with empty input', async () => {
    const user = userEvent.setup();
    render(<CalorieForm {...mockProps} />);
    
    const submitButton = screen.getByText('Analyze Nutrition');
    await user.click(submitButton);
    
    expect(mockProps.onAnalyze).not.toHaveBeenCalled();
  });

  it('shows loading state correctly', () => {
    render(<CalorieForm {...mockProps} isLoading={true} />);
    
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays error messages', () => {
    render(<CalorieForm {...mockProps} error="Network error occurred" />);
    
    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
  });
});
```

### 3. Modal Component Tests
Test modal interactions and state changes:

```typescript
// Example: AuthModals.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthModals from './AuthModals';

describe('AuthModals Component', () => {
  const mockProps = {
    onLogin: jest.fn(),
    onRegister: jest.fn()
  };

  beforeEach(() => {
    // Mock Bootstrap modal methods
    global.bootstrap = {
      Modal: {
        getInstance: jest.fn(() => ({
          hide: jest.fn()
        }))
      }
    };
  });

  it('handles login form submission', async () => {
    const user = userEvent.setup();
    render(<AuthModals {...mockProps} />);
    
    // Open login modal
    fireEvent.click(screen.getByText('Login'));
    
    // Fill form
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockProps.onLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });
  });

  it('validates registration form', async () => {
    const user = userEvent.setup();
    render(<AuthModals {...mockProps} />);
    
    // Open register modal
    fireEvent.click(screen.getByText('Register'));
    
    // Try to submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });
  });
});
```

## 🔧 Testing Utilities

### Custom Test Helpers
```typescript
// src/test-utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock API responses
export const mockApiResponse = (data: any, success = true) => {
  return Promise.resolve({
    ok: success,
    json: () => Promise.resolve({
      success,
      data,
      timestamp: new Date().toISOString()
    })
  });
};

// Mock user object
export const mockUser = {
  id: '123',
  username: 'testuser',
  nickname: 'Test User',
  createdAt: new Date().toISOString()
};

// Mock nutrition result
export const mockNutritionResult = {
  searchId: 'search-123',
  query: 'chicken breast',
  totalCalories: 300,
  totalProtein: 55,
  totalCarbs: 0,
  totalFat: 7,
  breakdown: [
    {
      food: 'chicken breast',
      calories: 300,
      protein: 55,
      carbs: 0,
      fat: 7,
      quantity: '200g'
    }
  ],
  summary: 'Total: 300 calories - Chicken breast',
  timestamp: new Date().toISOString()
};
```

### Mocking Fetch API
```typescript
// In test files
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Mock successful API call
(fetch as jest.Mock).mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({
    success: true,
    data: mockNutritionResult
  })
});

// Mock failed API call
(fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
```

## 📊 Code Coverage

### Viewing Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# Coverage files are generated in:
coverage/
├── lcov-report/
│   └── index.html          # Open this in browser
├── lcov.info               # For CI/CD systems
└── coverage-final.json     # Raw coverage data
```

### Coverage Thresholds
The project maintains high code coverage standards:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

## 🚨 Common Testing Patterns

### Testing Async Operations
```typescript
it('handles API calls correctly', async () => {
  (fetch as jest.Mock).mockResolvedValue(mockApiResponse(mockNutritionResult));
  
  render(<App />);
  
  // Trigger API call
  fireEvent.change(screen.getByRole('textbox'), { 
    target: { value: 'chicken breast' } 
  });
  fireEvent.click(screen.getByText('Analyze Nutrition'));
  
  // Wait for async operation
  await waitFor(() => {
    expect(screen.getByText('300 calories')).toBeInTheDocument();
  });
});
```

### Testing Component State Changes
```typescript
it('updates state when form is submitted', async () => {
  render(<App />);
  
  // Initial state
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  
  // Trigger state change
  fireEvent.click(screen.getByText('Analyze Nutrition'));
  
  // Check loading state
  expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  
  // Wait for completion
  await waitFor(() => {
    expect(screen.queryByText('Analyzing...')).not.toBeInTheDocument();
  });
});
```

### Testing Error Handling
```typescript
it('displays error messages correctly', async () => {
  (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
  
  render(<App />);
  
  fireEvent.click(screen.getByText('Analyze Nutrition'));
  
  await waitFor(() => {
    expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
  });
});
```

## 🎯 Best Practices

### 1. Test Behavior, Not Implementation
```typescript
// ❌ Bad - testing implementation details
expect(component.state.isLoading).toBe(true);

// ✅ Good - testing user-visible behavior
expect(screen.getByText('Loading...')).toBeInTheDocument();
```

### 2. Use Semantic Queries
```typescript
// ❌ Bad - fragile to changes
screen.getByTestId('submit-button');

// ✅ Good - tests accessibility too
screen.getByRole('button', { name: /submit/i });
```

### 3. Clean Up After Tests
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  cleanup(); // Provided by @testing-library/react
});
```

### 4. Test Edge Cases
```typescript
describe('CalorieForm edge cases', () => {
  it('handles very long food descriptions', async () => {
    const longText = 'a'.repeat(1000);
    // Test behavior with long input
  });

  it('handles special characters in input', async () => {
    const specialText = '<script>alert("xss")</script>';
    // Test XSS prevention
  });
});
```

## 🔍 Debugging Tests

### Running Specific Tests
```bash
# Run tests for specific component
npm test Navigation

# Run tests matching pattern
npm test -- --testNamePattern="login"

# Run tests in specific file
npm test -- AuthModals.test.tsx

# Run tests with verbose output
npm test -- --verbose
```

### Debug Mode
```bash
# Run single test file in debug mode
npm test -- --no-watch --runInBand AuthModals.test.tsx
```

### Using Console in Tests
```typescript
it('debugs test data', () => {
  render(<Component />);
  
  // Debug rendered output
  screen.debug();
  
  // Debug specific element
  screen.debug(screen.getByRole('button'));
});
```

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Frontend Tests
  run: |
    cd frontend
    npm ci
    npm run test:ci
    npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./frontend/coverage/lcov.info
```

### Test Scripts Summary
- `npm test` - Interactive test runner
- `npm run test:ci` - Single run for CI/CD
- `npm run test:coverage` - Generate coverage report
- `npm run type-check` - TypeScript validation

---

## 📋 Testing Checklist

When adding new components or features:

- [ ] Write unit tests for component rendering
- [ ] Test all user interactions (clicks, form submissions)
- [ ] Test different prop combinations
- [ ] Test error states and edge cases
- [ ] Test async operations and loading states
- [ ] Ensure accessibility with semantic queries
- [ ] Maintain code coverage above thresholds
- [ ] Update test documentation if needed

---

This testing setup ensures reliable, maintainable code with confidence in deployments and feature additions.
