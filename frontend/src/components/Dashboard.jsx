import React from 'react';

const Dashboard = ({ impact, selected, onTestingDataAvailable }) => {
  if (!impact) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 12,
        padding: '2rem',
        color: 'white',
        textAlign: 'center',
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>📊 Impact Dashboard</h2>
        <p style={{ margin: 0, opacity: 0.9 }}>Select a story to analyze impact</p>
      </div>
    );
  }

  const {
    story_number,
    overall_summary,
    overall_risk_level,
    overall_risk_score,
    frontend_impacts = [],
    backend_impacts = [],
    cross_service_risks = [],
    suggested_branch_name,
    testing_and_validation = null,
    daystoimplement = { development: 0, testing_and_validation: 0 }
  } = impact;

  // Notify parent when testing data is available
  React.useEffect(() => {
    if (onTestingDataAvailable && testing_and_validation) {
      onTestingDataAvailable(testing_and_validation);
    }
  }, [testing_and_validation, onTestingDataAvailable]);

  const getRiskColor = (level) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#7f1d1d',
    };
    return colors[level] || '#6b7280';
  };

  const getRiskBgColor = (level) => {
    const colors = {
      low: '#ecfdf5',
      medium: '#fffbeb',
      high: '#fef2f2',
      critical: '#fef2f2',
    };
    return colors[level] || '#f9fafb';
  };

  const StatCard = ({ title, value, color, icon }) => (
    <div style={{
      background: '#f9fafb',
      border: `2px solid ${color}`,
      borderRadius: 8,
      padding: '1rem',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 24, marginBottom: '0.5rem' }}>{icon}</div>
      <p style={{ margin: 0, fontSize: 12, color: '#6b7280', textTransform: 'uppercase' }}>{title}</p>
      <p style={{ margin: '0.5rem 0 0 0', fontSize: 20, fontWeight: 'bold', color }}>{value}</p>
    </div>
  );

  const riskColor = getRiskColor(overall_risk_level);
  const riskBgColor = getRiskBgColor(overall_risk_level);

  return (
    <div>
      {/* Header Card */}
      <div style={{
        background: riskBgColor,
        border: `2px solid ${riskColor}`,
        borderRadius: 12,
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Story #{story_number}</h2>
            {overall_summary && (
              <p style={{ margin: '0.5rem 0', color: '#4b5563', lineHeight: 1.5 }}>{overall_summary}</p>
            )}
            {suggested_branch_name && (
              <p style={{ margin: '0.75rem 0 0 0', fontSize: 12, color: '#6b7280' }}>
                <strong>Branch:</strong>{' '}
                <code style={{
                  background: '#ffffff',
                  padding: '0.25rem 0.5rem',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                }}>
                  {suggested_branch_name}
                </code>
              </p>
            )}
          </div>
          <div style={{
            background: riskColor,
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: 8,
            textAlign: 'center',
            minWidth: 100,
          }}>
            <p style={{ margin: 0, fontSize: 12, textTransform: 'uppercase', opacity: 0.9 }}>Risk Level</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: 24, fontWeight: 'bold' }}>{overall_risk_level}</p>
            {typeof overall_risk_score === 'number' && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: 11, opacity: 0.85 }}>{overall_risk_score}/10</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <StatCard title="Frontend Components" value={frontend_impacts.length} color="#667eea" icon="🎨" />
        <StatCard title="Backend Services" value={backend_impacts.length} color="#f59e0b" icon="⚙️" />
        <StatCard title="Cross-Service Risks" value={cross_service_risks.length} color="#ef4444" icon="⚠️" />
        <StatCard title="Required Dev Days" value={daystoimplement.development} color="#ef4444" icon="💻"/>
        <StatCard title="Required test Days" value={daystoimplement.testing_and_validation} color="#ef4444" icon="🛠️"/>
      </div>

      {/* Content Sections */}
      {frontend_impacts.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: 16, fontWeight: 600 }}>
            🎨 Frontend / UI Impacts ({frontend_impacts.length})
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}>
            {frontend_impacts.map((c, idx) => (
              <div key={idx} style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>{c.component_name}</h4>
                {c.file_path && (
                  <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>
                    {c.file_path}
                    <a 
                      href={`https://github.com/archana-2306/BankApplication/blob/main/${c.file_path}`}
                      target="_blank"
                      style={{ color: '#0ea5e9', textDecoration: 'none' }}
                    >link</a>
                  </p>
                )}
                {typeof c.risk_score === 'number' && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    background: '#f3f4f6',
                    borderRadius: 4,
                    fontSize: 12,
                  }}>
                    <span style={{ fontWeight: 600 }}>Risk Score:</span> {c.risk_score}/10
                  </div>
                )}
                {c.reason && (
                  <p style={{ margin: '0.75rem 0 0 0', fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>
                    {c.reason}
                  </p>
                )}
                {c.fields_to_add && c.fields_to_add.length > 0 && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: 12, fontWeight: 600, color: '#1f2937' }}>
                      Fields to Add:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                      {c.fields_to_add.map((f, i) => (
                        <li key={i} style={{ fontSize: 12, color: '#4b5563', marginBottom: '0.25rem' }}>
                          <code style={{ background: '#f3f4f6', padding: '0.1rem 0.3rem', borderRadius: 3 }}>
                            {f.name}
                          </code>
                          <span style={{ color: '#9ca3af' }}> ({f.type})</span>
                          {f.description && <span style={{ color: '#6b7280' }}> – {f.description}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {backend_impacts.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: 16, fontWeight: 600 }}>
            ⚙️ Backend Services ({backend_impacts.length})
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}>
            {backend_impacts.map((b, idx) => (
              <div key={idx} style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>{b.service_name}</h4>
                {(b.method || b.endpoint_path) && (
                  <p style={{
                    margin: '0.25rem 0 0.75rem 0',
                    fontSize: 12,
                    background: '#f3f4f6',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 4,
                    fontFamily: 'monospace',
                  }}>
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>{b.method || 'API'}</span>{' '}
                    {b.endpoint_path}
                  </p>
                )}
                {typeof b.risk_score === 'number' && (
                  <div style={{
                    marginBottom: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    background: '#f3f4f6',
                    borderRadius: 4,
                    fontSize: 12,
                  }}>
                    <span style={{ fontWeight: 600 }}>Risk Score:</span> {b.risk_score}/10
                  </div>
                )}
                {b.reason && (
                  <p style={{ margin: '0.75rem 0', fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>
                    {b.reason}
                  </p>
                )}
                {b.fields_to_add && b.fields_to_add.length > 0 && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: 12, fontWeight: 600, color: '#1f2937' }}>
                      Fields to Add:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                      {b.fields_to_add.map((f, i) => (
                        <li key={i} style={{ fontSize: 12, color: '#4b5563', marginBottom: '0.25rem' }}>
                          <code style={{ background: '#f3f4f6', padding: '0.1rem 0.3rem', borderRadius: 3 }}>
                            {f.name}
                          </code>
                          <span style={{ color: '#9ca3af' }}> ({f.type})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {b.db_changes && b.db_changes.length > 0 && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: 12, fontWeight: 600, color: '#1f2937' }}>
                      DB Changes:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                      {b.db_changes.map((d, i) => (
                        <li key={i} style={{ fontSize: 12, color: '#4b5563', marginBottom: '0.25rem' }}>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {cross_service_risks.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: 16, fontWeight: 600 }}>
            ⚠️ Cross-Service Risks ({cross_service_risks.length})
          </h3>
          <div style={{
            background: '#fff5f5',
            border: '1px solid #fed7d7',
            borderRadius: 8,
            padding: '1.25rem',
          }}>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              {cross_service_risks.map((r, idx) => (
                <li
                  key={idx}
                  style={{
                    marginBottom: '0.75rem',
                    fontSize: 13,
                    color: '#4b5563',
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: '#1f2937' }}>
                    {r.from_service} → {r.to_service}
                  </strong>
                  <br />
                  {r.reason}
                  {typeof r.risk_score === 'number' && (
                    <span style={{ color: '#ef4444', fontWeight: 600, marginLeft: '0.5rem' }}>
                      Risk: {r.risk_score}/10
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
