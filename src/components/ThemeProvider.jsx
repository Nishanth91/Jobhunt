'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const stored = localStorage.getItem('jh-theme') || 'dark';
    setTheme(stored);
    document.documentElement.setAttribute('data-theme', stored);
  }, []);

  // Pause CSS animations when tab is hidden to reduce GPU/CPU usage
  useEffect(() => {
    const handleVisibility = () => {
      document.documentElement.style.setProperty(
        '--animation-play-state',
        document.hidden ? 'paused' : 'running'
      );
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('jh-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
