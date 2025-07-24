import React, { Component } from 'react';
import { BreadcrumbItem, NutritionResult, RecentSearchesProps } from '../interfaces';
import ResultsCard from './ResultsCard';

class RecentSearches extends Component<RecentSearchesProps> {
  formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  override render() {
    const { 
      breadcrumbs, 
      onSearchClick, 
      onClearHistory, 
      onBackToHome,
      isAuthenticated,
      nutritionResult,
      onNewAnalysis
    } = this.props;

    return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-clock-history me-2 text-primary"></i>
                Recent Searches
              </h2>
              <p className="text-muted mb-0">
                {isAuthenticated 
                  ? "Your saved search history across all sessions" 
                  : "Your search history for this browser session"
                }
              </p>
            </div>
            <button 
              className="btn btn-outline-primary"
              onClick={onBackToHome}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Home
            </button>
          </div>

          {/* Search History Content */}
          {breadcrumbs.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-clock-history text-muted" style={{ fontSize: '4rem' }}></i>
              </div>
              <h4 className="text-muted">No Search History</h4>
              <p className="text-muted">
                Your recent food searches will appear here for quick access.
              </p>
              <button 
                className="btn btn-primary mt-3"
                onClick={onBackToHome}
              >
                <i className="bi bi-search me-2"></i>
                Start Analyzing Food
              </button>
            </div>
          ) : (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>
                  <strong>{breadcrumbs.length}</strong> {breadcrumbs.length === 1 ? 'search' : 'searches'} found
                </span>
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={onClearHistory}
                >
                  <i className="bi bi-trash me-1"></i>
                  Clear All
                </button>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {breadcrumbs.map((breadcrumb, index) => (
                    <div 
                      key={breadcrumb.searchId}
                      className="list-group-item list-group-item-action cursor-pointer hover-bg-light"
                      onClick={() => onSearchClick(breadcrumb.searchId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <span className="badge bg-primary me-2">#{breadcrumbs.length - index}</span>
                            <h6 className="mb-0 text-primary fw-bold">
                              {breadcrumb.query}
                            </h6>
                          </div>
                          <p className="mb-1 text-muted">
                            <i className="bi bi-bar-chart me-1"></i>
                            {breadcrumb.summary}
                          </p>
                          <small className="text-muted">
                            <i className="bi bi-calendar me-1"></i>
                            {this.formatDate(breadcrumb.timestamp)}
                          </small>
                        </div>
                        <div className="ms-3">
                          <i className="bi bi-arrow-right text-muted"></i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="row mt-4">
            <div className="col-md-6">
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-title">
                    <i className="bi bi-info-circle me-2 text-info"></i>
                    About Search History
                  </h6>
                  <p className="card-text small mb-0">
                    {isAuthenticated 
                      ? "Your search history is saved to your account and synced across devices. You can access it anytime you're logged in."
                      : "Your search history is stored locally in this browser session. Create an account to save your history permanently."
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-title">
                    <i className="bi bi-lightning me-2 text-warning"></i>
                    Quick Access
                  </h6>
                  <p className="card-text small mb-0">
                    Click on any search result to instantly view the nutritional analysis again. 
                    Perfect for tracking repeated meals or comparing different foods.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section - Show nutrition result if available */}
          {nutritionResult && onNewAnalysis && (
            <div className="mt-5">
              <ResultsCard
                result={nutritionResult}
                onNewAnalysis={onNewAnalysis}
              />
            </div>
          )}
        </div>
      </div>
    </div>
    );
  }
}

export default RecentSearches;
