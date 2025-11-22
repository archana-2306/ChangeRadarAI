import React, { useState, useEffect } from 'react';

const TestResultsMonitor = ({ storyNumber, API_BASE }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (storyNumber) {
      fetchResults();
    }
  }, [storyNumber]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, storyNumber]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/testing/${storyNumber}/results`);
      if (!res.ok) throw new Error('Failed to fetch test results');
      const data = await res.json();
      setResults(data);

      if (data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (e) {
      console.error('Error fetching results:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!results) {
    return (
      <div style={{
        background: '#f9fafb',
        borderRadius: 8,
        padding: '2rem',
        textAlign: 'center',
        color: '#6b7280',
      }}>
        <p>No test results available yet. Run tests to see results here.</p>
      </div>
    );
  }

  const { passed = 0, failed = 0, skipped = 0, total = 0 } = results;
  const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const MetricCard = ({ label, value, unit, color, icon }) => (
    <div style={{
      background: '#ffffff',
      border: `2px solid ${color}`,
      borderRadius: 8,
      padding: '1rem',
      textAlign: 'center',
    }}>
      <p style={{ margin: 0, fontSize: 12, color: '#6b7280', textTransform: 'uppercase' }}>
        {icon} {label}
      </p>
      <p style={{ margin: '0.5rem 0 0 0', fontSize: 24, fontWeight: 700, color }}>
        {value}
        <span style={{ fontSize: 14, fontWeight: 500 }}>{unit}</span>
      </p>
    </div>
  );

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1f2937' }}>
          📈 Test Results & Metrics
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              padding: '0.5rem 1rem',
              background: autoRefresh ? '#10b981' : '#e5e7eb',
              color: autoRefresh ? 'white' : '#1f2937',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {autoRefresh ? '⏸ Auto-Refresh ON' : '▶ Auto-Refresh OFF'}
          </button>
          <button
            onClick={fetchResults}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              background: loading ? '#e5e7eb' : '#667eea',
              color: loading ? '#6b7280' : 'white',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {loading ? '⏳ Refreshing' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <MetricCard label="Success Rate" value={successRate} unit="%" color="#10b981" icon="✓" />
        <MetricCard label="Passed" value={passed} unit="" color="#10b981" icon="✓" />
        <MetricCard label="Failed" value={failed} unit="" color="#ef4444" icon="✕" />
        <MetricCard label="Total" value={total} unit="" color="#667eea" icon="📊" />
      </div>

      {/* Performance Metrics */}
      {metrics && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            ⚡ Performance Metrics
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}>
            {metrics.avg_response_time && (
              <MetricCard
                label="Avg Response Time"
                value={metrics.avg_response_time}
                unit="ms"
                color="#f59e0b"
                icon="⚙️"
              />
            )}
            {metrics.p99_latency && (
              <MetricCard
                label="P99 Latency"
                value={metrics.p99_latency}
                unit="ms"
                color="#f59e0b"
                icon="📊"
              />
            )}
            {metrics.throughput && (
              <MetricCard
                label="Throughput"
                value={metrics.throughput}
                unit="req/s"
                color="#667eea"
                icon="🚀"
              />
            )}
            {metrics.error_rate && (
              <MetricCard
                label="Error Rate"
                value={metrics.error_rate}
                unit="%"
                color={metrics.error_rate > 5 ? '#ef4444' : '#10b981'}
                icon="⚠️"
              />
            )}
          </div>
        </div>
      )}

      {/* Test Summary */}
      {results.test_summary && (
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '1.5rem',
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            📋 Detailed Summary
          </h3>
          <pre style={{
            margin: 0,
            padding: '1rem',
            background: '#ffffff',
            borderRadius: 6,
            fontSize: 12,
            overflow: 'auto',
            color: '#4b5563',
            fontFamily: 'monospace',
          }}>
            {JSON.stringify(results.test_summary, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestResultsMonitor;
