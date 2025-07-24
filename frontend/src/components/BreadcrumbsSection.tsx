import React from 'react';
import { BreadcrumbItem } from '../types';

interface BreadcrumbsSectionProps {
  breadcrumbs: BreadcrumbItem[];
  onBreadcrumbClick: (searchId: string) => void;
  onClearHistory: () => void;
}

const BreadcrumbsSection = ({ breadcrumbs, onBreadcrumbClick, onClearHistory }: BreadcrumbsSectionProps) => {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return (
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center">
                <i className="bi bi-clock-history fs-1 text-muted"></i>
                <h5 className="card-title mt-3">No Search History</h5>
                <p className="card-text text-muted">
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
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <i className="bi bi-clock-history me-2"></i>
              Recent Searches
            </h5>
            <button 
              className="btn btn-outline-danger btn-sm"
              onClick={onClearHistory}
              title="Clear all search history"
            >
              <i className="bi bi-trash me-1"></i>
              Clear History
            </button>
          </div>
          
          <div className="row">
            {breadcrumbs.map((breadcrumb, index) => (
              <div key={breadcrumb.searchId} className="col-md-6 col-lg-4 mb-3">
                <div 
                  className="card breadcrumb-item h-100"
                  onClick={() => onBreadcrumbClick(breadcrumb.searchId)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body">
                    <h6 className="card-title text-primary">
                      <i className="bi bi-search me-2"></i>
                      {breadcrumb.query}
                    </h6>
                    <p className="card-text text-muted small">
                      {breadcrumb.summary}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <i className="bi bi-calendar3 me-1"></i>
                        {new Date(breadcrumb.timestamp).toLocaleDateString()}
                      </small>
                      <small className="text-muted">
                        {new Date(breadcrumb.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreadcrumbsSection;
