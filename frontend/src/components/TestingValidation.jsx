import React, { useState, useEffect } from 'react';

const TestingValidation = ({ storyNumber, API_BASE, testingData: initialTestingData }) => {
  const [testData, setTestData] = useState(initialTestingData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [testResults, setTestResults] = useState({});
  const [runningTests, setRunningTests] = useState(null);

  useEffect(() => {
    // Use initial data if provided, otherwise fetch
    if (initialTestingData) {
      setTestData(initialTestingData);
    } else if (storyNumber) {
      fetchTestingData();
    }
  }, [storyNumber, initialTestingData]);

  const fetchTestingData = async () => {
    setLoading(true);
    setError(null);
    try {
      // If testing data is embedded in impact, we get it from there
      // This is a fallback for the old standalone endpoint
      const res = await fetch(`${API_BASE}/testing/${storyNumber}`);
      if (!res.ok) throw new Error('Failed to fetch testing data');
      const data = await res.json();
      setTestData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const runTest = async (testName) => {
    setRunningTests(testName);
    try {
      const res = await fetch(`${API_BASE}/testing/${storyNumber}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_name: testName }),
      });
      if (!res.ok) throw new Error('Test execution failed');
      const result = await res.json();
      setTestResults((prev) => ({ ...prev, [testName]: result }));
    } catch (e) {
      setTestResults((prev) => ({
        ...prev,
        [testName]: { status: 'failed', error: e.message },
      }));
    } finally {
      setRunningTests(null);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      passed: '#10b981',
      failed: '#ef4444',
      pending: '#f59e0b',
      skipped: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      passed: '✓',
      failed: '✕',
      pending: '⏳',
      skipped: '⊘',
    };
    return icons[status] || '?';
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
        <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>⏳ Loading testing & validation data…</p>
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div style={{
        background: '#fef2f2',
        border: '1px solid #fed7d7',
        borderRadius: 12,
        padding: '1.5rem',
        color: '#991b1b',
      }}>
        <strong>⚠️ Testing data unavailable</strong>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: 13 }}>{error || 'No testing data available for this story'}</p>
      </div>
    );
  }

  const {
    critical_test_cases = [],
    edge_cases_to_validate = [],
    monitoring_and_alerts = [],
    data_migration_risks = [],
    production_deployment_checklist = [],
  } = testData;

  const Section = ({ title, icon, items, sectionKey }) => {
    const isExpanded = expandedSections[sectionKey];

    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        marginBottom: '1rem',
        overflow: 'hidden',
      }}>
        <button
          onClick={() => toggleSection(sectionKey)}
          style={{
            width: '100%',
            padding: '1rem 1.25rem',
            background: '#f9fafb',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#f9fafb')}
        >
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            {icon} {title}
          </h3>
          <span style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            fontSize: 14,
            color: '#6b7280',
          }}>
            ▼
          </span>
        </button>

        {isExpanded && (
          <div style={{ padding: '1rem 1.25rem' }}>
            {items.map((item, idx) => {
              const testResult = testResults[item];
              const isRunning = runningTests === item;

              return (
                <div
                  key={idx}
                  style={{
                    marginBottom: idx < items.length - 1 ? '1rem' : 0,
                    paddingBottom: idx < items.length - 1 ? '1rem' : 0,
                    borderBottom: idx < items.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: 13, fontWeight: 500, color: '#1f2937' }}>
                        {item}
                      </p>
                      {testResult && (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: testResult.status === 'passed' ? '#ecfdf5' : '#fef2f2',
                          border: `1px solid ${getStatusColor(testResult.status)}`,
                          borderRadius: 4,
                          fontSize: 12,
                          color: getStatusColor(testResult.status),
                        }}>
                          <strong style={{ marginRight: '0.5rem' }}>
                            {getStatusIcon(testResult.status)} {testResult.status.toUpperCase()}
                          </strong>
                          {testResult.message && <span>{testResult.message}</span>}
                          {testResult.error && <span style={{ color: '#991b1b' }}>{testResult.error}</span>}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => runTest(item)}
                      disabled={isRunning}
                      style={{
                        padding: '0.4rem 0.8rem',
                        marginLeft: '1rem',
                        background: isRunning ? '#e5e7eb' : '#667eea',
                        color: isRunning ? '#6b7280' : 'white',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: isRunning ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isRunning) e.currentTarget.style.background = '#5568d3';
                      }}
                      onMouseLeave={(e) => {
                        if (!isRunning) e.currentTarget.style.background = '#667eea';
                      }}
                    >
                      {isRunning ? '⏳ Running' : 'Run Test'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 12,
        padding: '1.5rem',
        color: 'white',
        marginBottom: '2rem',
      }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: 20, fontWeight: 700 }}>
          🧪 Testing & Validation Framework
        </h2>
        <p style={{ margin: 0, opacity: 0.9, fontSize: 13 }}>
          Comprehensive testing strategy to ensure quality, reliability, and safe deployment
        </p>
      </div>

      {/* Critical Test Cases */}
      {critical_test_cases.length > 0 && (
        <Section
          title={`Critical Test Cases (${critical_test_cases.length})`}
          icon="✓"
          items={critical_test_cases}
          sectionKey="test_cases"
        />
      )}

      {/* Edge Cases */}
      {edge_cases_to_validate.length > 0 && (
        <Section
          title={`Edge Cases to Validate (${edge_cases_to_validate.length})`}
          icon="⚡"
          items={edge_cases_to_validate}
          sectionKey="edge_cases"
        />
      )}

      {/* Monitoring & Alerts */}
      {monitoring_and_alerts.length > 0 && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '1.25rem',
          marginBottom: '1rem',
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            📊 Monitoring & Alerts
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
          }}>
            {monitoring_and_alerts.map((alert, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  padding: '1rem',
                }}
              >
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#1f2937' }}>
                  📈 {alert}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Migration Risks */}
      {data_migration_risks.length > 0 && (
        <Section
          title={`Data Migration Risks (${data_migration_risks.length})`}
          icon="⚠️"
          items={data_migration_risks}
          sectionKey="migration_risks"
        />
      )}

      {/* Production Deployment Checklist */}
      {production_deployment_checklist.length > 0 && (
        <div style={{
          background: '#ffffff',
          border: '2px solid #10b981',
          borderRadius: 8,
          padding: '1.25rem',
          marginTop: '1rem',
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            ✅ Production Deployment Checklist
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {production_deployment_checklist.map((item, idx) => (
              <label
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: '#f9fafb',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0fdf4')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#f9fafb')}
              >
                <input
                  type="checkbox"
                  style={{
                    marginRight: '0.75rem',
                    cursor: 'pointer',
                    width: 18,
                    height: 18,
                    accentColor: '#10b981',
                  }}
                />
                <span style={{ fontSize: 13, color: '#4b5563' }}>{item}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestingValidation;
