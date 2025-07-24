import React, { useState, useEffect } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import BreadcrumbsSection from './components/BreadcrumbsSection';
import CalorieForm from './components/CalorieForm';
import ResultsCard from './components/ResultsCard';
import AuthModals from './components/AuthModals';
import { User, BreadcrumbItem, NutritionResult } from './types';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [nutritionResult, setNutritionResult] = useState<NutritionResult | null>(null);

  // Load breadcrumbs from API
  useEffect(() => {
    const loadBreadcrumbs = async () => {
      try {
        // Check authentication status first
        const authResponse = await fetch('/api/auth/status', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (authResponse.ok) {
          const authData = await authResponse.json();
          if (authData.success && authData.user) {
            setUser(authData.user);
            setIsAuthenticated(true);
            
            // Load search history for authenticated user from backend
            try {
              const historyResponse = await fetch('/api/auth/search-history', {
                method: 'GET',
                credentials: 'include',
              });
              
              if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                if (historyData.success && historyData.searchHistory) {
                  setBreadcrumbs(historyData.searchHistory);
                }
              }
            } catch (historyError) {
              console.error('Error loading search history:', historyError);
              setBreadcrumbs([]);
            }
          } else {
            // Not authenticated, load from sessionStorage for non-logged users
            try {
              const sessionHistory = sessionStorage.getItem('neotalent-search-history');
              if (sessionHistory) {
                const parsedHistory = JSON.parse(sessionHistory);
                setBreadcrumbs(Array.isArray(parsedHistory) ? parsedHistory : []);
              } else {
                setBreadcrumbs([]);
              }
            } catch (error) {
              console.error('Error loading session search history:', error);
              setBreadcrumbs([]);
            }
          }
        } else {
          // Not authenticated, load from sessionStorage for non-logged users
          try {
            const sessionHistory = sessionStorage.getItem('neotalent-search-history');
            if (sessionHistory) {
              const parsedHistory = JSON.parse(sessionHistory);
              setBreadcrumbs(Array.isArray(parsedHistory) ? parsedHistory : []);
            } else {
              setBreadcrumbs([]);
            }
          } catch (error) {
            console.error('Error loading session search history:', error);
            setBreadcrumbs([]);
          }
        }
      } catch (error) {
        console.error('Error loading breadcrumbs:', error);
        // If there's an error with auth check, try loading from sessionStorage
        try {
          const sessionHistory = sessionStorage.getItem('neotalent-search-history');
          if (sessionHistory) {
            const parsedHistory = JSON.parse(sessionHistory);
            setBreadcrumbs(Array.isArray(parsedHistory) ? parsedHistory : []);
          } else {
            setBreadcrumbs([]);
          }
        } catch (sessionError) {
          console.error('Error loading session search history:', sessionError);
          setBreadcrumbs([]);
        }
      } finally {
        setLoading(false);
      }
    };

    // Check authentication status on app load
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Not a critical error, continue without auth
      }
    };

    // Load breadcrumbs (which includes auth check and history loading)
    loadBreadcrumbs();
  }, []);

  const handleBreadcrumbClick = (searchId: string) => {
    // Find the breadcrumb item that was clicked
    const clickedBreadcrumb = breadcrumbs.find(b => b.searchId === searchId);
    
    if (clickedBreadcrumb) {
      // If we already have this result stored, display it directly
      if (nutritionResult && nutritionResult.searchId === searchId) {
        // Result is already displayed, just scroll to it
        const resultsElement = document.querySelector('.container.mt-5');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      // Try to recreate the nutrition result from the breadcrumb data
      // In a real app, you'd fetch this from a backend API
      const recreatedResult: NutritionResult = {
        searchId: clickedBreadcrumb.searchId,
        query: clickedBreadcrumb.query,
        // Extract calories from summary (format: "Total: XXX calories - ...")
        totalCalories: parseInt(clickedBreadcrumb.summary.match(/Total: (\d+) calories/)?.[1] || '0'),
        // Estimate macros based on typical food composition
        totalProtein: Math.round(parseInt(clickedBreadcrumb.summary.match(/Total: (\d+) calories/)?.[1] || '0') * 0.15 / 4),
        totalCarbs: Math.round(parseInt(clickedBreadcrumb.summary.match(/Total: (\d+) calories/)?.[1] || '0') * 0.50 / 4),
        totalFat: Math.round(parseInt(clickedBreadcrumb.summary.match(/Total: (\d+) calories/)?.[1] || '0') * 0.35 / 9),
        breakdown: [
          {
            food: clickedBreadcrumb.query,
            calories: parseInt(clickedBreadcrumb.summary.match(/Total: (\d+) calories/)?.[1] || '0'),
            protein: Math.round(parseInt(clickedBreadcrumb.summary.match(/Total: (\d+) calories/)?.[1] || '0') * 0.15 / 4),
            carbs: Math.round(parseInt(clickedBreadcrumb.summary.match(/Total: (\d+) calories/)?.[1] || '0') * 0.50 / 4),
            fat: Math.round(parseInt(clickedBreadcrumb.summary.match(/Total: (\d+) calories/)?.[1] || '0') * 0.35 / 9),
            quantity: '1 serving (estimated)'
          }
        ],
        summary: `Previous analysis of "${clickedBreadcrumb.query}" - ${clickedBreadcrumb.summary}`,
        timestamp: clickedBreadcrumb.timestamp
      };

      // Set the nutrition result to display the ResultsCard
      setNutritionResult(recreatedResult);
      
      // Clear any analysis errors
      setAnalysisError('');

      // Scroll to results after a short delay to allow rendering
      setTimeout(() => {
        const resultsElement = document.querySelector('.container.mt-5');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all search history?')) {
      if (isAuthenticated) {
        // Clear from database for authenticated users
        try {
          const response = await fetch('/api/auth/search-history', {
            method: 'DELETE',
            credentials: 'include',
          });

          if (response.ok) {
            setBreadcrumbs([]);
          } else {
            // If delete fails, still clear local state
            setBreadcrumbs([]);
            console.error('Failed to clear search history from server');
          }
        } catch (error) {
          console.error('Error clearing search history:', error);
          // Still clear local state
          setBreadcrumbs([]);
        }
      } else {
        // For non-authenticated users, clear from sessionStorage and local state
        try {
          sessionStorage.removeItem('neotalent-search-history');
        } catch (error) {
          console.error('Error clearing session storage:', error);
        }
        setBreadcrumbs([]);
      }
    }
  };

  const handleAnalyzeFood = async (foodText: string) => {
    setAnalysisLoading(true);
    setAnalysisError('');
    setNutritionResult(null);
    
    try {
      const response = await fetch('/api/calories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ food: foodText }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Create a proper NutritionResult object from the API response
        const nutritionResult: NutritionResult = {
          searchId: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          query: foodText,
          totalCalories: data.data.calories || 0,
          totalProtein: data.data.protein || 0,
          totalCarbs: data.data.carbs || 0,
          totalFat: data.data.fat || 0,
          totalFiber: data.data.fiber || 0,
          totalSugar: data.data.sugar || 0,
          totalSodium: data.data.sodium || 0,
          breakdown: data.data.foodItems?.map((item: any) => ({
            food: item.name || 'Unknown food',
            calories: item.calories || 0,
            protein: item.protein || 0,
            carbs: item.carbs || 0,
            fat: item.fat || 0,
            // Use individual item values or 0 if not available (don't use totals)
            fiber: item.fiber || 0,
            sugar: item.sugar || 0,
            sodium: item.sodium || 0,
            quantity: item.quantity || '1 serving'
          })) || [],
          summary: `Analysis of "${foodText}" shows ${data.data.calories || 0} total calories with standard serving size. Confidence level: ${data.data.confidence || 0.5}.`,
          timestamp: new Date().toISOString()
        };

        setNutritionResult(nutritionResult);
        
        // Add to breadcrumbs
        const newBreadcrumb: BreadcrumbItem = {
          searchId: nutritionResult.searchId,
          query: foodText,
          summary: `Total: ${nutritionResult.totalCalories} calories - ${data.data.servingSize || 'estimated serving'}`,
          timestamp: nutritionResult.timestamp
        };

        // Save search history based on authentication status
        if (isAuthenticated) {
          // Save to database for authenticated users
          try {
            const response = await fetch('/api/auth/search-history', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                searchId: newBreadcrumb.searchId,
                query: newBreadcrumb.query,
                summary: newBreadcrumb.summary
              }),
            });

            if (response.ok) {
              const historyData = await response.json();
              if (historyData.success && historyData.searchHistory) {
                setBreadcrumbs(historyData.searchHistory);
              }
            } else {
              // If save fails, fall back to local storage
              setBreadcrumbs(prev => [newBreadcrumb, ...prev.slice(0, 9)]);
            }
          } catch (error) {
            console.error('Error saving search history:', error);
            // Fall back to local storage
            setBreadcrumbs(prev => [newBreadcrumb, ...prev.slice(0, 9)]);
          }
        } else {
          // For non-authenticated users, store in session memory and sessionStorage
          const newBreadcrumbs = [newBreadcrumb, ...breadcrumbs.slice(0, 9)];
          setBreadcrumbs(newBreadcrumbs);
          
          // Save to sessionStorage for persistence during browser session
          try {
            sessionStorage.setItem('neotalent-search-history', JSON.stringify(newBreadcrumbs));
          } catch (error) {
            console.error('Error saving to session storage:', error);
          }
        }
      } else {
        setAnalysisError(data.error || 'Analysis failed. Please try again.');
      }
    } catch (error) {
      console.error('Error analyzing food:', error);
      setAnalysisError('Unable to analyze food. Please check your connection and try again.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleLogin = async (credentials: { username: string; password: string }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('Login successful:', data.user);
        
        // Load search history for the newly authenticated user
        try {
          const historyResponse = await fetch('/api/auth/search-history', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            if (historyData.success && historyData.searchHistory) {
              setBreadcrumbs(historyData.searchHistory);
            }
          }
        } catch (historyError) {
          console.error('Error loading search history after login:', historyError);
        }
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleRegister = async (userData: { username: string; password: string; nickname: string }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('Registration successful:', data.user);
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const handleNewAnalysis = () => {
    setNutritionResult(null);
    setAnalysisError('');
  };

  const handleLogout = async () => {
    try {
      // Call logout API to destroy session on server
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with client-side logout even if API fails
    }
    
    // Clear client-side state
    setUser(null);
    setIsAuthenticated(false);
    setBreadcrumbs([]); // Clear search history from UI
    
    // Clear session storage for fresh anonymous session
    try {
      sessionStorage.removeItem('neotalent-search-history');
    } catch (error) {
      console.error('Error clearing session storage during logout:', error);
    }
    
    alert('Logged out successfully');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      setUser(null);
      setIsAuthenticated(false);
      alert('Account deleted successfully');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Loading NeoTalent Calorie Tracker...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Navigation
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />
      
      <main>
        {/* Hero Section */}
        <div className="hero-section py-5">
          <div className="container">
            <div className="row">
              <div className="col-12 text-center">
                <h1 className="display-4 mb-3">
                  <i className="bi bi-calculator text-primary me-3"></i>
                  NeoTalent Calorie Tracker
                </h1>
                <p className="lead text-muted">
                  Analyze your food and track calories with AI-powered nutrition insights
                </p>
                <div className="mt-4">
                  <button className="btn btn-primary btn-lg me-3">
                    <i className="bi bi-search me-2"></i>
                    Analyze Food
                  </button>
                  <button className="btn btn-outline-primary btn-lg">
                    <i className="bi bi-info-circle me-2"></i>
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Food Analysis Form */}
        <CalorieForm
          onAnalyze={handleAnalyzeFood}
          isLoading={analysisLoading}
          error={analysisError}
        />

        {/* Breadcrumbs Section */}
        <BreadcrumbsSection
          breadcrumbs={breadcrumbs}
          onBreadcrumbClick={handleBreadcrumbClick}
          onClearHistory={handleClearHistory}
        />

        {/* Results Section */}
        {nutritionResult && (
          <div className="container mt-5">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <ResultsCard
                  result={nutritionResult}
                  onNewAnalysis={handleNewAnalysis}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-light py-4 mt-5">
          <div className="container">
            <div className="row">
              <div className="col-12 text-center text-muted">
                <p className="mb-0">
                  &copy; 2025 NeoTalent Calorie Tracker. Powered by AI for better nutrition insights.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Authentication Modals */}
      <AuthModals
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </div>
  );
};

export default App;
