import { useMutation } from "@apollo/client";
import {
  Check,
  Edit3,
  Key,
  LogOut,
  Monitor,
  Smartphone,
  User,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useAuth } from "@/hooks/useAuth";
import { useSessions } from "@/hooks/useSessions";
import {
  UPDATE_PASSWORD_MUTATION,
  UPDATE_USER_MUTATION,
} from "@/lib/apollo/queries";
import type { ChangePasswordDto, UpdateUserDto } from "@/lib/graphql";
import { logger } from "@/lib/logger";

export function AccountTab() {
  const { user, logout } = useAuth();
  const {
    sessions,
    isLoading: sessionsLoading,
    revokeSession,
    revokeAllOtherSessions,
  } = useSessions();

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {}
  );
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {}
  );
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Session management state
  const [revokingSession, setRevokingSession] = useState<string | null>(null);
  const [revokingAllSessions, setRevokingAllSessions] = useState(false);

  // Mutations
  const [updateUserMutation] = useMutation(UPDATE_USER_MUTATION);
  const [updatePasswordMutation] = useMutation(UPDATE_PASSWORD_MUTATION);

  // Profile editing handlers
  const handleStartEditProfile = () => {
    setProfileForm({
      displayName: user?.displayName || "",
      email: user?.email || "",
    });
    setProfileErrors({});
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    setProfileForm({
      displayName: user?.displayName || "",
      email: user?.email || "",
    });
    setProfileErrors({});
  };

  const validateProfileForm = () => {
    const errors: Record<string, string> = {};

    if (!profileForm.displayName.trim()) {
      errors.displayName = "Display name is required";
    } else if (profileForm.displayName.trim().length < 2) {
      errors.displayName = "Display name must be at least 2 characters";
    }

    if (!profileForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      errors.email = "Please enter a valid email address";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) return;

    try {
      setIsUpdatingProfile(true);
      setProfileErrors({});

      const updateData: UpdateUserDto = {};

      if (profileForm.displayName !== user?.displayName) {
        updateData.displayName = profileForm.displayName.trim();
      }

      if (profileForm.email !== user?.email) {
        updateData.email = profileForm.email.trim();
      }

      if (Object.keys(updateData).length === 0) {
        setIsEditingProfile(false);
        return;
      }

      logger.info("Updating user profile:", updateData);

      const { data } = await updateUserMutation({
        variables: { payload: updateData },
      });

      if (data?.updateUser) {
        setIsEditingProfile(false);
        logger.info("Profile updated successfully");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      setProfileErrors({ submit: errorMessage });
      logger.error("Failed to update profile:", error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Password change handlers
  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};

    if (!passwordForm.oldPassword) {
      errors.oldPassword = "Current password is required";
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) return;

    try {
      setIsChangingPassword(true);
      setPasswordErrors({});

      const changeData: ChangePasswordDto = {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      };

      logger.info("Changing password");

      const { data } = await updatePasswordMutation({
        variables: { payload: changeData },
      });

      if (data?.updatePassword) {
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
        logger.info("Password changed successfully");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to change password";
      setPasswordErrors({ submit: errorMessage });
      logger.error("Failed to change password:", error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setShowPasswordForm(false);
    setPasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
  };

  // Session management handlers
  const handleRevokeSession = async (sessionId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to revoke this session? The device will be logged out."
      )
    ) {
      return;
    }

    try {
      setRevokingSession(sessionId);
      await revokeSession(sessionId);
      logger.info("Session revoked successfully");
    } catch (error) {
      logger.error("Failed to revoke session:", error);
      // TODO: Show error toast
    } finally {
      setRevokingSession(null);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (
      !window.confirm(
        "Are you sure you want to log out all other devices? This will revoke all sessions except the current one."
      )
    ) {
      return;
    }

    try {
      setRevokingAllSessions(true);
      await revokeAllOtherSessions();
      logger.info("All other sessions revoked successfully");
    } catch (error) {
      logger.error("Failed to revoke all sessions:", error);
      // TODO: Show error toast
    } finally {
      setRevokingAllSessions(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getDeviceIcon = (deviceInfo: string) => {
    const info = deviceInfo.toLowerCase();
    if (
      info.includes("mobile") ||
      info.includes("android") ||
      info.includes("iphone")
    ) {
      return Smartphone;
    }
    return Monitor;
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Profile Information
        </h3>
        <Card padding="lg" className="space-y-4">
          {!isEditingProfile ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                  {user?.displayName}
                </h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {user?.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="primary" size="sm">
                    Free Plan
                  </Badge>
                  {user?.emailVerified && (
                    <Badge variant="success" size="sm">
                      <Check className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={Edit3}
                onClick={handleStartEditProfile}
                className="flex-shrink-0"
              >
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary-500" />
                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                  Edit Profile
                </h4>
              </div>

              {profileErrors.submit && (
                <div className="p-3 bg-red-50/80 dark:bg-red-900/20 rounded-lg border border-red-200/50 dark:border-red-700/50">
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    {profileErrors.submit}
                  </p>
                </div>
              )}

              <Input
                label="Display Name"
                value={profileForm.displayName}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
                placeholder="Enter your display name"
                error={!!profileErrors.displayName}
                helperText={profileErrors.displayName}
                disabled={isUpdatingProfile}
              />

              <Input
                label="Email Address"
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="Enter your email address"
                error={!!profileErrors.email}
                helperText={profileErrors.email}
                disabled={isUpdatingProfile}
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={handleCancelEditProfile}
                  className="flex-1"
                  disabled={isUpdatingProfile}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpdateProfile}
                  disabled={isUpdatingProfile}
                  className="flex-1"
                >
                  {isUpdatingProfile ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Change Password */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Change Password
        </h3>
        <Card padding="lg" className="space-y-4">
          {!showPasswordForm ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  Password
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last changed:{" "}
                  {user?.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString()
                    : "Unknown"}
                </div>
              </div>
              <Button
                variant="secondary"
                icon={Key}
                onClick={() => setShowPasswordForm(true)}
                size="sm"
                className="w-full sm:w-auto"
              >
                Change Password
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-primary-500" />
                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                  Change Your Password
                </h4>
              </div>

              {passwordErrors.submit && (
                <div className="p-3 bg-red-50/80 dark:bg-red-900/20 rounded-lg border border-red-200/50 dark:border-red-700/50">
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    {passwordErrors.submit}
                  </p>
                </div>
              )}

              <PasswordInput
                label="Current Password"
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    oldPassword: e.target.value,
                  }))
                }
                placeholder="Enter your current password"
                error={!!passwordErrors.oldPassword}
                helperText={passwordErrors.oldPassword}
                disabled={isChangingPassword}
                autoComplete="current-password"
              />

              <PasswordInput
                label="New Password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                placeholder="Enter your new password"
                error={!!passwordErrors.newPassword}
                helperText={
                  passwordErrors.newPassword ||
                  "Must be at least 6 characters long"
                }
                disabled={isChangingPassword}
                autoComplete="new-password"
              />

              <PasswordInput
                label="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Confirm your new password"
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword}
                disabled={isChangingPassword}
                autoComplete="new-password"
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={handleCancelPasswordChange}
                  className="flex-1"
                  disabled={isChangingPassword}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                  className="flex-1"
                >
                  {isChangingPassword
                    ? "Changing Password..."
                    : "Change Password"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Active Sessions
        </h3>
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">
                Manage Sessions
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View and manage devices that are currently signed in to your
                account
              </p>
            </div>
            {sessions.length > 1 && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleRevokeAllSessions}
                disabled={revokingAllSessions || sessionsLoading}
                className="flex-shrink-0"
              >
                {revokingAllSessions ? "Revoking..." : "Revoke All Others"}
              </Button>
            )}
          </div>

          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/40">
            <div className="flex flex-col items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="font-semibold text-yellow-600 dark:text-yellow-400">
                  Removed Feature
                </h3>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                This feature was removed to avoid leaking information if this
                application were to be live streamed. Unlike other removed
                features, this one is complete but commented out in the source
                code.
              </p>
            </div>
          </div>

          {/*
          {sessionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-6">
              <Monitor className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                No active sessions found
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.deviceInfo);
                const isRevoking = revokingSession === session._id;

                return (
                  <div
                    key={session._id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      session.isCurrentSession
                        ? "bg-primary-50/50 dark:bg-primary-900/20 border-primary-200/50 dark:border-primary-700/50"
                        : "bg-gray-50/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <DeviceIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-gray-800 dark:text-gray-200">
                          {session.deviceInfo}
                        </h5>
                        {session.isCurrentSession && (
                          <Badge variant="primary" size="sm">
                            Current Session
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <p>IP: {session.ipAddress}</p>
                        <p>
                          Last activity:{" "}
                          {formatLastActivity(session.lastActivity)}
                        </p>
                      </div>
                    </div>

                    {!session.isCurrentSession && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={isRevoking ? undefined : Trash2}
                        onClick={() => handleRevokeSession(session._id)}
                        disabled={isRevoking}
                        className="text-red-600 hover:text-red-700 hover:bg-red-100/50 dark:hover:bg-red-900/30"
                      >
                        {isRevoking ? "Revoking..." : "Revoke"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
)} }/*/}
        </Card>
      </div>

      {/* Logout Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Account Actions
        </h3>
        <Card padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">
                Sign Out
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sign out of your account on this device
              </p>
            </div>
            <Button
              variant="danger"
              icon={LogOut}
              onClick={handleLogout}
              className="w-full sm:w-auto"
            >
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
