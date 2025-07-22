import React, { useState, useEffect } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import BreadcrumbsSection from './components/BreadcrumbsSection';
import CalorieForm from './components/CalorieForm';
import ResultsCard from './components/ResultsCard';
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
        // For now, start with empty breadcrumbs
        // Real breadcrumbs will be added when users actually search for food
        setBreadcrumbs([]);
      } catch (error) {
        console.error('Error loading breadcrumbs:', error);
        setBreadcrumbs([]);
      } finally {
        setLoading(false);
      }
    };

    // Load immediately
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

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all search history?')) {
      setBreadcrumbs([]);
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
          totalCalories: data.data.totalCalories || 0,
          totalProtein: data.data.macros?.protein || 0,
          totalCarbs: data.data.macros?.carbs || 0,
          totalFat: data.data.macros?.fat || 0,
          breakdown: data.data.breakdown?.map((item: any) => ({
            food: item.item || 'Unknown food',
            calories: item.calories || 0,
            protein: Math.round((item.calories || 0) * 0.15 / 4), // Estimate protein from calories
            carbs: Math.round((item.calories || 0) * 0.50 / 4), // Estimate carbs from calories
            fat: Math.round((item.calories || 0) * 0.35 / 9), // Estimate fat from calories
            quantity: '1 serving'
          })) || [],
          summary: `Analysis of "${foodText}" shows ${data.data.totalCalories} total calories with ${data.data.servingSize || 'standard serving size'}. Confidence level: ${data.data.confidence || 'medium'}.`,
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
        setBreadcrumbs(prev => [newBreadcrumb, ...prev.slice(0, 9)]); // Keep only 10 recent searches
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

  const handleNewAnalysis = () => {
    setNutritionResult(null);
    setAnalysisError('');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
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
    </div>
  );
};

export default App;
