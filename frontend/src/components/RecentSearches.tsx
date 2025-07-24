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
            <div className="text-center py-5" style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '15px',
              border: '1px solid #dee2e6'
            }}>
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
            <div className="card border-0" style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '15px',
              border: '1px solid #dee2e6'
            }}>
              <div className="card-header d-flex justify-content-between align-items-center border-0" style={{
                background: 'linear-gradient(90deg, #6c757d 0%, #495057 100%)',
                color: 'white',
                borderRadius: '15px 15px 0 0'
              }}>
                <span>
                  <i className="bi bi-collection me-2"></i>
                  <strong>{breadcrumbs.length}</strong> {breadcrumbs.length === 1 ? 'search' : 'searches'} found
                </span>
                <button 
                  className="btn btn-sm btn-outline-light"
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
                      className="list-group-item list-group-item-action cursor-pointer"
                      onClick={() => onSearchClick(breadcrumb.searchId)}
                      style={{ 
                        cursor: 'pointer',
                        border: 'none',
                        background: index % 2 === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0,123,255,0.1)';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)';
                        e.currentTarget.style.transform = '';
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start p-3">
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
                        <div className="ms-3 d-flex align-items-center">
                          <i className="bi bi-arrow-right-circle text-primary" style={{ fontSize: '1.5rem' }}></i>
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
              <div className="card border-0" style={{
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                borderRadius: '12px'
              }}>
                <div className="card-body">
                  <h6 className="card-title text-primary">
                    <i className="bi bi-info-circle me-2"></i>
                    About Search History
                  </h6>
                  <p className="card-text small mb-0 text-dark">
                    {isAuthenticated 
                      ? "Your search history is saved to your account and synced across devices. You can access it anytime you're logged in."
                      : "Your search history is stored locally in this browser session. Create an account to save your history permanently."
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0" style={{
                background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)',
                borderRadius: '12px'
              }}>
                <div className="card-body">
                  <h6 className="card-title text-warning-emphasis">
                    <i className="bi bi-lightning me-2"></i>
                    Quick Access
                  </h6>
                  <p className="card-text small mb-0 text-dark">
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
