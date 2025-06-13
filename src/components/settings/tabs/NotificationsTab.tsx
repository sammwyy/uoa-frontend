import { useState } from "react";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";

interface NotificationSettings {
  desktop: boolean;
  sound: boolean;
  email: boolean;
  emailDigest: boolean;
  mentions: boolean;
  newFeatures: boolean;
}

export function NotificationsTabs() {
  // Notification settings state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    desktop: true,
    sound: false,
    email: true,
    emailDigest: false,
    mentions: true,
    newFeatures: false,
  });

  const updateNotification = (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Notification Preferences
        </h3>
        <Card padding="lg" className="space-y-6">
          <Switch
            checked={notifications.desktop}
            onChange={(checked) => updateNotification("desktop", checked)}
            label="Desktop Notifications"
            description="Show browser notifications for new messages and updates"
          />

          <Switch
            checked={notifications.sound}
            onChange={(checked) => updateNotification("sound", checked)}
            label="Sound Notifications"
            description="Play notification sounds for new messages"
          />

          <Switch
            checked={notifications.mentions}
            onChange={(checked) => updateNotification("mentions", checked)}
            label="Mentions & Replies"
            description="Get notified when someone mentions you or replies to your message"
          />
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Email Notifications
        </h3>
        <Card padding="lg" className="space-y-6">
          <Switch
            checked={notifications.email}
            onChange={(checked) => updateNotification("email", checked)}
            label="Email Notifications"
            description="Receive important updates and notifications via email"
          />

          <Switch
            checked={notifications.emailDigest}
            onChange={(checked) => updateNotification("emailDigest", checked)}
            label="Weekly Digest"
            description="Get a weekly summary of your activity and conversations"
          />

          <Switch
            checked={notifications.newFeatures}
            onChange={(checked) => updateNotification("newFeatures", checked)}
            label="Product Updates"
            description="Be the first to know about new features and improvements"
          />
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Do Not Disturb
        </h3>
        <Card padding="lg" className="space-y-4">
          <Switch
            checked={false}
            onChange={() => {}}
            label="Enable Do Not Disturb"
            description="Temporarily disable all notifications"
          />

          <div className="pl-0 sm:pl-8 space-y-3 opacity-50">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Schedule quiet hours:
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Input
                type="time"
                value="22:00"
                className="w-full sm:w-32"
                disabled
              />
              <span className="text-sm text-gray-500 hidden sm:inline">to</span>
              <Input
                type="time"
                value="08:00"
                className="w-full sm:w-32"
                disabled
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
