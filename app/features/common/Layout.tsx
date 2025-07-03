import React, { createContext, useContext, useState } from "react";
import styled, { ThemeProvider } from "styled-components";
import { Window, WindowHeader, WindowContent, Button } from "react95";
import original from "react95/dist/themes/original";
import modernDark from "react95/dist/themes/modernDark";

// Theme Context
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

const Container = styled(Window)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  width: 100%;
  height: 100%;
`;

const ThemeToggle = styled(Button)`
  margin-left: auto;
  font-size: 12px;
  height: 20px;
  padding: 2px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled(WindowContent)`
  flex-grow: 1;
  display: flex;
  overflow: auto;
`;

const Layout = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Load theme preference from localStorage
    const saved = localStorage.getItem('eth95-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('eth95-dark-mode', JSON.stringify(newMode));
  };

  const currentTheme = isDarkMode ? modernDark : original;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ThemeProvider theme={currentTheme}>
        <AppContainer>
          <Container shadow={false}>
            <WindowHeader>
              <HeaderContainer>
                <span>Eth95.exe</span>
                <ThemeToggle onClick={toggleTheme} size="sm">
                  {isDarkMode ? '☀️' : '🌙'}
                </ThemeToggle>
              </HeaderContainer>
            </WindowHeader>
            <Content>{children}</Content>
          </Container>
        </AppContainer>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default Layout;
