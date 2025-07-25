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
      <div className="w-100" style={{
        background: '#f8f9fa',
        borderTop: '3px solid #198754',
        marginTop: '2rem'
      }}>
        <div className="container-fluid px-0">
          <div className="row no-gutters">
            <div className="col-12">
              <div style={{
                background: 'white',
                borderBottom: '1px solid #e9ecef',
                borderLeft: '4px solid #198754',
                minHeight: '60px'
              }}>
                {/* Clickable Header - Full Width */}
                <div 
                  className="d-flex justify-content-between align-items-center"
                  style={{
                    background: 'linear-gradient(90deg, #198754 0%, #157347 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: '1.25rem 2rem',
                    minHeight: '70px'
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
                    <i className="bi bi-clock-history me-4" style={{ fontSize: '1.3rem' }}></i>
                    <div>
                      <span className="fw-bold" style={{ fontSize: '1.2rem' }}>Recent Searches</span>
                      {!isExpanded && (
                        <div className="text-light opacity-80" style={{ fontSize: '0.9rem', marginTop: '3px' }}>
                          {breadcrumbs.length} search{breadcrumbs.length !== 1 ? 'es' : ''} available • Click to expand
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="badge bg-light text-dark me-4" style={{ 
                      fontSize: '0.8rem', 
                      padding: '0.5rem 0.8rem',
                      fontWeight: '600'
                    }}>
                      {breadcrumbs.length}
                    </span>
                    <button 
                      className="btn btn-sm btn-outline-light me-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearHistory();
                      }}
                      style={{
                        borderColor: 'rgba(255,255,255,0.6)',
                        color: 'white',
                        fontSize: '0.85rem',
                        padding: '0.5rem 1rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.borderColor = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
                      }}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Clear All
                    </button>
                    <div className="d-flex align-items-center">
                      <span className="me-3" style={{ fontSize: '0.95rem', fontWeight: '500' }}>
                        {isExpanded ? 'Collapse' : 'Expand'}
                      </span>
                      <i 
                        className={`bi bi-chevron-${isExpanded ? 'up' : 'down'}`}
                        style={{ 
                          fontSize: '1.4rem',
                          transition: 'transform 0.3s ease'
                        }}
                      ></i>
                    </div>
                  </div>
                </div>

                {/* Collapsible Content - Full Width */}
                <div 
                  style={{
                    maxHeight: isExpanded ? '700px' : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 0.5s ease-in-out',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  <div style={{ padding: '2rem' }}>
                    <div className="d-flex align-items-center w-100">
                      {/* Previous Button */}
                      <button 
                        className="btn btn-success d-flex align-items-center justify-content-center flex-shrink-0"
                        onClick={this.handlePrevious}
                        disabled={currentIndex === 0}
                        style={{
                          width: '50px',
                          height: '50px',
                          opacity: currentIndex === 0 ? 0.3 : 1,
                          transition: 'all 0.3s ease',
                          marginRight: '20px',
                          border: 'none',
                          fontSize: '1.2rem'
                        }}
                        onMouseEnter={(e) => {
                          if (currentIndex !== 0) {
                            e.currentTarget.style.backgroundColor = '#146c43';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentIndex !== 0) {
                            e.currentTarget.style.backgroundColor = '#198754';
                            e.currentTarget.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>

                      {/* Current 3 Searches Display */}
                      <div className="d-flex gap-4 flex-grow-1">
                        {breadcrumbs.slice(currentIndex, currentIndex + 3).map((item, index) => (
                          <div 
                            key={item.searchId}
                            className="position-relative"
                            style={{
                              background: 'white',
                              border: '1px solid #e9ecef',
                              borderLeft: '5px solid #198754',
                              boxShadow: '0 3px 12px rgba(0,0,0,0.1)',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              height: '140px',
                              flex: '1 1 0',
                              minWidth: '0',
                              padding: '1.25rem'
                            }}
                            onClick={() => onBreadcrumbClick(item.searchId)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.boxShadow = '0 8px 25px rgba(25, 135, 84, 0.2)';
                              e.currentTarget.style.borderLeftColor = '#146c43';
                              e.currentTarget.style.borderLeftWidth = '7px';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = '';
                              e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.1)';
                              e.currentTarget.style.borderLeftColor = '#198754';
                              e.currentTarget.style.borderLeftWidth = '5px';
                            }}
                            >
                            <div className="d-flex h-100">
                              <div className="flex-grow-1 d-flex flex-column" style={{ 
                                width: '0', 
                                paddingRight: '15px',
                                minWidth: '0'
                              }}>
                                <div className="d-flex align-items-center mb-2">
                                  <span className="badge bg-success me-2" style={{ 
                                    fontSize: '0.7rem', 
                                    padding: '0.3rem 0.6rem',
                                    fontWeight: '600'
                                  }}>
                                    #{breadcrumbs.length - breadcrumbs.indexOf(item)}
                                  </span>
                                  <h6 className="mb-0 text-success fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>
                                    {item.query}
                                  </h6>
                                </div>
                                <p className="mb-2 text-muted flex-grow-1" style={{ 
                                  fontSize: '0.8rem', 
                                  lineHeight: '1.3',
                                  overflow: 'hidden',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  margin: 0
                                }}>
                                  <i className="bi bi-bar-chart me-1 text-success"></i>
                                  {item.summary}
                                </p>
                                <div className="mt-auto d-flex justify-content-between align-items-center">
                                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    <i className="bi bi-calendar me-1"></i>
                                    {this.formatTimeAgo(item.timestamp)}
                                  </small>
                                  <i className="bi bi-arrow-right-circle text-success" style={{ fontSize: '1.3rem' }}></i>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Next Button */}
                      <button 
                        className="btn btn-success d-flex align-items-center justify-content-center flex-shrink-0"
                        onClick={this.handleNext}
                        disabled={currentIndex + 3 >= breadcrumbs.length}
                        style={{
                          width: '50px',
                          height: '50px',
                          opacity: currentIndex + 3 >= breadcrumbs.length ? 0.3 : 1,
                          transition: 'all 0.3s ease',
                          marginLeft: '20px',
                          border: 'none',
                          fontSize: '1.2rem'
                        }}
                        onMouseEnter={(e) => {
                          if (currentIndex + 3 < breadcrumbs.length) {
                            e.currentTarget.style.backgroundColor = '#146c43';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentIndex + 3 < breadcrumbs.length) {
                            e.currentTarget.style.backgroundColor = '#198754';
                            e.currentTarget.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
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

export default BreadcrumbsSection;
