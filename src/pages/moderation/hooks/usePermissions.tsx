import { useQuery } from "@tanstack/react-query";
import { Permission } from "../types";

export const usePermissions = () => {
  return useQuery({
    queryKey: ["currentUserPermissions"],
    queryFn: async (): Promise<Permission[]> => {
      const response = await fetch("/api/me/permissions");
      if (!response.ok) throw new Error("Failed to fetch permissions");
      return response.json();
    },
  });
};
