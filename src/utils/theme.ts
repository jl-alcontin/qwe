import { useEffect } from 'react';
import { useThemeStore } from '../store/ui/themeStore';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useUpdateThemeMutation } from '../store/services/userService';
import { updateUserTheme } from '../store/slices/authSlice';

export const useTheme = () => {
  const { theme, setTheme: setLocalTheme } = useThemeStore();
  const user = useSelector((state: RootState) => state.auth.user);
  const [updateTheme] = useUpdateThemeMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    // Set initial theme from user preferences if available
    if (user?.theme && user.theme !== theme) {
      setLocalTheme(user.theme as any);
    }
  }, [user?.theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = async (newTheme: 'light' | 'dark' | 'green' | 'indigo') => {
    setLocalTheme(newTheme);
    
    // Only update theme on server if user is logged in
    if (user) {
      try {
        await updateTheme({ theme: newTheme }).unwrap();
        dispatch(updateUserTheme(newTheme));
      } catch (error) {
        console.error('Failed to update theme:', error);
      }
    }
  };

  return { theme, setTheme };
};