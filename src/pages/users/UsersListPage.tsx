"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiSearch, FiFilter } from "react-icons/fi";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserForm, type UserFormValues } from "@/components/custom/user-form";
import { mockUsers, type IUser, type UserRole } from "@/types/user";
import { WriterRequests } from "@/components/custom/writer-requests";
import { apiClient } from "@/lib/apiClient";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const MotionButton = motion(Button);

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const fetchUsers = async (params: any) => {
  const searchParams = new URLSearchParams();

  // Build query params
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const response = await apiClient(
    `/api/v1/admin/bulk/users?${searchParams.toString()}`
  );
  // const data = await response.json();
  return response.data;
};

export default function UsersPage() {
  // const [users, setUsers] = useState<IUser[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showWriterRequests, setShowWriterRequests] = useState(false);
  const [filters, setFilters] = useState<PostsParams>({
    page: 1,
    limit: 10,
    search: "",
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 800);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearchQuery }));
  }, [debouncedSearchQuery]);

  const setSearch = (query: string) => {
    setSearchQuery(query);
  };

  const queryClient = useQueryClient();

  const { data, isLoading }: any = useQuery({
    queryKey: ["users", filters],
    queryFn: () => fetchUsers(filters),
  });

  const { users = [], pagination } = data || {};

  const handleAddUser = (data: UserFormValues) => {
    const newUser: IUser = {
      id: (users.length + 1).toString(),
      ...data,
      has_email_verified: false,
      birth_date: null,
      avatar: "/placeholder.svg?height=40&width=40",
      profile_banner: null,
      is_disabled: false,
      last_login_at: new Date(),
      has_password: true,
      is_creator: false,
      ip_address: "0.0.0.0",
      created_at: new Date(),
      updated_at: new Date(),
    };
    // setUsers([...users, newUser]);
    setIsAddDialogOpen(false);
  };

  const handleEditUser = (data: UserFormValues) => {
    if (!selectedUser) return;
    queryClient.invalidateQueries({ queryKey: ["users"] });
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  const deleteUsersMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await apiClient("/api/v1/admin/bulk/users", {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    },
  });

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUsersMutation.mutate([selectedUser._id]);
  };

  const handleApproveWriter = async (userId: string) => {
    try {
      await apiClient(`/api/v1/admin/writer-request/${userId}`, {
        method: "DELETE",
        body: JSON.stringify({ decision: "approved" }),
      });
      queryClient.invalidateQueries({ queryKey: ["writer-request"] });
    } catch (error) {
      console.error("Error approving writer request:", error);
    }
  };

  const handleRejectWriter = async (userId: string) => {
    try {
      await apiClient(`/api/v1/admin/writer-request/${userId}`, {
        method: "DELETE",
        body: JSON.stringify({ decision: "rejected" }),
      });
      queryClient.invalidateQueries({ queryKey: ["writer-request"] });
    } catch (error) {
      console.error("Error rejecting writer request:", error);
    }
  };

  return (
    <div className="">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all users
          </p>
        </div>
        <div className="flex space-x-2">
          <MotionButton
            onClick={() => setIsAddDialogOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add User
          </MotionButton>
          <MotionButton
            onClick={() => setShowWriterRequests(!showWriterRequests)}
            variant="outline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showWriterRequests ? "Hide" : "Show"} Writer Requests
          </MotionButton>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="relative flex-grow">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(value: UserRole | "all") => setRoleFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <FiFilter className="mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="writer">Writer</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white shadow-xl rounded-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {users.map((user) => (
                  <motion.tr
                    key={user._id.toString()}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.avatar ?? undefined}
                            alt={user.display_name}
                          />
                          <AvatarFallback>
                            {user.display_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-indigo-800/90">
                            {user.display_name}
                          </div>
                          <div className="text-sm text-indigo-900/60">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        className="mr-2"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <Pagination className="p-4">
          <PaginationContent className="w-full flex items-center justify-between">
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer"
                onClick={() => {
                  if (filters.page === 1) return;
                  setFilters((prev) => ({
                    ...prev,
                    page: prev.page - 1,
                  }));
                }}
              />
            </PaginationItem>
            {/* {Array.from({
                  length: pagination.totalPages || 0,
                }).map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      isActive={filters.page === i + 1}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: i + 1 }))
                      }
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))} */}
            <PaginationItem>
              <PaginationNext
                className="cursor-pointer"
                onClick={() => {
                  if (!pagination.hasMore) return;
                  setFilters((prev) => ({
                    ...prev,
                    page: prev.page + 1,
                  }));
                }}
                // disabled={filters.page === articlesData?.meta?.totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </motion.div>

      <AnimatePresence>
        {showWriterRequests && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-12 overflow-hidden"
          >
            <WriterRequests
              onApprove={handleApproveWriter}
              onReject={handleRejectWriter}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <UserForm
            onSubmit={handleAddUser}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <UserForm
            initialData={selectedUser ?? undefined}
            onSubmit={handleEditUser}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
