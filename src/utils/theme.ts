import { useEffect } from 'react';
import { useThemeStore } from '../store/ui/themeStore';

export const useTheme = () => {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, setTheme };
};