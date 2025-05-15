"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, RefreshCw } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  // CardFooter,
} from "@/components/ui/card";
import { generateSecurePassword } from "@/utils/generatePassword";
import { apiClient } from "@/lib/apiClient";

type RBACPrivilege =
  | "posts:read"
  | "posts:write"
  | "comments:read"
  | "comments:write"
  | "users:read"
  | "users:write"
  | "settings:read"
  | "settings:write"
  | "moderator:read"
  | "moderator:write"
  | "moderators:read"
  | "moderators:write"
  | "admin:all";

type FormData = {
  name: string;
  email: string;
  password: string;
  rbacType: "basic" | "custom" | "specific";
  privileges: RBACPrivilege[];
};

type ModeratorFormData = {
  display_name: string;
  email: string;
  password: string;
  permissions: RBACPrivilege[];
};

const allPrivileges: RBACPrivilege[] = [
  "posts:read",
  "posts:write",
  "comments:read",
  "comments:write",
  "users:read",
  "users:write",
  "settings:read",
  "settings:write",
  "moderator:read",
  "moderator:write",
  "moderators:read",
  "moderators:write",
  "admin:all",
];

export default function AddModeratorPage({
  handleFormSubmit,
}: {
  handleFormSubmit: (data: ModeratorFormData, options?: any) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, control, setValue, watch } =
    useForm<FormData>({
      defaultValues: {
        rbacType: "basic",
        privileges: ["posts:read", "comments:read"],
      },
    });

  const rbacType = watch("rbacType");

  const onSubmit = async (data: FormData) => {
    // Here you would typically send the data to your backend
    console.log("Form submitted:", data);
    handleFormSubmit({
      display_name: data.name,
      email: data.email,
      password: data.password,
      permissions: data.privileges,
    });
    // await apiClient("/api/v1/admin/moderator", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     display_name: data.name,
    //     email: data.email,
    //     password: data.password,
    //     permissions: data.privileges,
    //   }),
    // });
    toast.success("Moderator added successfully!");
  };

  const generatePassword = () => {
    const newPassword = generateSecurePassword();
    setValue("password", newPassword);
    toast.success("Password generated!");
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(watch("password"));
    toast.success("Password copied to clipboard!");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto ">
      {/* <CardHeader>
        <CardTitle>Add New Moderator</CardTitle>
        <CardDescription>
          Create a new moderator account and set their privileges.
        </CardDescription>
      </CardHeader> */}
      <CardContent className="py-3 px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              // id="email"
              // autoComplete="email"
              type="email"
              {...register("email", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <Input
                  // id="password"
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", { required: true })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generatePassword}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyPassword}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>RBAC Privileges</Label>
            <Controller
              name="rbacType"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="basic" id="basic" />
                    <Label htmlFor="basic">Basic (Read-only)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Custom</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {rbacType !== "basic" && (
            <div className="space-y-2">
              <Label>Select Privileges</Label>
              <div className="grid grid-cols-2 gap-2">
                {allPrivileges.map((privilege) => (
                  <div key={privilege} className="flex items-center space-x-2">
                    <Controller
                      name="privileges"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id={privilege}
                          checked={field.value?.includes(privilege)}
                          onCheckedChange={(checked) => {
                            const updatedPrivileges = checked
                              ? [...field.value, privilege]
                              : field.value.filter((p) => p !== privilege);
                            field.onChange(updatedPrivileges);
                          }}
                        />
                      )}
                    />
                    <Label htmlFor={privilege}>{privilege}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full">
            Add Moderator
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
