import { ReactNode } from "react";
import { usePermissions } from "./hooks/usePermissions";
import { Permission } from "./types";

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission: Permission;
  fallback?: ReactNode;
}

export const PermissionGuard = ({
  children,
  requiredPermission,
  fallback = null,
}: PermissionGuardProps) => {
  const { data: permissions, isLoading } = usePermissions();

  if (isLoading) return null;

  if (!permissions?.includes(requiredPermission)) {
    return fallback;
  }

  return <>{children}</>;
};
