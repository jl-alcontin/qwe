import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Settings, Moon, Sun, Lock } from 'lucide-react';
import { useUpdatePasswordMutation } from '../store/services/userService';
import { useThemeStore } from '../store/ui/themeStore';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserSettings = () => {
  const { theme, setTheme } = useThemeStore();
  const [updatePassword] = useUpdatePasswordMutation();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>();

  const onPasswordSubmit = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();
      toast.success('Password updated successfully');
      reset();
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Settings
        </h1>

        <div className="space-y-8">
          {/* Theme Settings */}
          <div>
            <h2 className="text-lg font-medium mb-4">Theme</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  theme === 'light' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                }`}
              >
                <Sun className="h-4 w-4" />
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  theme === 'dark' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                }`}
              >
                <Moon className="h-4 w-4" />
                Dark
              </button>
            </div>
          </div>

          {/* Password Change */}
          <div>
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </h2>
            <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  {...register('currentPassword', { required: 'Current password is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  {...register('newPassword', { 
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  {...register('confirmPassword', { required: 'Please confirm your password' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;