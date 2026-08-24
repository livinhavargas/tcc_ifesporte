import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ifesporte-theme';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Read from localStorage (already applied by inline script in index.html)
    return localStorage.getItem(STORAGE_KEY) || 'light';
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem(STORAGE_KEY, theme);

    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#0F172A' : '#1E5EFF');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
