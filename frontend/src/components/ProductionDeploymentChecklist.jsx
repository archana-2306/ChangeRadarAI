import React, { useState, useEffect } from 'react';

const ProductionDeploymentChecklist = ({ storyNumber, API_BASE }) => {
  const [deploymentData, setDeploymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checklist, setChecklist] = useState({});
  const [deploymentStatus, setDeploymentStatus] = useState('pending');

  useEffect(() => {
    if (storyNumber) {
      fetchDeploymentData();
    }
  }, [storyNumber]);

  const fetchDeploymentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/testing/${storyNumber}/deployment`);
      if (!res.ok) throw new Error('Failed to fetch deployment data');
      const data = await res.json();
      setDeploymentData(data);
      // Initialize checklist with false values
      const initialChecklist = {};
      (data.pre_deployment_checklist || []).forEach((item, idx) => {
        initialChecklist[idx] = false;
      });
      setChecklist(initialChecklist);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleChecklistItem = (idx) => {
    setChecklist((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const canDeploy = () => {
    const requiredItems = deploymentData?.required_checklist_items || [];
    return requiredItems.every((idx) => checklist[idx] === true);
  };

  const startDeployment = async () => {
    try {
      const res = await fetch(`${API_BASE}/testing/${storyNumber}/start-deployment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist, timestamp: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('Deployment failed');
      setDeploymentStatus('in_progress');
      // Poll for status
      pollDeploymentStatus();
    } catch (e) {
      setError(e.message);
    }
  };

  const pollDeploymentStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/testing/${storyNumber}/deployment-status`);
      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();
      setDeploymentStatus(data.status);
      if (data.status !== 'in_progress') {
        setDeploymentData((prev) => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.error('Error fetching deployment status:', e);
    }
  };

  if (loading) {
    return (
      <div style={{
        background: '#eff6ff',
        borderRadius: 12,
        padding: '2rem',
        textAlign: 'center',
        color: '#1e40af',
      }}>
        <p>⏳ Loading deployment checklist…</p>
      </div>
    );
  }

  if (error || !deploymentData) {
    return (
      <div style={{
        background: '#fef2f2',
        border: '1px solid #fed7d7',
        borderRadius: 12,
        padding: '1.5rem',
        color: '#991b1b',
      }}>
        <strong>⚠️ Deployment data unavailable</strong>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: 13 }}>{error || 'No data available'}</p>
      </div>
    );
  }

  const {
    pre_deployment_checklist = [],
    database_migration_order = [],
    service_restart_sequence = [],
    incident_response = null,
    deployment_windows = null,
    feature_flag_strategy = null,
  } = deploymentData;

  const deploymentStatusColor = {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    completed: '#10b981',
    failed: '#ef4444',
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: 12,
        padding: '1.5rem',
        color: 'white',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: 20, fontWeight: 700 }}>
              🚀 Production Deployment
            </h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: 13 }}>
              Complete pre-deployment verification and safe deployment execution
            </p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '0.75rem 1.25rem',
            borderRadius: 6,
            textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: 11, textTransform: 'uppercase', opacity: 0.9 }}>
              Status
            </p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: 14, fontWeight: 700 }}>
              {deploymentStatus.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Pre-Deployment Checklist */}
      {pre_deployment_checklist.length > 0 && (
        <div style={{
          background: '#ffffff',
          border: '2px solid #10b981',
          borderRadius: 8,
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            ✅ Pre-Deployment Checklist ({Object.values(checklist).filter(Boolean).length}/{pre_deployment_checklist.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {pre_deployment_checklist.map((item, idx) => (
              <label
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  background: checklist[idx] ? '#f0fdf4' : '#f9fafb',
                  border: `1px solid ${checklist[idx] ? '#86efac' : '#e5e7eb'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!checklist[idx]) {
                    e.currentTarget.style.background = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!checklist[idx]) {
                    e.currentTarget.style.background = '#f9fafb';
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={checklist[idx] || false}
                  onChange={() => toggleChecklistItem(idx)}
                  style={{
                    marginRight: '0.75rem',
                    cursor: 'pointer',
                    width: 18,
                    height: 18,
                    accentColor: '#10b981',
                  }}
                />
                <span style={{
                  fontSize: 13,
                  color: checklist[idx] ? '#4b5563' : '#1f2937',
                  textDecoration: checklist[idx] ? 'line-through' : 'none',
                  fontWeight: checklist[idx] ? 400 : 500,
                }}>
                  {item}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={startDeployment}
            disabled={!canDeploy() || deploymentStatus === 'in_progress'}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              background: canDeploy() && deploymentStatus !== 'in_progress' ? '#10b981' : '#d1d5db',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 700,
              cursor: canDeploy() && deploymentStatus !== 'in_progress' ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (canDeploy()) e.currentTarget.style.background = '#059669';
            }}
            onMouseLeave={(e) => {
              if (canDeploy()) e.currentTarget.style.background = '#10b981';
            }}
          >
            {deploymentStatus === 'in_progress' ? '⏳ Deployment in Progress...' : '🚀 Start Deployment'}
          </button>

          {!canDeploy() && (
            <p style={{
              margin: '1rem 0 0 0',
              padding: '0.75rem 1rem',
              background: '#fef2f2',
              color: '#991b1b',
              borderRadius: 6,
              fontSize: 12,
            }}>
              ⚠️ Complete all checklist items before deployment
            </p>
          )}
        </div>
      )}

      {/* Feature Flag Strategy */}
      {feature_flag_strategy && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            🚩 Feature Flag Strategy
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {feature_flag_strategy.flag_name && (
              <div style={{
                background: '#f9fafb',
                padding: '1rem',
                borderRadius: 6,
                border: '1px solid #e5e7eb',
              }}>
                <p style={{ margin: 0, fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>
                  Flag Name
                </p>
                <code style={{
                  marginTop: '0.5rem',
                  display: 'block',
                  background: '#ffffff',
                  padding: '0.5rem',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                  fontSize: 12,
                }}>
                  {feature_flag_strategy.flag_name}
                </code>
              </div>
            )}
            {feature_flag_strategy.rollout_percentage && (
              <div style={{
                background: '#f9fafb',
                padding: '1rem',
                borderRadius: 6,
                border: '1px solid #e5e7eb',
              }}>
                <p style={{ margin: 0, fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>
                  Initial Rollout
                </p>
                <p style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#667eea',
                }}>
                  {feature_flag_strategy.rollout_percentage}%
                </p>
              </div>
            )}
            {feature_flag_strategy.rollout_schedule && (
              <div style={{
                background: '#f9fafb',
                padding: '1rem',
                borderRadius: 6,
                border: '1px solid #e5e7eb',
              }}>
                <p style={{ margin: 0, fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>
                  Rollout Schedule
                </p>
                <p style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: 13,
                  color: '#4b5563',
                }}>
                  {feature_flag_strategy.rollout_schedule}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Database Migration Order */}
      {database_migration_order.length > 0 && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            🗄️ Database Migration Order
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {database_migration_order.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'start',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderLeft: '3px solid #667eea',
                  borderRadius: 6,
                }}
              >
                <div style={{
                  minWidth: 32,
                  height: 32,
                  background: '#667eea',
                  color: 'white',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  marginRight: '1rem',
                  fontSize: 13,
                }}>
                  {idx + 1}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: '#1f2937', fontSize: 13 }}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: 12,
                      color: '#6b7280',
                    }}>
                      {step.description}
                    </p>
                  )}
                  {step.estimated_time && (
                    <p style={{
                      margin: '0.5rem 0 0 0',
                      fontSize: 11,
                      color: '#9ca3af',
                    }}>
                      ⏱️ Est. time: {step.estimated_time}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Restart Sequence */}
      {service_restart_sequence.length > 0 && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            🔄 Service Restart Sequence
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {service_restart_sequence.map((service, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: '#1f2937', fontSize: 13 }}>
                    {service.service_name}
                  </p>
                  {service.health_check && (
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: 12,
                      color: '#6b7280',
                    }}>
                      Health check: {service.health_check}
                    </p>
                  )}
                </div>
                <div style={{
                  background: '#e5e7eb',
                  padding: '0.5rem 1rem',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#374151',
                }}>
                  Step {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incident Response */}
      {incident_response && (
        <div style={{
          background: '#fef2f2',
          border: '2px solid #ef4444',
          borderRadius: 8,
          padding: '1.5rem',
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: 14, fontWeight: 600, color: '#991b1b' }}>
            🚨 Incident Response & Escalation
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {incident_response.primary_contact && (
              <div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: 12, fontWeight: 600, color: '#991b1b' }}>
                  Primary Contact
                </p>
                <p style={{ margin: 0, fontSize: 13, color: '#4b5563' }}>
                  {incident_response.primary_contact}
                </p>
              </div>
            )}
            {incident_response.escalation_path && (
              <div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: 12, fontWeight: 600, color: '#991b1b' }}>
                  Escalation Path
                </p>
                <p style={{ margin: 0, fontSize: 13, color: '#4b5563' }}>
                  {incident_response.escalation_path}
                </p>
              </div>
            )}
            {incident_response.response_sla && (
              <div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: 12, fontWeight: 600, color: '#991b1b' }}>
                  Response SLA
                </p>
                <p style={{ margin: 0, fontSize: 13, color: '#4b5563' }}>
                  {incident_response.response_sla}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionDeploymentChecklist;
