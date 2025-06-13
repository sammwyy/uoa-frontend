import { AlertCircle, Check, Key, Smartphone, User } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";

export function AccountTab() {
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {}
  );
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Two-factor authentication state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isSettingUpTwoFactor, setIsSettingUpTwoFactor] = useState(false);

  const handlePasswordChange = async () => {
    const errors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsChangingPassword(true);
      // Simulate API call
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
        alert("Password changed successfully!");
      }, 2000);
    }
  };

  const handleCancelPasswordChange = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
    setShowPasswordForm(false);
  };

  const handleTwoFactorToggle = () => {
    if (twoFactorEnabled) {
      // Disable 2FA
      setTwoFactorEnabled(false);
      alert("Two-factor authentication disabled");
    } else {
      // Enable 2FA
      setShowTwoFactorSetup(true);
    }
  };

  const handleTwoFactorSetup = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      alert("Please enter a valid 6-digit code");
      return;
    }

    setIsSettingUpTwoFactor(true);
    // Simulate API call
    setTimeout(() => {
      setIsSettingUpTwoFactor(false);
      setTwoFactorEnabled(true);
      setShowTwoFactorSetup(false);
      setTwoFactorCode("");
      alert("Two-factor authentication enabled successfully!");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Profile Information
        </h3>
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                User
              </h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                user@example.com
              </p>
              <Badge variant="primary" size="sm" className="mt-1">
                Free Plan
              </Badge>
            </div>
            <Button variant="secondary" size="sm" className="hidden sm:block">
              Edit Profile
            </Button>
          </div>
          <Button variant="secondary" size="sm" className="w-full sm:hidden">
            Edit Profile
          </Button>
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
                  Last changed 3 months ago
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
                <AlertCircle className="w-5 h-5 text-primary-500" />
                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                  Change Your Password
                </h4>
              </div>

              <PasswordInput
                label="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder="Enter your current password"
                error={!!passwordErrors.currentPassword}
                helperText={passwordErrors.currentPassword}
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
                  "Must be at least 8 characters long"
                }
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

      {/* Two-Factor Authentication */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Two-Factor Authentication
        </h3>
        <Card padding="lg" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Authenticator App
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {twoFactorEnabled
                  ? "Two-factor authentication is currently enabled. Your account is protected with an additional security layer."
                  : "Add an extra layer of security to your account by enabling two-factor authentication using an authenticator app."}
              </p>

              {twoFactorEnabled ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm">
                      <Check className="w-3 h-3 mr-1" />
                      Enabled
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Last used: 2 hours ago
                    </span>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleTwoFactorToggle}
                    className="w-full sm:w-auto"
                  >
                    Disable Two-Factor Authentication
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleTwoFactorToggle}
                  className="w-full sm:w-auto"
                >
                  Enable Two-Factor Authentication
                </Button>
              )}
            </div>
          </div>

          {showTwoFactorSetup && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                Setup Two-Factor Authentication
              </h5>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    1. Download an authenticator app like Google Authenticator
                    or Authy
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    2. Scan this QR code with your authenticator app:
                  </p>
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-3 mx-auto sm:mx-0">
                    <span className="text-xs text-gray-500">QR Code</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    3. Enter the 6-digit code from your authenticator app:
                  </p>
                </div>

                <Input
                  label="Verification Code"
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) =>
                    setTwoFactorCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  placeholder="000000"
                  className="text-center text-lg tracking-widest font-mono"
                  maxLength={6}
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowTwoFactorSetup(false);
                      setTwoFactorCode("");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleTwoFactorSetup}
                    disabled={
                      isSettingUpTwoFactor || twoFactorCode.length !== 6
                    }
                    className="flex-1"
                  >
                    {isSettingUpTwoFactor ? "Verifying..." : "Verify & Enable"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
