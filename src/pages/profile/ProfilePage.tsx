import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/App";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, UserRound, Mail, KeyRound } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  // Add other fields as needed
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordSectionVisible, setIsPasswordSectionVisible] =
    useState(false);

  // Fetch profile data
  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["profile", user?.id],
    queryFn: () => apiClient(`/api/v1/admin/profile/${user?.id}`),
    enabled: !!user?.id,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: {
      name?: string;
      currentPassword?: string;
      password?: string;
    }) =>
      apiClient(`/api/v1/admin/profile/${user?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Profile updated successfully");
      // Reset password fields after successful update
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordSectionVisible(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    if (isPasswordSectionVisible) {
      if (!currentPassword) {
        toast.error("Please enter your current password");
        return;
      }

      if (newPassword.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }
    }

    const updateData: {
      name?: string;
      currentPassword?: string;
      password?: string;
    } = {
      name: name.trim(),
    };

    if (isPasswordSectionVisible && newPassword) {
      updateData.currentPassword = currentPassword;
      updateData.password = newPassword;
    }

    updateProfileMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="">
      <div className="max-w-3xl  space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information
          </p>
        </div>

        <Card className="border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your personal details here</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdateProfile} autoComplete="off">
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    autoComplete="email"
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Your email address is used for login and cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    autoComplete="full-name"
                    value={profile?.name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-10"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <KeyRound className="h-5 w-5" />
                      Password
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Change your password
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setIsPasswordSectionVisible(!isPasswordSectionVisible)
                    }
                  >
                    {isPasswordSectionVisible ? "Cancel" : "Change Password"}
                  </Button>
                </div>

                {isPasswordSectionVisible && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        autoComplete="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        autoComplete="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <p className="text-sm text-muted-foreground">
                        Password must be at least 8 characters long
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        autoComplete="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="min-w-32"
              >
                {updateProfileMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
