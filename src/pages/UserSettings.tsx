import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Settings, Moon, Sun, Lock, Trash2, Leaf, Sparkles } from "lucide-react";
import {
  useUpdatePasswordMutation,
  useDeleteAccountMutation,
} from "../store/services/userService";
import { useTheme } from "../utils/theme";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import DeleteAccountModal from "../components/profile/DeleteAccountModal";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserSettings = () => {
  const { theme, setTheme } = useTheme();
  const [updatePassword] = useUpdatePasswordMutation();
  const [deleteAccount] = useDeleteAccountMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordForm>();

  const onPasswordSubmit = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();
      toast.success("Password updated successfully");
      reset();
    } catch (error) {
      toast.error("Failed to update password");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount().unwrap();
      dispatch(logout());
      navigate("/login");
      toast.success("Account deleted successfully");
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card text-card-foreground p-8 rounded-lg shadow-lg">
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
                onClick={() => setTheme("light")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  theme === "light"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Sun className="h-4 w-4" />
                Light
              </button>
              <button
                onClick={() => setTheme("green")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  theme === "green"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Leaf className="h-4 w-4" />
                Green
              </button>
              <button
                onClick={() => setTheme("indigo")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  theme === "indigo"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Indigo
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  theme === "dark"
                    ? "bg-foreground text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
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
            <form
              onSubmit={handleSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium">
                  Current Password
                </label>
                <input
                  type="password"
                  {...register("currentPassword", {
                    required: "Current password is required",
                  })}
                  className="mt-1 block w-full rounded-md border-border bg-background text-foreground"
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">
                  New Password
                </label>
                <input
                  type="password"
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="mt-1 block w-full rounded-md border-border bg-background text-foreground"
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                  })}
                  className="mt-1 block w-full rounded-md border-border bg-background text-foreground"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-md ${
                    theme === "dark"
                      ? "bg-foreground text-primary-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Delete Account */}
          <div>
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Account
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </div>
  );
};

export default UserSettings;
