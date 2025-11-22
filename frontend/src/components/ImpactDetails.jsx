import React from 'react';

const chipStyle = (level) => {
  const colors = { low: '#3b82f6', medium: '#f97316', high: '#ef4444', critical: '#b91c1c' };
  return {
    display: 'inline-block',
    padding: '0.1rem 0.5rem',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: colors[level] || '#6b7280',
  };
};

const ImpactDetails = ({ impact }) => {
  const {
    story_number,
    suggested_branch_name,
    overall_summary,
    overall_risk_level,
    overall_risk_score,
    frontend_impacts = [],
    backend_impacts = [],
    cross_service_risks = [],
  } = impact;

  return (
    <div>
      <h2>Impact Details {story_number ? `for ${story_number}` : ''}</h2>
      {suggested_branch_name && (
        <p>
          <strong>Suggested branch:</strong>{' '}
          <code style={{ background: '#f3f4f6', padding: '0.1rem 0.3rem', borderRadius: 4 }}>
            {suggested_branch_name}
          </code>
        </p>
      )}
      {overall_summary && <p>{overall_summary}</p>}
      {overall_risk_level && (
        <p>
          Overall risk:{' '}
          <span style={chipStyle(overall_risk_level)}>
            {overall_risk_level}
            {typeof overall_risk_score === 'number' ? ` (${overall_risk_score}/10)` : ''}
          </span>
        </p>
      )}

      {frontend_impacts.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Frontend / UI Impacts</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {frontend_impacts.map((c, idx) => (
              <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem 1rem' }}>
                <h4 style={{ margin: 0 }}>{c.component_name}</h4>
                {c.file_path && (
                  <p style={{ margin: '0.25rem 0', fontSize: 12 }}>
                    <a 
                      href={`https://github.com/archana-2306/BankApplication/${c.file_path}`}
                      target="_blank"
                      
                      style={{ color: '#0ea5e9', textDecoration: 'none' }}
                    >
                      {c.file_path}
                    </a>
                  </p>
                )}
                {typeof c.risk_score === 'number' && (
                  <p style={{ margin: '0.25rem 0', fontSize: 12, color: '#6b7280' }}>
                    Risk score: {c.risk_score}/10
                  </p>
                )}
                {c.reason && <p style={{ marginTop: '0.5rem' }}>{c.reason}</p>}
                {c.fields_to_add && c.fields_to_add.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Fields / UI elements to add:</strong>
                    <ul>
                      {c.fields_to_add.map((f, i) => (
                        <li key={i}>
                          <code>{f.name}</code> ({f.type}) – {f.description}
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
        <div style={{ marginTop: '1.5rem' }}>
          <h3>Backend Impacts</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {backend_impacts.map((b, idx) => (
              <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem 1rem' }}>
                <h4 style={{ margin: 0 }}>{b.service_name}</h4>
                {(b.method || b.endpoint_path) && (
                  <p style={{ margin: '0.25rem 0', fontSize: 12, color: '#6b7280' }}>
                    {b.method ? `[${b.method}] ` : ''}{b.endpoint_path}
                  </p>
                )}
                {typeof b.risk_score === 'number' && (
                  <p style={{ margin: '0.25rem 0', fontSize: 12, color: '#6b7280' }}>
                    Risk score: {b.risk_score}/10
                  </p>
                )}
                {b.reason && <p style={{ marginTop: '0.5rem' }}>{b.reason}</p>}
                {b.fields_to_add && b.fields_to_add.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Request/Response fields to add:</strong>
                    <ul>
                      {b.fields_to_add.map((f, i) => (
                        <li key={i}>
                          <code>{f.name}</code> ({f.type}) – {f.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {b.db_changes && b.db_changes.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>DB changes:</strong>
                    <ul>
                      {b.db_changes.map((d, i) => (
                        <li key={i}>{d}</li>
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
        <div style={{ marginTop: '1.5rem' }}>
          <h3>Cross-Service Risks</h3>
          <ul>
            {cross_service_risks.map((r, idx) => (
              <li key={idx}>
                {r.from_service} → {r.to_service}: {r.reason}{' '}
                {typeof r.risk_score === 'number' ? `(risk ${r.risk_score}/10)` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImpactDetails;
