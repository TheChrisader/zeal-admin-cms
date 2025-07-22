"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Permission {
  value: string;
  label: string;
}

const permissions: Permission[] = [
  { value: "posts:read", label: "Read Posts" },
  { value: "posts:write", label: "Write Posts" },
  { value: "comments:read", label: "Read Comments" },
  { value: "comments:write", label: "Write Comments" },
  { value: "users:read", label: "Read Users" },
  { value: "users:write", label: "Write Users" },
  { value: "freelance_post:read", label: "Read Freelance Post" },
  { value: "freelance_post:write", label: "Write Freelance Post" },
  { value: "settings:read", label: "Read Settings" },
  { value: "settings:write", label: "Write Settings" },
  { value: "moderator:read", label: "Read Moderator" },
  { value: "moderator:write", label: "Write Moderator" },
  { value: "moderators:read", label: "Read Moderators" },
  { value: "moderators:write", label: "Write Moderators" },
  { value: "admin:all", label: "Admin (All Permissions)" },
];

interface EditModeratorDialogProps {
  children: React.ReactNode;
  moderator: {
    id: string;
    name: string;
    email: string;
    permissions: string[];
  };
  handleFormSubmit: ({
    id,
    permissions,
  }: {
    id: string;
    permissions: string[];
  }) => void;
}

function EditModerator({
  children,
  moderator,
  handleFormSubmit,
}: EditModeratorDialogProps) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [openPopover, setOpenPopover] = React.useState(false);
  const [selectedPermissions, setSelectedPermissions] = React.useState<
    string[]
  >(moderator.permissions);
  const [searchValue, setSearchValue] = React.useState("");

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions((current) => {
      if (permission === "admin:all") {
        // If selecting admin:all, give all permissions
        if (!current.includes("admin:all")) {
          return permissions.map((p) => p.value);
        }
        // If deselecting admin:all, remove all permissions
        return [];
      }

      // If selecting a specific permission
      if (current.includes(permission)) {
        const newPermissions = current.filter((p) => p !== permission);
        // Remove admin:all if any permission is removed
        return newPermissions.filter((p) => p !== "admin:all");
      }

      // Add the new permission
      const newPermissions = [...current, permission];
      // Add admin:all if all permissions are selected
      if (
        permissions
          .filter((p) => p.value !== "admin:all")
          .every((p) => newPermissions.includes(p.value))
      ) {
        return [...newPermissions, "admin:all"];
      }

      return newPermissions;
    });
  };

  const handleSave = async () => {
    // TODO: Implement save functionality
    console.log("Saving permissions:", selectedPermissions);
    try {
      //   await apiClient(`/api/v1/admin/moderator/${moderator.id}`, {
      //     method: "PUT",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       permissions: selectedPermissions,
      //     }),
      //   });
      await handleFormSubmit({
        id: moderator.id,
        permissions: selectedPermissions,
      });

      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving permissions:", error);
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        {/* <Button variant="outline">Edit Permissions</Button> */}
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Moderator Permissions</DialogTitle>
          <DialogDescription>
            {moderator.name} ({moderator.email})
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Popover open={openPopover} onOpenChange={setOpenPopover} modal>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openPopover}
                className="justify-between"
              >
                Select permissions...
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search permissions..."
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandEmpty>No permission found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    <ScrollArea className="h-[200px]">
                      {permissions?.map((permission) => {
                        return (
                          <CommandItem
                            key={permission.value}
                            onSelect={() =>
                              handlePermissionToggle(permission.value)
                            }
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedPermissions.includes(permission.value)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {permission.label}
                          </CommandItem>
                        );
                      })}
                    </ScrollArea>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Selected Permissions</h4>
            <div className="flex flex-wrap gap-2">
              {selectedPermissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No permissions selected
                </p>
              ) : (
                selectedPermissions.map((permission) => (
                  <Badge
                    key={permission}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handlePermissionToggle(permission)}
                  >
                    {permissions.find((p) => p.value === permission)?.label}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EditModerator;
