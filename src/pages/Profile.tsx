import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { User, Upload } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useUpdateProfileMutation, useUpdateAvatarMutation } from '../store/services/userService';
import UserAvatar from '../components/profile/UserAvatar';
import { setCredentials } from '../store/slices/authSlice';

interface ProfileForm {
  name: string;
  email: string;
}

const Profile = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [updateProfile] = useUpdateProfileMutation();
  const [updateAvatar] = useUpdateAvatarMutation();
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      const result = await updateProfile(data).unwrap();
      dispatch(setCredentials({ ...result }));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const result = await updateAvatar(formData).unwrap();
        dispatch(setCredentials({ ...result }));
        toast.success('Avatar updated successfully');
      } catch (error) {
        toast.error('Failed to update avatar');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <User className="h-6 w-6" />
          Profile Settings
        </h1>

        <div className="mb-8 flex flex-col items-center">
          <UserAvatar
            name={user?.name || ''}
            imageUrl={user?.avatar}
            size="lg"
          />
          <label className="mt-4 cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <div className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800">
              <Upload className="h-4 w-4" />
              Change Profile Picture
            </div>
          </label>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;