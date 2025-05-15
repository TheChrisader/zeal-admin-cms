import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Bell,
  Settings2,
  Shield,
  Flag,
  Mail,
  MessageSquare,
  Save,
  AlertTriangle,
} from "lucide-react";
import { PermissionGuard } from "../moderation/PermissionGuard";

interface SystemSettings {
  moderation: {
    autoFlagThreshold: number;
    requireDoubleApproval: boolean;
    allowBulkModeration: boolean;
    moderationTimeoutMinutes: number;
  };
  notifications: {
    emailDigest: "never" | "daily" | "weekly";
    enablePushNotifications: boolean;
    notifyOnNewFlags: boolean;
    notifyOnUserReports: boolean;
    notifyOnApprovals: boolean;
    digestTime: string;
  };
  security: {
    requireMFA: boolean;
    sessionTimeoutHours: number;
    maxLoginAttempts: number;
    passwordExpiryDays: number;
  };
}

const SystemSettingsPage = () => {
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: async (): Promise<SystemSettings> => {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
    initialData: {
      moderation: {
        autoFlagThreshold: 3,
        requireDoubleApproval: true,
        allowBulkModeration: true,
        moderationTimeoutMinutes: 30,
      },
      notifications: {
        emailDigest: "daily" as "never" | "daily" | "weekly",
        enablePushNotifications: true,
        notifyOnNewFlags: true,
        notifyOnUserReports: true,
        notifyOnApprovals: false,
        digestTime: "09:00",
      },
      security: {
        requireMFA: true,
        sessionTimeoutHours: 24,
        maxLoginAttempts: 5,
        passwordExpiryDays: 90,
      },
    },
  });

  const [currentSettings, setCurrentSettings] =
    useState<SystemSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: SystemSettings) => {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
      setHasChanges(false);
    },
  });

  const handleSettingChange = (
    category: keyof SystemSettings,
    setting: string,
    value: any
  ) => {
    setCurrentSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(currentSettings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">Loading...</div>
    );
  }

  return (
    // <PermissionGuard requiredPermission="MODIFY_ADMIN">
    <div className="space-y-6">
      {hasChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unsaved Changes</AlertTitle>
          <AlertDescription>
            You have unsaved changes. Please save or discard them.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Manage global system configurations and notification preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="moderation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="moderation">
            <Flag className="w-4 h-4 mr-2" />
            Moderation
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="moderation">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Settings</CardTitle>
              <CardDescription>
                Configure how content moderation works across the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Auto-flag Threshold</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[currentSettings.moderation.autoFlagThreshold]}
                      onValueChange={([value]) =>
                        handleSettingChange(
                          "moderation",
                          "autoFlagThreshold",
                          value
                        )
                      }
                      max={10}
                      min={1}
                      step={1}
                      className="w-[200px]"
                    />
                    <span>
                      {currentSettings.moderation.autoFlagThreshold} reports
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={currentSettings.moderation.requireDoubleApproval}
                    onCheckedChange={(checked) =>
                      handleSettingChange(
                        "moderation",
                        "requireDoubleApproval",
                        checked
                      )
                    }
                  />
                  <Label>Require double approval for sensitive content</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={currentSettings.moderation.allowBulkModeration}
                    onCheckedChange={(checked) =>
                      handleSettingChange(
                        "moderation",
                        "allowBulkModeration",
                        checked
                      )
                    }
                  />
                  <Label>Allow bulk moderation actions</Label>
                </div>

                <div>
                  <Label>Moderation Timeout</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={
                        currentSettings.moderation.moderationTimeoutMinutes
                      }
                      onChange={(e) =>
                        handleSettingChange(
                          "moderation",
                          "moderationTimeoutMinutes",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-[100px]"
                    />
                    <span>minutes</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive system notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Email Digest Frequency</Label>
                <Select
                  value={currentSettings.notifications.emailDigest}
                  onValueChange={(value: "never" | "daily" | "weekly") =>
                    handleSettingChange("notifications", "emailDigest", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Digest Delivery Time</Label>
                <Input
                  type="time"
                  value={currentSettings.notifications.digestTime}
                  onChange={(e) =>
                    handleSettingChange(
                      "notifications",
                      "digestTime",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={
                      currentSettings.notifications.enablePushNotifications
                    }
                    onCheckedChange={(checked) =>
                      handleSettingChange(
                        "notifications",
                        "enablePushNotifications",
                        checked
                      )
                    }
                  />
                  <Label>Enable push notifications</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={currentSettings.notifications.notifyOnNewFlags}
                    onCheckedChange={(checked) =>
                      handleSettingChange(
                        "notifications",
                        "notifyOnNewFlags",
                        checked
                      )
                    }
                  />
                  <Label>Notify on new content flags</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={currentSettings.notifications.notifyOnUserReports}
                    onCheckedChange={(checked) =>
                      handleSettingChange(
                        "notifications",
                        "notifyOnUserReports",
                        checked
                      )
                    }
                  />
                  <Label>Notify on user reports</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={currentSettings.notifications.notifyOnApprovals}
                    onCheckedChange={(checked) =>
                      handleSettingChange(
                        "notifications",
                        "notifyOnApprovals",
                        checked
                      )
                    }
                  />
                  <Label>Notify on content approvals</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={currentSettings.security.requireMFA}
                  onCheckedChange={(checked) =>
                    handleSettingChange("security", "requireMFA", checked)
                  }
                />
                <Label>Require MFA for all administrators</Label>
              </div>

              <div>
                <Label>Session Timeout</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={currentSettings.security.sessionTimeoutHours}
                    onChange={(e) =>
                      handleSettingChange(
                        "security",
                        "sessionTimeoutHours",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-[100px]"
                  />
                  <span>hours</span>
                </div>
              </div>

              <div>
                <Label>Maximum Login Attempts</Label>
                <Input
                  type="number"
                  value={currentSettings.security.maxLoginAttempts}
                  onChange={(e) =>
                    handleSettingChange(
                      "security",
                      "maxLoginAttempts",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-[100px]"
                />
              </div>

              <div>
                <Label>Password Expiry</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={currentSettings.security.passwordExpiryDays}
                    onChange={(e) =>
                      handleSettingChange(
                        "security",
                        "passwordExpiryDays",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-[100px]"
                  />
                  <span>days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    // </PermissionGuard>
  );
};

export default SystemSettingsPage;
