import React, { createContext, useContext } from 'react';
import { ConfigProvider, theme } from 'antd';
import { budgetTrackerTheme } from './themeConfig';

type ThemeMode = 'light';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  isDarkMode: boolean;
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
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const contextValue: ThemeContextType = {
    themeMode: 'light',
    toggleTheme: () => {},
    isDarkMode: false,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider
        theme={{
          ...budgetTrackerTheme,
          algorithm: theme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
