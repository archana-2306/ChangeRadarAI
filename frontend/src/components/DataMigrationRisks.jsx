import React, { useState, useEffect } from 'react';

const DataMigrationRisks = ({ storyNumber, API_BASE }) => {
  const [migrationData, setMigrationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [validationChecks, setValidationChecks] = useState({});

  useEffect(() => {
    if (storyNumber) {
      fetchMigrationData();
    }
  }, [storyNumber]);

  const fetchMigrationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/testing/${storyNumber}/migrations`);
      if (!res.ok) throw new Error('Failed to fetch migration data');
      const data = await res.json();
      setMigrationData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const runValidation = async (riskId) => {
    try {
      const res = await fetch(`${API_BASE}/testing/${storyNumber}/validate-migration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ risk_id: riskId }),
      });
      if (!res.ok) throw new Error('Validation failed');
      const result = await res.json();
      setValidationChecks((prev) => ({ ...prev, [riskId]: result }));
    } catch (e) {
      setValidationChecks((prev) => ({ ...prev, [riskId]: { status: 'failed', error: e.message } }));
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
        <p>⏳ Loading migration data…</p>
      </div>
    );
  }

  if (error || !migrationData) {
    return (
      <div style={{
        background: '#fef2f2',
        border: '1px solid #fed7d7',
        borderRadius: 12,
        padding: '1.5rem',
        color: '#991b1b',
      }}>
        <strong>⚠️ Migration data unavailable</strong>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: 13 }}>{error || 'No data available'}</p>
      </div>
    );
  }

  const {
    existing_data_transformations = [],
    rollback_strategy = null,
    data_validation_checkpoints = [],
    estimated_migration_time = null,
    data_volume = null,
  } = migrationData;

  const RiskCard = ({ risk }) => {
    const validation = validationChecks[risk.id];
    const riskLevel = risk.risk_level || 'medium';
    const riskColors = {
      low: { bg: '#ecfdf5', border: '#6ee7b7', color: '#065f46' },
      medium: { bg: '#fffbeb', border: '#fbbf24', color: '#92400e' },
      high: { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b' },
    };
    const colors = riskColors[riskLevel] || riskColors.medium;

    return (
      <div
        style={{
          background: '#ffffff',
          border: `2px solid ${colors.border}`,
          borderRadius: 8,
          padding: '1.25rem',
          marginBottom: '1rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onClick={() => setSelectedRisk(selectedRisk === risk.id ? null : risk.id)}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>{risk.title}</h4>
            <p style={{ margin: 0, fontSize: 13, color: '#4b5563' }}>{risk.description}</p>
            <div style={{
              marginTop: '0.75rem',
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              background: colors.bg,
              color: colors.color,
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
            }}>
              Risk Level: {riskLevel.toUpperCase()}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              runValidation(risk.id);
            }}
            style={{
              padding: '0.4rem 0.8rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#5568d3')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#667eea')}
          >
            ✓ Validate
          </button>
        </div>

        {selectedRisk === risk.id && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            {risk.mitigation && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: 12, fontWeight: 600, color: '#1f2937' }}>
                  🛡️ Mitigation Strategy
                </p>
                <p style={{ margin: 0, fontSize: 13, color: '#4b5563' }}>{risk.mitigation}</p>
              </div>
            )}

            {validation && (
              <div style={{
                padding: '0.75rem',
                background: validation.status === 'passed' ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${validation.status === 'passed' ? '#6ee7b7' : '#fca5a5'}`,
                borderRadius: 4,
                marginTop: '0.75rem',
              }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: validation.status === 'passed' ? '#065f46' : '#991b1b' }}>
                  {validation.status === 'passed' ? '✓ Validation Passed' : '✕ Validation Failed'}
                </p>
                {validation.message && (
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: 12, color: '#4b5563' }}>
                    {validation.message}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        borderRadius: 12,
        padding: '1.5rem',
        color: 'white',
        marginBottom: '2rem',
      }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: 20, fontWeight: 700 }}>
          🔄 Data Migration Planning
        </h2>
        <p style={{ margin: 0, opacity: 0.9, fontSize: 13 }}>
          Strategic approach to handle data transformations and ensure safe rollback capability
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {data_volume && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '1rem',
            textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', textTransform: 'uppercase' }}>
              📦 Data Volume
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: 18, fontWeight: 700, color: '#667eea' }}>
              {data_volume}
            </p>
          </div>
        )}
        {estimated_migration_time && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '1rem',
            textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', textTransform: 'uppercase' }}>
              ⏱️ Est. Migration Time
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>
              {estimated_migration_time}
            </p>
          </div>
        )}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '1rem',
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: 12, color: '#6b7280', textTransform: 'uppercase' }}>
            ⚠️ Identified Risks
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: 18, fontWeight: 700, color: '#ef4444' }}>
            {existing_data_transformations.length}
          </p>
        </div>
      </div>

      {/* Data Transformations */}
      {existing_data_transformations.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            🔀 Data Transformations Required
          </h3>
          <div>
            {existing_data_transformations.map((risk) => (
              <RiskCard key={risk.id} risk={risk} />
            ))}
          </div>
        </div>
      )}

      {/* Rollback Strategy */}
      {rollback_strategy && (
        <div style={{
          background: '#f0fdf4',
          border: '2px solid #10b981',
          borderRadius: 8,
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            🔙 Rollback Strategy
          </h3>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: 12, fontWeight: 600, color: '#065f46' }}>
                Automatic Rollback
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#4b5563' }}>
                {rollback_strategy.automatic_rollback || 'N/A'}
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: 12, fontWeight: 600, color: '#065f46' }}>
                Manual Rollback Time
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#4b5563' }}>
                {rollback_strategy.manual_rollback_time || 'N/A'}
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: 12, fontWeight: 600, color: '#065f46' }}>
                Data Backup Location
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#4b5563', fontFamily: 'monospace', fontSize: 12 }}>
                {rollback_strategy.backup_location || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Checkpoints */}
      {data_validation_checkpoints.length > 0 && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '1.5rem',
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            ✓ Data Validation Checkpoints
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data_validation_checkpoints.map((checkpoint, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem',
                  background: '#f9fafb',
                  borderLeft: '3px solid #667eea',
                  borderRadius: 4,
                }}
              >
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#1f2937' }}>
                  {checkpoint.name}
                </p>
                {checkpoint.description && (
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: 12, color: '#6b7280' }}>
                    {checkpoint.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataMigrationRisks;
