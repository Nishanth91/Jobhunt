'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export const COLOR_SCHEMES = [
  { id: 'teal',   label: 'Teal',   primary: '#14b8a6', secondary: '#06b6d4' },
  { id: 'purple', label: 'Purple', primary: '#8b5cf6', secondary: '#7c3aed' },
  { id: 'ocean',  label: 'Ocean',  primary: '#3b82f6', secondary: '#0ea5e9' },
  { id: 'sunset', label: 'Sunset', primary: '#f59e0b', secondary: '#ef4444' },
  { id: 'rose',   label: 'Rose',   primary: '#f43f5e', secondary: '#ec4899' },
];

const ThemeContext = createContext({
  theme: 'dark',
  colorScheme: 'teal',
  toggle: () => {},
  setColorScheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [colorScheme, setColorSchemeState] = useState('teal');

  useEffect(() => {
    const storedTheme = localStorage.getItem('jh-theme') || 'dark';
    const storedColor = localStorage.getItem('jh-color') || 'teal';
    setTheme(storedTheme);
    setColorSchemeState(storedColor);
    document.documentElement.setAttribute('data-theme', storedTheme);
    document.documentElement.setAttribute('data-color', storedColor);
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

  const setColorScheme = (id) => {
    setColorSchemeState(id);
    localStorage.setItem('jh-color', id);
    document.documentElement.setAttribute('data-color', id);
  };

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, toggle, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
