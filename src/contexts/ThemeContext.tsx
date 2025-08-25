import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useColorScheme } from 'nativewind';
import { preferencesService, Theme } from '../services/preferencesService';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isSystemTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [theme, _setTheme] = useState<Theme>('dark');
  const [isSystemTheme, setIsSystemTheme] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const savedPreferences = await preferencesService.read();
      const savedTheme = savedPreferences.theme;
      _setTheme(savedTheme);
      
      if (savedTheme === 'system') {
        setColorScheme(colorScheme || 'dark');
        setIsSystemTheme(true);
      } else {
        setColorScheme(savedTheme);
        setIsSystemTheme(false);
      }
    };

    loadTheme();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    _setTheme(newTheme);
    const prefs = await preferencesService.read();
    await preferencesService.write({ ...prefs, theme: newTheme });

    if (newTheme === 'system') {
      setColorScheme(colorScheme || 'dark');
      setIsSystemTheme(true);
    } else {
      setColorScheme(newTheme);
      setIsSystemTheme(false);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isSystemTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
