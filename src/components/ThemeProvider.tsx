import React, { useEffect } from 'react';
import { useThemeStore } from '../store/ui/themeStore';
import { useGetUserThemeQuery } from '../store/services/userService';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setTheme } = useThemeStore();
  const { data: userTheme, isSuccess } = useGetUserThemeQuery();

  useEffect(() => {
    if (isSuccess && userTheme) {
      setTheme(userTheme.themePreference as 'light' | 'dark' | 'green' | 'indigo');
    }
  }, [isSuccess, userTheme, setTheme]);

  // useEffect(() => {
  //   document.documentElement.className = theme;
  // }, [theme]);


  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
};

