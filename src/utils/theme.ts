import { useEffect } from 'react';
import { useThemeStore } from '../store/ui/themeStore';
import { useGetUserThemeQuery } from '../store/services/userService';

export const useTheme = () => {
  const { theme, setTheme } = useThemeStore();
  const { data: userTheme, isLoading } = useGetUserThemeQuery();

  useEffect(() => {
    const fetchUserTheme = async () => {
      if (!isLoading && userTheme) {
        setTheme(userTheme.themePreference);
      }
    };

    fetchUserTheme();
  }, [isLoading, userTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, setTheme };
};

