import React from 'react';
import { CATEGORIES } from '../utils/constants';

interface Props {
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

const CategoryNavigation: React.FC<Props> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem' }}>
      <button
        onClick={() => onSelectCategory(null)}
        className="mythic-card"
        style={{
          padding: '0.75rem 1.5rem',
          whiteSpace: 'nowrap',
          border: selectedCategory === null ? '2px solid var(--accent)' : '1px solid var(--border-color)',
          backgroundColor: selectedCategory === null ? 'var(--bg-secondary)' : 'var(--bg-primary)',
          cursor: 'pointer'
        }}
      >
        🌍 Tüm Efsaneler
      </button>
      
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className="mythic-card"
          style={{
            padding: '0.75rem 1.5rem',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: selectedCategory === cat.id ? '2px solid var(--accent)' : '1px solid var(--border-color)',
            backgroundColor: selectedCategory === cat.id ? 'var(--bg-secondary)' : 'var(--bg-primary)',
            cursor: 'pointer'
          }}
          title={cat.description}
        >
          <span>{cat.icon}</span>
          <span style={{ fontWeight: 'bold' }}>{cat.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryNavigation;
