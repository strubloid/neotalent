import React, { useState, useEffect } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import BreadcrumbsSection from './components/BreadcrumbsSection';
import CalorieForm from './components/CalorieForm';
import ResultsCard from './components/ResultsCard';
import AuthModals from './components/AuthModals';
import RecentSearches from './components/RecentSearches';
import { User, BreadcrumbItem, NutritionResult } from './types';
import { API_ENDPOINTS } from './config/api';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [nutritionResult, setNutritionResult] = useState<NutritionResult | null>(null);
  const [formResetTrigger, setFormResetTrigger] = useState(0); // Add reset trigger for form
  const [currentView, setCurrentView] = useState<'home' | 'recent-searches'>('home'); // Add view state

  // Helper function to clear all analysis-related state
  const clearAnalysisState = () => {
    setNutritionResult(null);
    setAnalysisError('');
    setFormResetTrigger(prev => prev + 1); // Trigger form reset
    setCurrentView('home'); // Reset to home view
  };

  // Navigation handlers
  const handleNavigateToRecentSearches = () => {
    setCurrentView('recent-searches');
    // Clear any displayed nutrition results when navigating to recent searches
    setNutritionResult(null);
    setAnalysisError('');
  };

  const handleNavigateToHome = () => {
    setCurrentView('home');
    // Clear any displayed nutrition results when navigating back to home
    setNutritionResult(null);
    setAnalysisError('');
  };

  // Load initial data and check authentication
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check authentication status first
        console.log('🔍 Frontend: Checking authentication status...');
        const authResponse = await fetch(API_ENDPOINTS.AUTH.STATUS, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (authResponse.ok) {
          const authData = await authResponse.json();
          console.log('🔍 Frontend: Auth response:', authData);
          
          if (authData.success && authData.isAuthenticated && authData.user) {
            // User is authenticated
            console.log('✅ Frontend: User authenticated:', authData.user);
            setUser(authData.user);
            setIsAuthenticated(true);
            
            // Load search history for authenticated user from database
            try {
              const historyResponse = await fetch(API_ENDPOINTS.AUTH.SEARCH_HISTORY, {
                method: 'GET',
                credentials: 'include',
              });
              
              if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                if (historyData.success && historyData.searchHistory) {
                  setBreadcrumbs(historyData.searchHistory);
                } else {
                  setBreadcrumbs([]);
                }
              } else {
                console.error('Failed to load search history from database');
                setBreadcrumbs([]);
              }
            } catch (historyError) {
              console.error('Error loading search history:', historyError);
              setBreadcrumbs([]);
            }
          } else {
            // User is not authenticated - load from session storage
            console.log('❌ Frontend: User not authenticated, loading session history');
            setUser(null);
            setIsAuthenticated(false);
            loadSessionHistory();
          }
        } else {
          // Auth check failed - treat as not authenticated
          console.log('❌ Frontend: Auth check failed, status:', authResponse.status);
          setUser(null);
          setIsAuthenticated(false);
          loadSessionHistory();
        }
      } catch (error) {
        console.error('❌ Frontend: Error checking authentication:', error);
        // Fallback to session storage if auth check fails
        setUser(null);
        setIsAuthenticated(false);
        loadSessionHistory();
      } finally {
        setLoading(false);
      }
    };

    const loadSessionHistory = () => {
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
    };

    initializeApp();
  }, []);

  const handleBreadcrumbClick = (searchId: string) => {
    // Find the breadcrumb item that was clicked
    const clickedBreadcrumb = breadcrumbs.find(b => b.searchId === searchId);
    
    if (clickedBreadcrumb) {
      // If we already have this result stored, display it directly
      if (nutritionResult && nutritionResult.searchId === searchId) {
        // Result is already displayed, just scroll to it if on recent searches page
        if (currentView === 'recent-searches') {
          const resultsElement = document.querySelector('.container.mt-5');
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
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

      // Only navigate to home view if we're currently on the home page
      // If we're on recent searches, stay on that page to show results
      if (currentView === 'home') {
        // Scroll to results after a short delay to allow rendering
        setTimeout(() => {
          const resultsElement = document.querySelector('.container.mt-5');
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all search history?')) {
      if (isAuthenticated) {
        // For authenticated users, clear from database
        try {
          const response = await fetch(API_ENDPOINTS.AUTH.SEARCH_HISTORY, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setBreadcrumbs([]);
            } else {
              console.error('Failed to clear search history:', data.message);
              // Still clear local state for better UX
              setBreadcrumbs([]);
            }
          } else {
            console.error('Failed to clear search history from server, status:', response.status);
            // Still clear local state for better UX
            setBreadcrumbs([]);
          }
        } catch (error) {
          console.error('Error clearing search history from database:', error);
          // Still clear local state for better UX
          setBreadcrumbs([]);
        }
      } else {
        // For non-authenticated users, clear from sessionStorage and local state
        setBreadcrumbs([]);
        try {
          sessionStorage.setItem('neotalent-search-history', JSON.stringify([]));
        } catch (error) {
          console.error('Error clearing session storage:', error);
          // Continue even if sessionStorage fails
        }
      }
    }
  };

  const handleAnalyzeFood = async (foodText: string) => {
    setAnalysisLoading(true);
    setAnalysisError('');
    setNutritionResult(null);
    
    try {
      const response = await fetch(API_ENDPOINTS.CALORIES, {
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
            const response = await fetch(API_ENDPOINTS.AUTH.SEARCH_HISTORY, {
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
              } else {
                console.error('Invalid search history response from server');
                // Fall back to local state update
                setBreadcrumbs(prev => [newBreadcrumb, ...prev.slice(0, 9)]);
              }
            } else {
              console.error('Failed to save search history to database, status:', response.status);
              // If save fails, fall back to local state update
              setBreadcrumbs(prev => [newBreadcrumb, ...prev.slice(0, 9)]);
            }
          } catch (error) {
            console.error('Error saving search history to database:', error);
            // Fall back to local state update
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
            // Continue even if sessionStorage fails - at least we have in-memory state
          }
        }
      } else {
        // Use data.message first (backend now standardized), then fallback to data.error for compatibility
        setAnalysisError(data.message || data.error || 'Analysis failed. Please try again.');
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
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
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
        clearAnalysisState(); // Clear any previous nutrition results and form
        console.log('Login successful:', data.user);
        
        // Transfer session storage search history to database for newly authenticated user
        try {
          const sessionHistory = sessionStorage.getItem('neotalent-search-history');
          let sessionSearches: BreadcrumbItem[] = [];
          
          if (sessionHistory) {
            try {
              const parsedHistory = JSON.parse(sessionHistory);
              sessionSearches = Array.isArray(parsedHistory) ? parsedHistory : [];
            } catch (parseError) {
              console.error('Error parsing session history:', parseError);
              sessionSearches = [];
            }
          }

          // Transfer each session search to database
          for (const search of sessionSearches) {
            try {
              await fetch(API_ENDPOINTS.AUTH.SEARCH_HISTORY, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                  searchId: search.searchId,
                  query: search.query,
                  summary: search.summary
                }),
              });
            } catch (transferError) {
              console.error('Error transferring search to database:', transferError);
              // Continue with other searches even if one fails
            }
          }

          // Clear session storage after successful transfer
          sessionStorage.removeItem('neotalent-search-history');
        } catch (transferError) {
          console.error('Error during session history transfer:', transferError);
        }
        
        // Load complete search history from database (including transferred items)
        try {
          const historyResponse = await fetch(API_ENDPOINTS.AUTH.SEARCH_HISTORY, {
            method: 'GET',
            credentials: 'include',
          });
          
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            if (historyData.success && historyData.searchHistory) {
              setBreadcrumbs(historyData.searchHistory);
            } else {
              setBreadcrumbs([]);
            }
          } else {
            console.error('Failed to load search history after login');
            setBreadcrumbs([]);
          }
        } catch (historyError) {
          console.error('Error loading search history after login:', historyError);
          setBreadcrumbs([]);
        }
      } else {
        // Use data.message first (backend sends this), then fallback to data.error, then generic message
        throw new Error(data.message || data.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleRegister = async (userData: { username: string; password: string; nickname: string }) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
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
        clearAnalysisState(); // Clear any previous nutrition results and form
        console.log('Registration successful:', data.user);
      } else {
        // Use data.message first (backend sends this), then fallback to data.error, then generic message
        throw new Error(data.message || data.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const handleNewAnalysis = () => {
    setNutritionResult(null);
    setAnalysisError('');
    // Only navigate to home if we're not already on recent searches
    if (currentView !== 'recent-searches') {
      setCurrentView('home');
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API to destroy session on server
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
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
    clearAnalysisState(); // Clear nutrition results, errors, and form
    
    // Initialize fresh anonymous session storage
    try {
      sessionStorage.removeItem('neotalent-search-history');
      // Initialize empty array for new anonymous session
      sessionStorage.setItem('neotalent-search-history', JSON.stringify([]));
    } catch (error) {
      console.error('Error initializing session storage during logout:', error);
    }
    
    alert('Logged out successfully');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      setUser(null);
      setIsAuthenticated(false);
      setBreadcrumbs([]); // Clear search history
      clearAnalysisState(); // Clear nutrition results, errors, and form
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
        {currentView === 'home' ? (
          <>
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
                      <button 
                        className="btn btn-outline-primary btn-lg"
                        onClick={handleNavigateToRecentSearches}
                      >
                        <i className="bi bi-clock-history me-2"></i>
                        Recent Searches
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
              resetTrigger={formResetTrigger}
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
          </>
        ) : (
          /* Recent Searches View */
          <RecentSearches
            breadcrumbs={breadcrumbs}
            onSearchClick={handleBreadcrumbClick}
            onClearHistory={handleClearHistory}
            onBackToHome={handleNavigateToHome}
            isAuthenticated={isAuthenticated}
            nutritionResult={nutritionResult}
            onNewAnalysis={handleNewAnalysis}
          />
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
