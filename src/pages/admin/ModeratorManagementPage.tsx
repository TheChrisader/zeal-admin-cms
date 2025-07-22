import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Plus, Pencil, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import AddModeratorPage from "./AddModeratorPage";
import { apiClient } from "@/lib/apiClient";
import EditModerator from "./EditModerator";
import { Skeleton } from "@/components/ui/skeleton";

// Types
type Moderator = {
  _id: string;
  email: string;
  name: string;
  permissions: string[];
  // isActive: boolean;
};

type ModeratorFormData = Omit<Moderator, "_id"> & { password: string };

// Mock API calls
const fetchModerators = async (): Promise<Moderator[]> => {
  try {
    const response = await apiClient("/api/v1/admin/moderator");
    // if (!response.ok) {
    //   throw new Error("Failed to fetch moderators");
    // }
    // const data = await response.json();
    return response;
  } catch (error) {
    console.error("Error fetching moderators:", error);
    return [];
  }
};

const createModerator = async (data: ModeratorFormData): Promise<Moderator> => {
  const response = await apiClient("/api/v1/admin/moderator", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response;
};

const editModerator = async ({
  id,
  permissions,
}: {
  id: string;
  permissions: string[];
}): Promise<Moderator> => {
  const response = await apiClient(`/api/v1/admin/moderator/${id}`, {
    method: "PUT",
    body: JSON.stringify({ permissions }),
  });
  return response;
};

const ModeratorManagement = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedModerator, setSelectedModerator] =
    React.useState<Moderator | null>(null);
  const queryClient = useQueryClient();

  const {
    data: moderators,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["moderators"],
    queryFn: fetchModerators,
  });
  console.log(moderators);

  const createMutation = useMutation({
    mutationFn: createModerator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderators"] });
      setIsOpen(false);
    },
  });

  const editMutation = useMutation({
    mutationFn: editModerator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderators"] });
      // setIsOpen(false);
    },
  });

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   const formData = new FormData(e.currentTarget);

  //   const moderatorData: ModeratorFormData = {
  //     email: formData.get("email") as string,
  //     name: formData.get("name") as string,
  //     permissions: {
  //       canManageArticles: formData.get("canManageArticles") === "on",
  //       canManageModerators: formData.get("canManageModerators") === "on",
  //       canApproveComments: formData.get("canApproveComments") === "on",
  //     },
  //     isActive: true,
  //   };

  // createMutation.mutate(moderatorData);
  // };

  // if (isLoading) return <div className="p-4">Loading...</div>;
  if (error)
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error loading moderators</AlertDescription>
      </Alert>
    );

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Moderator Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="flex gap-1">
              <Plus className=" h-4 w-4" />
              <span className="max-[520px]:hidden">Add Moderator</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[95vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Add New Moderator</DialogTitle>
              <DialogDescription>
                Create a new moderator account and set their privileges.
              </DialogDescription>
            </DialogHeader>
            <AddModeratorPage handleFormSubmit={createMutation.mutate} />
            {/* <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  required
                  type="email"
                  name="email"
                  placeholder="moderator@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input required name="name" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Permissions</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox name="canManageArticles" id="canManageArticles" />
                    <label htmlFor="canManageArticles">
                      Can manage articles
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      name="canManageModerators"
                      id="canManageModerators"
                    />
                    <label htmlFor="canManageModerators">
                      Can manage moderators
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      name="canApproveComments"
                      id="canApproveComments"
                    />
                    <label htmlFor="canApproveComments">
                      Can approve comments
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Adding..." : "Add Moderator"}
                </Button>
              </div>
            </form> */}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <>
          {[1, 2].map((i) => (
            <Card key={i} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>

              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((badge) => (
                  <Skeleton key={badge} className="h-4 w-32 rounded-full" />
                ))}
              </div>
            </Card>
          ))}
        </>
      ) : (
        <div className="grid gap-4">
          {moderators?.map((moderator) => (
            <Card key={moderator.email}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-3 pb-0">
                <CardTitle className="text-lg font-medium">
                  {moderator.name}
                </CardTitle>
                <EditModerator
                  moderator={{
                    id: moderator._id.toString(),
                    name: moderator.name,
                    email: moderator.email,
                    permissions: moderator.permissions,
                  }}
                  handleFormSubmit={editMutation.mutate}
                >
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </EditModerator>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">{moderator.email}</p>
                  <div className="flex flex-wrap gap-2">
                    {moderator.permissions.find(
                      (privilege) =>
                        privilege.includes("users") ||
                        privilege.includes("admin")
                    ) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Manage Users
                      </span>
                    )}
                    {moderator.permissions.find(
                      (privilege) =>
                        privilege.includes("post") ||
                        privilege.includes("admin")
                    ) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Manage Posts
                      </span>
                    )}
                    {moderator.permissions.find(
                      (privilege) =>
                        privilege.includes("moderator") ||
                        privilege.includes("admin")
                    ) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Manage Moderators
                      </span>
                    )}
                    {moderator.permissions.find(
                      (privilege) =>
                        privilege.includes("comment") ||
                        privilege.includes("admin")
                    ) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Approve Comments
                      </span>
                    )}
                    {moderator.permissions.find(
                      (privilege) =>
                        privilege.includes("settings") ||
                        privilege.includes("admin")
                    ) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Manage Settings
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModeratorManagement;
