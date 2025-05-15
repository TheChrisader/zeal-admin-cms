import { User, FlaggedContent, Permission, Role } from "../types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  async fetchUsers(): Promise<User[]> {
    await delay(500);
    return [
      {
        id: "1",
        email: "admin@example.com",
        name: "John Admin",
        role: "ADMIN",
        permissions: ["CREATE_ADMIN", "MODIFY_ADMIN", "REVIEW_CONTENT"],
        createdAt: "2024-01-01T00:00:00Z",
        lastLogin: "2024-03-20T10:00:00Z",
      },
      // Add more mock users as needed
    ];
  },

  async fetchFlaggedContent(): Promise<FlaggedContent[]> {
    await delay(500);
    return [
      {
        id: "1",
        contentType: "ARTICLE",
        contentId: "article-123",
        contentPreview: "This article contains inappropriate content...",
        reportCount: 5,
        reportReasons: ["spam", "inappropriate"],
        status: "PENDING",
        flaggedAt: "2024-03-19T15:00:00Z",
      },
      // Add more mock flagged content as needed
    ];
  },

  async updateUserRole(userId: string, role: Role): Promise<User> {
    await delay(500);
    // Simulate API call
    return {} as User;
  },

  async updateUserPermissions(
    userId: string,
    permissions: Permission[]
  ): Promise<User> {
    await delay(500);
    // Simulate API call
    return {} as User;
  },

  async updateContentStatus(
    contentId: string,
    status: "APPROVED" | "REJECTED"
  ): Promise<FlaggedContent> {
    await delay(500);
    // Simulate API call
    return {} as FlaggedContent;
  },
};
