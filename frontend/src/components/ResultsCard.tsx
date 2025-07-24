import React, { Component } from 'react';
import { NutritionResult, ResultsCardProps } from '../interfaces';

interface ResultsCardState {
  isExpanded: boolean;
}

class ResultsCard extends Component<ResultsCardProps, ResultsCardState> {
  constructor(props: ResultsCardProps) {
    super(props);
    this.state = {
      isExpanded: true
    };
  }

  toggleExpanded = () => {
    this.setState(prevState => ({
      isExpanded: !prevState.isExpanded
    }));
  };

  printResults = () => {
    // Get the nutrition content to print
    const printContent = document.querySelector('.nutrition-analysis-content');
    if (!printContent) return;

    // Create a clone of the content
    const contentClone = printContent.cloneNode(true) as HTMLElement;
    
    // Remove action buttons from the clone
    const actionButtons = contentClone.querySelector('.action-buttons-section');
    if (actionButtons) {
      actionButtons.remove();
    }

    // Store original body content
    const originalContent = document.body.innerHTML;
    const originalTitle = document.title;

    // Create print styles
    const printStyles = `
      <style>
        @media print {
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.2;
            color: #000 !important;
            background: white !important;
            margin: 15px;
            font-size: 12px;
          }
          .card {
            border: 1px solid #ccc !important;
            box-shadow: none !important;
            margin-bottom: 10px !important;
            page-break-inside: avoid;
          }
          .card-body {
            padding: 10px !important;
          }
          .card-header {
            padding: 8px 10px !important;
            font-size: 11px !important;
          }
          .bg-success {
            background-color: #28a745 !important;
            color: white !important;
          }
          .text-success { color: #28a745 !important; }
          .text-danger { color: #dc3545 !important; }
          .text-warning { color: #ffc107 !important; }
          .text-info { color: #17a2b8 !important; }
          .table { 
            border-collapse: collapse; 
            font-size: 10px !important;
          }
          .table td, .table th { 
            border: 1px solid #dee2e6 !important; 
            padding: 4px !important;
          }
          .badge { 
            background-color: #28a745 !important; 
            color: white !important;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px !important;
          }
          h1 { font-size: 18px !important; margin: 5px 0 !important; }
          h2 { font-size: 16px !important; margin: 3px 0 !important; }
          h3 { font-size: 14px !important; margin: 3px 0 !important; }
          h4 { font-size: 13px !important; margin: 2px 0 !important; }
          h5 { font-size: 12px !important; margin: 2px 0 !important; }
          h6 { font-size: 11px !important; margin: 2px 0 !important; }
          .display-4 { font-size: 24px !important; }
          .fs-2 { font-size: 16px !important; }
          .row { margin: 5px 0 !important; }
          .col-4, .col-md-4, .col-md-8, .col-md-12, .col-12 {
            padding: 2px !important;
          }
          .mb-2, .mb-4 { margin-bottom: 8px !important; }
          .mt-3, .mt-4 { margin-top: 8px !important; }
          .p-3 { padding: 8px !important; }
          small { font-size: 9px !important; }
          .opacity-75 { font-size: 10px !important; }
          .progress {
            height: 6px !important;
            margin-bottom: 5px !important;
          }
          .bi {
            font-size: 12px !important;
          }
          .table-responsive {
            font-size: 9px !important;
          }
        }
        .print-header {
          text-align: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #28a745;
        }
        .print-date {
          margin-top: 5px;
          font-size: 10px;
          color: #666;
        }
        .compact-layout {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .compact-section {
          flex: 1;
          min-width: 200px;
        }
      </style>
    `;

    // Set document title
    document.title = `Nutrition Analysis - ${this.props.result.query}`;

    // Replace body content with print content
    document.body.innerHTML = `
      ${printStyles}
      <div class="print-header">
        <h1 style="color: #28a745; margin-bottom: 5px;">
          Nutrition Analysis Results
        </h1>
        <h2 style="color: #000; margin-bottom: 3px;">${this.props.result.query}</h2>
        <div class="print-date">
          Generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
      <div class="compact-layout">
        ${contentClone.innerHTML}
      </div>
    `;

    // Print
    window.print();

    // Restore original content
    setTimeout(() => {
      document.body.innerHTML = originalContent;
      document.title = originalTitle;
      // Re-attach event listeners by triggering a re-render
      window.location.reload();
    }, 100);
  };

  override render() {
    const { result, onNewAnalysis } = this.props;
    const { isExpanded } = this.state;
    
    // Calculate macronutrient percentages
    const totalMacros = result.totalProtein + result.totalCarbs + result.totalFat;
    const proteinPercent = totalMacros > 0 ? Math.round((result.totalProtein / totalMacros) * 100) : 0;
    const carbsPercent = totalMacros > 0 ? Math.round((result.totalCarbs / totalMacros) * 100) : 0;
    const fatPercent = totalMacros > 0 ? Math.round((result.totalFat / totalMacros) * 100) : 0;

    // Calculate calories from macros (for verification)
    const caloriesFromMacros = (result.totalProtein * 4) + (result.totalCarbs * 4) + (result.totalFat * 9);
    const accuracy = result.totalCalories > 0 ? Math.round((Math.min(result.totalCalories, caloriesFromMacros) / Math.max(result.totalCalories, caloriesFromMacros)) * 100) : 0;

    return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div style={{ flex: '1 auto', maxWidth: '100%' }}>
          <div className="card shadow-lg" style={{
            borderRadius: '15px',
            overflow: 'hidden'
          }}>
            {/* Clickable Header */}
            <div 
              className="card-header text-white border-0"
              style={{
                background: 'linear-gradient(90deg, #198754 0%, #157347 100%)',
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
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="card-title mb-0">
                  <i className="bi bi-check-circle me-2"></i>
                  Nutrition Analysis Results
                </h4>
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-outline-light btn-sm me-2"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the toggle
                      onNewAnalysis();
                    }}
                    title="Start new analysis"
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    New Analysis
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
            </div>

            {/* Collapsible Content */}
            <div 
              style={{
                maxHeight: isExpanded ? '2000px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.4s ease-in-out'
              }}
            >
              <div className="card-body nutrition-analysis-content">
              {/* Query Display */}
              <div className="mb-4 p-3 bg-light rounded">
                <h6 className="text-muted mb-2">
                  <i className="bi bi-search me-1"></i>
                  Analyzed Food:
                </h6>
                <p className="h5 mb-0 text-dark">{result.query}</p>
              </div>

              <div className="row">
                {/* Total Calories - Featured */}
                <div className="col-md-4 mb-4">
                  <div className="card bg-success text-white h-100">
                    <div className="card-body text-center">
                      <i className="bi bi-fire display-4 mb-2"></i>
                      <h2 className="display-4 mb-2">{result.totalCalories}</h2>
                      <h5 className="card-title">Total Calories</h5>
                      <small className="opacity-75">
                        Estimated based on your input
                      </small>
                    </div>
                  </div>
                </div>

                {/* Macronutrients */}
                <div className="col-md-8 mb-4">
                  <div className="card h-100">
                    <div className="card-header">
                      <h6 className="mb-0">
                        <i className="bi bi-pie-chart me-2"></i>
                        Macronutrient Breakdown
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row text-center">
                        {/* Protein */}
                        <div className="col-4">
                          <div className="mb-2">
                            <i className="bi bi-droplet text-danger fs-2"></i>
                          </div>
                          <h4 className="text-danger">{result.totalProtein}g</h4>
                          <h6 className="text-muted">Protein</h6>
                          <small className="text-muted">{proteinPercent}%</small>
                        </div>

                        {/* Carbohydrates */}
                        <div className="col-4">
                          <div className="mb-2">
                            <i className="bi bi-lightning text-warning fs-2"></i>
                          </div>
                          <h4 className="text-warning">{result.totalCarbs}g</h4>
                          <h6 className="text-muted">Carbs</h6>
                          <small className="text-muted">{carbsPercent}%</small>
                        </div>

                        {/* Fat */}
                        <div className="col-4">
                          <div className="mb-2">
                            <i className="bi bi-droplet-fill text-info fs-2"></i>
                          </div>
                          <h4 className="text-info">{result.totalFat}g</h4>
                          <h6 className="text-muted">Fat</h6>
                          <small className="text-muted">{fatPercent}%</small>
                        </div>
                      </div>

                      {/* Macro Progress Bars */}
                      <div className="mt-3">
                        <div className="progress mb-2" style={{ height: '8px' }}>
                          <div 
                            className="progress-bar bg-danger" 
                            style={{ width: `${proteinPercent}%` }}
                            title={`Protein: ${proteinPercent}%`}
                          ></div>
                          <div 
                            className="progress-bar bg-warning" 
                            style={{ width: `${carbsPercent}%` }}
                            title={`Carbs: ${carbsPercent}%`}
                          ></div>
                          <div 
                            className="progress-bar bg-info" 
                            style={{ width: `${fatPercent}%` }}
                            title={`Fat: ${fatPercent}%`}
                          ></div>
                        </div>
                        <small className="text-muted d-flex justify-content-between">
                          <span><span className="badge bg-danger me-1"></span>Protein</span>
                          <span><span className="badge bg-warning me-1"></span>Carbs</span>
                          <span><span className="badge bg-info me-1"></span>Fat</span>
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Nutrition Info */}
                <div className="col-md-12 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">
                        <i className="bi bi-info-square me-2"></i>
                        Additional Nutrition Information
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row text-center">
                        {/* Fiber */}
                        <div className="col-4">
                          <div className="mb-2">
                            <i className="bi bi-tree text-success fs-2"></i>
                          </div>
                          <h4 className="text-success">{result.totalFiber || 0}g</h4>
                          <h6 className="text-muted">Fiber</h6>
                        </div>

                        {/* Sugar */}
                        <div className="col-4">
                          <div className="mb-2">
                            <i className="bi bi-hexagon text-success fs-2"></i>
                          </div>
                          <h4 className="text-success">{result.totalSugar || 0}g</h4>
                          <h6 className="text-muted">Sugar</h6>
                        </div>

                        {/* Sodium */}
                        <div className="col-4">
                          <div className="mb-2">
                            <i className="bi bi-droplet-half text-dark fs-2"></i>
                          </div>
                          <h4 className="text-dark">{result.totalSodium || 0}mg</h4>
                          <h6 className="text-muted">Sodium</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Food Breakdown */}
              {result.breakdown && result.breakdown.length > 0 && (
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="bi bi-list-ul me-2"></i>
                          Detailed Food Breakdown
                        </h6>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Food Item</th>
                                <th className="text-end">Quantity</th>
                                <th className="text-end">Calories</th>
                                <th className="text-end">Protein</th>
                                <th className="text-end">Carbs</th>
                                <th className="text-end">Fat</th>
                                <th className="text-end">Fiber</th>
                                <th className="text-end">Sugar</th>
                                <th className="text-end">Sodium</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.breakdown.map((item, index) => (
                                <tr key={index}>
                                  <td>
                                    <i className="bi bi-dot text-success me-1"></i>
                                    {item.food}
                                  </td>
                                  <td className="text-end text-muted">
                                    {item.quantity || 'N/A'}
                                  </td>
                                  <td className="text-end">
                                    <span className="badge bg-success">{item.calories}</span>
                                  </td>
                                  <td className="text-end text-danger">{item.protein}g</td>
                                  <td className="text-end text-warning">{item.carbs}g</td>
                                  <td className="text-end text-info">{item.fat}g</td>
                                  <td className="text-end text-success">{item.fiber || 0}g</td>
                                  <td className="text-end text-success">{item.sugar || 0}g</td>
                                  <td className="text-end text-dark">{item.sodium || 0}mg</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary and Additional Info */}
              <div className="row mt-4">
                <div className="col-md-8">
                  {result.summary && (
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title">
                          <i className="bi bi-info-circle me-2"></i>
                          Summary
                        </h6>
                        <p className="card-text">{result.summary}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-graph-up me-2"></i>
                        Analysis Info
                      </h6>
                      <ul className="list-unstyled mb-0">
                        <li>
                          <small className="text-muted">
                            <i className="bi bi-calendar3 me-1"></i>
                            {new Date(result.timestamp).toLocaleDateString()}
                          </small>
                        </li>
                        <li>
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </small>
                        </li>
                        <li>
                          <small className="text-muted">
                            <i className="bi bi-hash me-1"></i>
                            ID: {result.searchId}
                          </small>
                        </li>
                        {accuracy > 0 && (
                          <li>
                            <small className="text-success">
                              <i className="bi bi-check-circle me-1"></i>
                              {accuracy}% accuracy
                            </small>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="row mt-4 action-buttons-section">
                <div className="col-12 text-center">
                  <div className="btn-group" role="group">
                    <button 
                      className="btn btn-success"
                      onClick={onNewAnalysis}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Analyze Another Food
                    </button>
                    <button 
                      className="btn btn-outline-success"
                      onClick={this.printResults}
                    >
                      <i className="bi bi-printer me-2"></i>
                      Print Results
                    </button>
                    <button 
                      className="btn btn-outline-success"
                      onClick={() => {
                        const data = `${result.query}: ${result.totalCalories} calories`;
                        navigator.clipboard?.writeText(data);
                        alert('Results copied to clipboard!');
                      }}
                    >
                      <i className="bi bi-clipboard me-2"></i>
                      Copy Results
                    </button>
                  </div>
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

export default ResultsCard;
