import React from 'react';
import { NutritionResult, ResultsCardProps } from '../interfaces';

const ResultsCard = ({ result, onNewAnalysis }: ResultsCardProps) => {
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
        <div className="col-lg-10">
          <div className="card shadow-lg">
            {/* Header */}
            <div className="card-header bg-success text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="card-title mb-0">
                  <i className="bi bi-check-circle me-2"></i>
                  Nutrition Analysis Results
                </h4>
                <button
                  className="btn btn-light btn-sm"
                  onClick={onNewAnalysis}
                  title="Start new analysis"
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  New Analysis
                </button>
              </div>
            </div>

            {/* Main Results */}
            <div className="card-body">
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
                  <div className="card bg-primary text-white h-100">
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
                            <i className="bi bi-hexagon text-secondary fs-2"></i>
                          </div>
                          <h4 className="text-secondary">{result.totalSugar || 0}g</h4>
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
                                    <i className="bi bi-dot text-primary me-1"></i>
                                    {item.food}
                                  </td>
                                  <td className="text-end text-muted">
                                    {item.quantity || 'N/A'}
                                  </td>
                                  <td className="text-end">
                                    <span className="badge bg-primary">{item.calories}</span>
                                  </td>
                                  <td className="text-end text-danger">{item.protein}g</td>
                                  <td className="text-end text-warning">{item.carbs}g</td>
                                  <td className="text-end text-info">{item.fat}g</td>
                                  <td className="text-end text-success">{item.fiber || 0}g</td>
                                  <td className="text-end text-secondary">{item.sugar || 0}g</td>
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
              <div className="row mt-4">
                <div className="col-12 text-center">
                  <div className="btn-group" role="group">
                    <button 
                      className="btn btn-primary"
                      onClick={onNewAnalysis}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Analyze Another Food
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => window.print()}
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
  );
};

export default ResultsCard;
