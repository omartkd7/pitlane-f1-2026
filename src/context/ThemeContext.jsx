import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const TEAMS = [
  { id: 'pitlane',    name: 'PITLANE',      accent: '#E5001A' },
  { id: 'redbull',    name: 'RED BULL',      accent: '#3671C6' },
  { id: 'ferrari',    name: 'FERRARI',       accent: '#E8002D' },
  { id: 'mercedes',   name: 'MERCEDES',      accent: '#27F4D2' },
  { id: 'mclaren',    name: 'McLAREN',       accent: '#FF8000' },
  { id: 'astonmartin',name: 'ASTON MARTIN',  accent: '#006F62' },
  { id: 'williams',   name: 'WILLIAMS',      accent: '#005AFF' },
  { id: 'alpine',     name: 'ALPINE',        accent: '#FF87BC' },
];

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme]     = useState(() => localStorage.getItem('pitlane-theme')  || 'dark');
  const [accentId, setAccentId] = useState(() => localStorage.getItem('pitlane-accent') || 'pitlane');

  const currentTeam = TEAMS.find(t => t.id === accentId) ?? TEAMS[0];

  // Apply theme attribute to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pitlane-theme', theme);
  }, [theme]);

  // Apply accent CSS custom property to <html>
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', currentTeam.accent);
    // Derive a dimmed glow version
    document.documentElement.style.setProperty('--accent-glow', currentTeam.accent + '55');
    localStorage.setItem('pitlane-accent', accentId);
  }, [accentId, currentTeam]);

  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accentId, setAccentId, teams: TEAMS, currentTeam }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
