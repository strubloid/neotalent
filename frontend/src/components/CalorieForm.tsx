import React, { useState } from 'react';

interface CalorieFormProps {
  onAnalyze: (foodText: string) => void;
  isLoading: boolean;
  error: string;
}

const CalorieForm = ({ onAnalyze, isLoading, error }: CalorieFormProps) => {
  const [foodText, setFoodText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (foodText.trim()) {
      onAnalyze(foodText.trim());
    }
  };

  const handleClear = () => {
    setFoodText('');
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-search me-2"></i>
                Analyze Your Food
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="foodInput" className="form-label">
                    Describe your food or meal:
                  </label>
                  <textarea
                    id="foodInput"
                    className={`form-control ${error ? 'is-invalid' : ''}`}
                    rows={4}
                    placeholder="e.g., 2 slices of whole wheat toast with avocado and a poached egg"
                    value={foodText}
                    onChange={(e) => setFoodText(e.target.value)}
                    disabled={isLoading}
                    maxLength={500}
                  />
                  <div className="form-text">
                    Be as specific as possible for better accuracy. 
                    {foodText.length > 0 && (
                      <span className="float-end">
                        {foodText.length}/500 characters
                      </span>
                    )}
                  </div>
                  {error && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {error}
                    </div>
                  )}
                </div>
                
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary flex-grow-1"
                    disabled={isLoading || !foodText.trim()}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-calculator me-2"></i>
                        Analyze Calories
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleClear}
                    disabled={isLoading || !foodText.trim()}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Clear
                  </button>
                </div>
              </form>
              
              <div className="mt-3">
                <small className="text-muted">
                  <i className="bi bi-lightbulb me-1"></i>
                  <strong>Tips:</strong> Include portion sizes, cooking methods, and ingredients for the most accurate results.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalorieForm;
