import React from 'react';

const StoryTable = ({ stories, selected, onSelect }) => (
  <div style={{
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  }}>
    <div style={{
      background: '#f9fafb',
      padding: '1rem 1.25rem',
      borderBottom: '1px solid #e5e7eb',
    }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
        📋 Stories ({stories.length})
      </h2>
    </div>
    <div style={{ overflow: 'auto', flex: 1 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f9fafb', stickyPosition: 'top', position: 'sticky' }}>
            <th style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #e5e7eb',
              textAlign: 'left',
              fontWeight: 600,
              color: '#4b5563',
              fontSize: 11,
              textTransform: 'uppercase',
            }}>
              ID
            </th>
            <th style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #e5e7eb',
              textAlign: 'left',
              fontWeight: 600,
              color: '#4b5563',
              fontSize: 11,
              textTransform: 'uppercase',
            }}>
              Type
            </th>
            <th style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #e5e7eb',
              textAlign: 'left',
              fontWeight: 600,
              color: '#4b5563',
              fontSize: 11,
              textTransform: 'uppercase',
            }}>
              CSI
            </th>
          </tr>
        </thead>
        <tbody>
          {stories.map((s) => {
            const isSelected = selected && selected.story_number === s.story_number;
            return (
              <tr
                key={s.story_number}
                onClick={() => onSelect(s)}
                style={{
                  cursor: 'pointer',
                  background: isSelected ? '#eef2ff' : 'white',
                  borderBottom: '1px solid #f3f4f6',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'white';
                }}
              >
                <td style={{
                  padding: '0.75rem 1rem',
                  color: '#1f2937',
                  fontWeight: isSelected ? 600 : 500,
                }}>
                  #{s.story_number}
                </td>
                <td style={{
                  padding: '0.75rem 1rem',
                  color: '#4b5563',
                }}>
                  <span style={{
                    background: '#f3f4f6',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 4,
                    fontSize: 11,
                  }}>
                    {s.story_type}
                  </span>
                </td>
                <td style={{
                  padding: '0.75rem 1rem',
                  color: '#4b5563',
                }}>
                  {s.impacted_csi}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default StoryTable;
