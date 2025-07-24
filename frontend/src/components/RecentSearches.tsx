import React, { Component } from 'react';
import { BreadcrumbItem, NutritionResult, RecentSearchesProps } from '../interfaces';
import ResultsCard from './ResultsCard';

interface RecentSearchesState {
  isExpanded: boolean;
}

class RecentSearches extends Component<RecentSearchesProps, RecentSearchesState> {
  constructor(props: RecentSearchesProps) {
    super(props);
    this.state = {
      isExpanded: false
    };
  }

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

  toggleExpanded = () => {
    this.setState(prevState => ({
      isExpanded: !prevState.isExpanded
    }));
  };

  handleSearchClick = (searchId: string) => {
    // First collapse the search list
    this.setState({ isExpanded: false });
    // Then trigger the original search click handler
    this.props.onSearchClick(searchId);
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
    const { isExpanded } = this.state;

    return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-clock-history me-2 text-success"></i>
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
              className="btn btn-outline-success"
              onClick={onBackToHome}
              style={{
                border: '2px solid #198754',
                color: '#198754',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #198754 0%, #157347 100%)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.color = '#198754';
                e.currentTarget.style.transform = '';
              }}
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
                className="btn btn-success mt-3"
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
              border: '1px solid #dee2e6',
              overflow: 'hidden'
            }}>
              {/* Clickable Header */}
              <div 
                className="card-header d-flex justify-content-between align-items-center border-0"
                style={{
                  background: 'linear-gradient(90deg, #198754 0%, #157347 100%)',
                  color: 'white',
                  borderRadius: '15px 15px 0 0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={this.toggleExpanded}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #157347 0%, #146c43 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #198754 0%, #157347 100%)';
                }}
              >
                <span>
                  <i className="bi bi-collection me-2"></i>
                  <strong>{breadcrumbs.length}</strong> {breadcrumbs.length === 1 ? 'search' : 'searches'} found
                </span>
                <div className="d-flex align-items-center">
                  <button 
                    className="btn btn-sm btn-outline-light me-2"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the toggle
                      onClearHistory();
                    }}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Clear All
                  </button>
                  <i 
                    className={`bi bi-chevron-${isExpanded ? 'up' : 'down'}`}
                    style={{ 
                      fontSize: '1.2rem',
                      transition: 'transform 0.3s ease'
                    }}
                  ></i>
                </div>
              </div>

              {/* Collapsible Content */}
              <div 
                style={{
                  maxHeight: isExpanded ? '1000px' : '0px',
                  overflow: 'hidden',
                  transition: 'max-height 0.4s ease-in-out'
                }}
              >
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {breadcrumbs.map((breadcrumb, index) => (
                      <div 
                        key={breadcrumb.searchId}
                        className="list-group-item list-group-item-action cursor-pointer"
                        onClick={() => this.handleSearchClick(breadcrumb.searchId)}
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
                              <span className="badge bg-success me-2">#{breadcrumbs.length - index}</span>
                              <h6 className="mb-0 text-success fw-bold">
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
                            <i className="bi bi-arrow-right-circle text-success" style={{ fontSize: '1.5rem' }}></i>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* Results Section - Show nutrition result if available */}
          {nutritionResult && onNewAnalysis && (
            <div className="mt-5">
              <ResultsCard
                result={nutritionResult}
                onNewAnalysis={onNewAnalysis}
              />
            </div>
          )}

          {/* Info Section */}
          <div className="row mt-3 mb-3">
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="card border-0 shadow-sm" style={{
                background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                borderRadius: '8px',
                minHeight: '100px',
                height: '100px'
              }}>
                <div className="card-body d-flex align-items-center py-3 px-3 h-100">
                  <div className="me-3">
                    <i className="bi bi-info-circle" style={{ fontSize: '1.5rem', color: '#146c43' }}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="card-title mb-1 fw-bold" style={{ fontSize: '0.9rem', color: '#146c43' }}>
                      About Search History
                    </h6>
                    <p className="card-text mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.2', color: '#0f5132' }}>
                      {isAuthenticated 
                        ? "Search history synced across devices when logged in."
                        : "History stored locally. Create account to save permanently."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm" style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: '8px',
                minHeight: '100px',
                height: '100px'
              }}>
                <div className="card-body d-flex align-items-center py-3 px-3 h-100">
                  <div className="me-3">
                    <i className="bi bi-lightning" style={{ fontSize: '1.5rem', color: '#198754' }}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="card-title mb-1 fw-bold" style={{ fontSize: '0.9rem', color: '#198754' }}>
                      Quick Access
                    </h6>
                    <p className="card-text mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.2', color: '#495057' }}>
                      Click any search to instantly view nutritional analysis again.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    );
  }
}

export default RecentSearches;
