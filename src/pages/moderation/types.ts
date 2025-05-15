export type Permission =
  | "CREATE_ADMIN"
  | "MODIFY_ADMIN"
  | "DELETE_ADMIN"
  | "REVIEW_CONTENT"
  | "APPROVE_CONTENT"
  | "DELETE_CONTENT";

export type Role = "SUPER_ADMIN" | "ADMIN" | "MODERATOR";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: Permission[];
  createdAt: string;
  lastLogin: string;
}

export interface FlaggedContent {
  id: string;
  contentType: "ARTICLE" | "COMMENT";
  contentId: string;
  contentPreview: string;
  reportCount: number;
  reportReasons: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  flaggedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
