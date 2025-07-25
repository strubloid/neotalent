import React, { Component } from 'react';
import { BreadcrumbItem, BreadcrumbsSectionProps } from '../interfaces';

interface BreadcrumbsSectionState {
  currentIndex: number;
  isExpanded: boolean;
}

class BreadcrumbsSection extends Component<BreadcrumbsSectionProps, BreadcrumbsSectionState> {
  constructor(props: BreadcrumbsSectionProps) {
    super(props);
    this.state = {
      currentIndex: 0,
      isExpanded: false
    };
  }

  formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const searchDate = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - searchDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return searchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  handlePrevious = () => {
    const { breadcrumbs } = this.props;
    this.setState(prevState => ({
      currentIndex: Math.max(0, prevState.currentIndex - 3)
    }));
  };

  handleNext = () => {
    const { breadcrumbs } = this.props;
    this.setState(prevState => ({
      currentIndex: Math.min(breadcrumbs.length - 3, prevState.currentIndex + 3)
    }));
  };

  toggleExpanded = () => {
    this.setState(prevState => ({
      isExpanded: !prevState.isExpanded
    }));
  };
  override render() {
    const { breadcrumbs, onBreadcrumbClick, onClearHistory } = this.props;
    const { currentIndex, isExpanded } = this.state;
    
    if (!breadcrumbs || breadcrumbs.length === 0) {
      return (
        <div className="w-100 mt-4" style={{
          background: '#f8f9fa',
          borderTop: '3px solid #198754',
          borderBottom: '1px solid #dee2e6',
          paddingTop: '2rem',
          paddingBottom: '2rem'
        }}>
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div style={{
                  background: 'white',
                  border: '1px solid #dee2e6',
                  borderLeft: '4px solid #198754',
                  padding: '3rem 2rem',
                  textAlign: 'center'
                }}>
                  <i className="bi bi-clock-history fs-1 text-muted"></i>
                  <h5 className="mt-3 mb-2">No Search History</h5>
                  <p className="text-muted mb-0">
                    Your recent food searches will appear here for quick access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
    <div className="w-100 mt-4" style={{
      background: '#f8f9fa',
      borderTop: '3px solid #198754',
      borderBottom: '1px solid #dee2e6',
      paddingTop: '2rem',
      paddingBottom: '2rem'
    }}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            {/* Recent Searches Collapsible Section */}
          <div style={{
            background: 'white',
            border: '1px solid #dee2e6',
            borderLeft: '4px solid #198754',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}>
            {/* Clickable Header */}
            <div 
              className="d-flex justify-content-between align-items-center p-3 border-bottom"
              style={{
                background: 'linear-gradient(90deg, #198754 0%, #157347 100%)',
                color: 'white',
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
              <div className="d-flex align-items-center">
                <i className="bi bi-clock-history me-3" style={{ fontSize: '1.2rem' }}></i>
                <div>
                  <span className="fw-bold" style={{ fontSize: '1.1rem' }}>Recent Searches</span>
                  {!isExpanded && (
                    <div className="text-light opacity-75" style={{ fontSize: '0.85rem', marginTop: '2px' }}>
                      {breadcrumbs.length} search{breadcrumbs.length !== 1 ? 'es' : ''} available
                    </div>
                  )}
                </div>
                <span className="badge bg-light text-dark ms-3" style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}>
                  {breadcrumbs.length}
                </span>
              </div>
              <div className="d-flex align-items-center">
                <button 
                  className="btn btn-sm btn-outline-light me-3"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the toggle
                    onClearHistory();
                  }}
                  style={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.8rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <i className="bi bi-trash me-1"></i>
                  Clear All
                </button>
                <div className="d-flex align-items-center">
                  <span className="me-2" style={{ fontSize: '0.9rem' }}>
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </span>
                  <i 
                    className={`bi bi-chevron-${isExpanded ? 'up' : 'down'}`}
                    style={{ 
                      fontSize: '1.3rem',
                      transition: 'transform 0.3s ease'
                    }}
                  ></i>
                </div>
              </div>
            </div>

            {/* Collapsible Content */}
            <div 
              style={{
                maxHeight: isExpanded ? '500px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.4s ease-in-out'
              }}
            >
              <div className="position-relative p-3">
                <div className="d-flex align-items-center w-100">
                  {/* Previous Button */}
                  <button 
                    className="btn btn-outline-success btn-sm d-flex align-items-center justify-content-center flex-shrink-0"
                    onClick={this.handlePrevious}
                    disabled={currentIndex === 0}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      opacity: currentIndex === 0 ? 0.3 : 1,
                      transition: 'all 0.3s ease',
                      marginRight: '12px'
                    }}
                    onMouseEnter={(e) => {
                      if (currentIndex !== 0) {
                        e.currentTarget.style.backgroundColor = '#198754';
                        e.currentTarget.style.borderColor = '#198754';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentIndex !== 0) {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.borderColor = '#198754';
                        e.currentTarget.style.color = '#198754';
                      }
                    }}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>

                  {/* Current 3 Searches Display */}
                  <div className="d-flex gap-3 flex-grow-1">
                    {breadcrumbs.slice(currentIndex, currentIndex + 3).map((item, index) => (
                      <div 
                        key={item.searchId}
                        className="p-3 position-relative"
                        style={{
                          background: 'white',
                          border: '2px solid #e9ecef',
                          borderLeft: '4px solid #198754',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          height: '120px',
                          flex: '1 1 0',
                          minWidth: '0'
                        }}
                        onClick={() => onBreadcrumbClick(item.searchId)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(25, 135, 84, 0.15)';
                          e.currentTarget.style.borderLeftColor = '#146c43';
                          e.currentTarget.style.borderLeftWidth = '6px';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = '';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                          e.currentTarget.style.borderLeftColor = '#198754';
                          e.currentTarget.style.borderLeftWidth = '4px';
                        }}
                      >
                        <div className="d-flex h-100">
                          <div className="flex-grow-1 d-flex flex-column" style={{ 
                            width: '0', 
                            paddingRight: '12px',
                            minWidth: '0'
                          }}>
                            <div className="d-flex align-items-center mb-1">
                              <span className="badge bg-success me-1" style={{ fontSize: '0.65rem' }}>
                                #{breadcrumbs.length - breadcrumbs.indexOf(item)}
                              </span>
                              <h6 className="mb-0 text-success fw-bold text-truncate" style={{ fontSize: '0.8rem' }}>
                                {item.query}
                              </h6>
                            </div>
                            <p className="mb-1 text-muted flex-grow-1" style={{ 
                              fontSize: '0.7rem', 
                              lineHeight: '1.1',
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              margin: 0
                            }}>
                              <i className="bi bi-bar-chart me-1"></i>
                              {item.summary}
                            </p>
                            <div className="mt-auto">
                              <small className="text-muted" style={{ fontSize: '0.65rem' }}>
                                <i className="bi bi-calendar me-1"></i>
                                {this.formatTimeAgo(item.timestamp)}
                              </small>
                            </div>
                          </div>
                          <div 
                            className="d-flex align-items-center justify-content-center flex-shrink-0" 
                            style={{ 
                              width: '32px',
                              height: '100%',
                              cursor: 'pointer'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onBreadcrumbClick(item.searchId);
                            }}
                          >
                            <i className="bi bi-arrow-right-circle text-success" style={{ fontSize: '1.4rem' }}></i>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button 
                    className="btn btn-outline-success btn-sm d-flex align-items-center justify-content-center flex-shrink-0"
                    onClick={this.handleNext}
                    disabled={currentIndex + 3 >= breadcrumbs.length}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      opacity: currentIndex + 3 >= breadcrumbs.length ? 0.3 : 1,
                      transition: 'all 0.3s ease',
                      marginLeft: '12px'
                    }}
                    onMouseEnter={(e) => {
                      if (currentIndex + 3 < breadcrumbs.length) {
                        e.currentTarget.style.backgroundColor = '#198754';
                        e.currentTarget.style.borderColor = '#198754';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentIndex + 3 < breadcrumbs.length) {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.borderColor = '#198754';
                        e.currentTarget.style.color = '#198754';
                      }
                    }}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>

                {/* Navigation Info */}
                {breadcrumbs.length > 3 && (
                  <div className="text-center mt-3">
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Showing {currentIndex + 1}-{Math.min(currentIndex + 3, breadcrumbs.length)} of {breadcrumbs.length} searches • Use arrows to navigate
                    </small>
                  </div>
                )}
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

export default BreadcrumbsSection;
