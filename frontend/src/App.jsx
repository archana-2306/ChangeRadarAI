import React, { useEffect, useState } from 'react';
import StoryTable from './components/StoryTable';
import Dashboard from './components/Dashboard';
import TestingValidation from './components/TestingValidation';
import TestResultsMonitor from './components/TestResultsMonitor';
import DataMigrationRisks from './components/DataMigrationRisks';
import ProductionDeploymentChecklist from './components/ProductionDeploymentChecklist';

const API_BASE = 'http://localhost:8000';

const App = () => {
  const [stories, setStories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('impact');

  useEffect(() => {
    const loadStories = async () => {
      try {
        const res = await fetch(`${API_BASE}/stories`);
        const data = await res.json();
        setStories(data);
      } catch {
        setError('Failed to load stories');
      }
    };
    loadStories();
  }, []);

  const analyze = async (storyNumber) => {
    setLoading(true);
    setError(null);
    setImpact(null);
    try {
      const res = await fetch(`${API_BASE}/impact/${storyNumber}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setImpact(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onSelect = (story) => {
    setSelected(story);
    setActiveTab('impact');
    analyze(story.story_number);
  };

  const tabs = [
    { id: 'impact', label: '📊 Impact Analysis', icon: '📊' },
    { id: 'testing', label: '🧪 Testing & Validation', icon: '🧪' },
    { id: 'results', label: '📈 Test Results', icon: '📈' },
    { id: 'migration', label: '🔄 Data Migration', icon: '🔄' },
    { id: 'deployment', label: '🚀 Deployment', icon: '🚀' },
  ];

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: '#f8f9fa',
      minHeight: '100vh',
      padding: 0,
      margin: 0,
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem 1.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: 32, fontWeight: 700 }}>
            📊 Change Radar AI
          </h1>
          <p style={{ margin: 0, opacity: 0.95, fontSize: 15 }}>
            Comprehensive impact analysis, testing validation, and safe production deployment
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
          {/* Left Sidebar - Stories */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <StoryTable stories={stories} selected={selected} onSelect={onSelect} />
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fed7d7',
                borderRadius: 8,
                padding: '1rem',
                color: '#991b1b',
                fontSize: 13,
              }}>
                <strong>Error:</strong> {error}
              </div>
            )}
          </aside>

          {/* Right Content - Main Section */}
          <section>
            {loading && (
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 12,
                padding: '3rem 2rem',
                textAlign: 'center',
                color: '#1e40af',
              }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>⏳ Analyzing impact…</p>
              </div>
            )}
            {!loading && !impact && !error && (
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 12,
                padding: '3rem 2rem',
                color: 'white',
                textAlign: 'center',
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <h2 style={{ margin: 0, fontSize: 24, marginBottom: '0.5rem' }}>👈 Get Started</h2>
                <p style={{ margin: 0, opacity: 0.9, fontSize: 15 }}>
                  Select a story from the list to view comprehensive impact analysis and deployment planning
                </p>
              </div>
            )}

            {impact && !loading && (
              <div>
                {/* Tab Navigation */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '2rem',
                  overflowX: 'auto',
                  padding: '0.5rem',
                  background: 'white',
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}>
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        padding: '0.75rem 1.25rem',
                        background: activeTab === tab.id ? '#667eea' : 'transparent',
                        color: activeTab === tab.id ? 'white' : '#4b5563',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: activeTab === tab.id ? 600 : 500,
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => {
                        if (activeTab !== tab.id) {
                          e.currentTarget.style.background = '#f3f4f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeTab !== tab.id) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div style={{
                  animation: 'fadeIn 0.3s ease-in',
                }}>
                  {activeTab === 'impact' && <Dashboard impact={impact} selected={selected} />}
                  {activeTab === 'testing' && selected && (
                    <TestingValidation 
                      storyNumber={selected.story_number} 
                      API_BASE={API_BASE}
                      testingData={impact?.testing_and_validation}
                    />
                  )}
                  {activeTab === 'results' && selected && (
                    <TestResultsMonitor storyNumber={selected.story_number} API_BASE={API_BASE} />
                  )}
                  {activeTab === 'migration' && selected && (
                    <DataMigrationRisks storyNumber={selected.story_number} API_BASE={API_BASE} />
                  )}
                  {activeTab === 'deployment' && selected && (
                    <ProductionDeploymentChecklist storyNumber={selected.story_number} API_BASE={API_BASE} />
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Add fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default App;
