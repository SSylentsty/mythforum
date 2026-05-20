import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('mythos-theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mythos-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <button 
      onClick={toggleTheme}
      style={{ 
        background: 'none', 
        border: '1px solid var(--border-color)', 
        color: 'var(--accent)', 
        padding: '0.4rem', 
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
      title={theme === 'light' ? 'Switch to Midnight Mode' : 'Switch to Parchment Mode'}
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default ThemeToggle;
