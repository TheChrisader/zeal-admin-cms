// src/api/users.js
// import { sleep } from '../utils';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data
let users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    lastLogin: "2024-03-19T15:30:00Z",
  },
  // ... more mock users
].concat(
  Array.from({ length: 20 }, (_, i) => ({
    id: i + 2,
    name: `User ${i + 2}`,
    email: `user${i + 2}@example.com`,
    role: i % 3 === 0 ? "moderator" : "user",
    status: i % 5 === 0 ? "inactive" : "active",
    createdAt: new Date(2024, 0, i + 1).toISOString(),
    lastLogin: new Date(2024, 2, i + 1).toISOString(),
  }))
);

export const userApi = {
  getUsers: async ({
    page = 1,
    perPage = 10,
    search = "",
    filters = {},
  }: {
    page?: number;
    perPage?: number;
    search?: string;
    filters?: any;
  }) => {
    await sleep(1000); // Simulate API delay

    let filteredUsers = [...users];

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    if (filters.role) {
      filteredUsers = filteredUsers.filter(
        (user) => user.role === filters.role
      );
    }
    if (filters.status) {
      filteredUsers = filteredUsers.filter(
        (user) => user.status === filters.status
      );
    }

    // Calculate pagination
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;

    return {
      users: filteredUsers.slice(start, end),
      pagination: {
        total,
        totalPages,
        currentPage: page,
        perPage,
      },
    };
  },

  getUser: async (id: number) => {
    await sleep(500);
    const user = users.find((u) => u.id === id);
    if (!user) throw new Error("User not found");
    return user;
  },

  createUser: async (userData: any) => {
    await sleep(1000);
    const newUser = {
      id: users.length + 1,
      ...userData,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };
    users = [...users, newUser];
    return newUser;
  },

  updateUser: async (id: number, userData: any) => {
    await sleep(1000);
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("User not found");

    const updatedUser = {
      ...users[index],
      ...userData,
    };
    users = [...users.slice(0, index), updatedUser, ...users.slice(index + 1)];
    return updatedUser;
  },

  deleteUser: async (id: number) => {
    await sleep(1000);
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("User not found");
    users = users.filter((u) => u.id !== id);
    return true;
  },
};
