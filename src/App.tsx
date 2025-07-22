import React, { useCallback, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/Dashboard";
import ArticlesListPage from "./pages/articles/ArticlesListPage";
import ArticleDetailPage from "./pages/articles/ArticleDetailPage";
import UsersListPage from "./pages/users/UsersListPage";
// import UserDetailPage from './pages/users/UserDetailPage';
import ModeratorManagementPage from "./pages/admin/ModeratorManagementPage";
import FlaggedContentPage from "./pages/moderation/FlaggedContentPage";
import SystemSettingsPage from "./pages/settings/SystemSettingsPage";
import ArticleCreationPage from "./pages/articles/ArticleCreationPage";
import { Toaster } from "sonner";
import useLocalStorage from "./hooks/useLocalStorage";
import { apiClient } from "./lib/apiClient";
import ArticleViewPage from "./pages/articles/ArticleViewPage";
import FreelanceArticlesListPage from "./pages/freelance/FreelanceArticlesListPage";
import FreelanceArticleDetailPage from "./pages/freelance/FreelanceArticleDetailPage";
import FreelanceArticleViewPage from "./pages/freelance/FreelanceArticleViewPage";

const AuthContext = React.createContext<null | {
  user: any;
  token: string | null;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  checkAuth: () => Promise<void>;
}>(null);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useLocalStorage("token", null);

  const checkAuth = async () => {
    try {
      const session = await apiClient("/api/v1/admin/auth/session");
      // const session = await response.json();
      setUser(session);
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    const response: any = await apiClient(`/api/v1/admin/auth/signin`, {
      method: "POST",
      body: JSON.stringify(credentials),
      headers: {
        "Content-Type": "application/json",
      },
    });
    // const response = await response.json();
    // if (!response.ok) {
    //   throw new Error(data.message || "Login failed");
    // }
    setUser(response.user);
    setToken(response.token);
    return response;
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  const hasPermission = (permission: string) => {
    return (
      user?.permissions?.includes(permission) ||
      user?.permissions?.includes("admin:all")
    );
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, token, hasPermission, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute = ({
  children,
  requiredPermission,
}: {
  children: React.ReactNode;
  requiredPermission?: string;
}) => {
  const { hasPermission, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                {/* <Route index element={<Navigate to="/articles" replace />} /> */}

                <Route
                  path="articles"
                  element={
                    <ProtectedRoute requiredPermission="articles:read">
                      <ArticlesListPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="articles/new"
                  element={
                    <ProtectedRoute requiredPermission="articles:write">
                      <ArticleCreationPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="articles/:id"
                  element={
                    <ProtectedRoute requiredPermission="articles:read">
                      <ArticleViewPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="articles/:id/edit"
                  element={
                    <ProtectedRoute requiredPermission="articles:write">
                      <ArticleDetailPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="users"
                  element={
                    <ProtectedRoute requiredPermission="users:read">
                      <UsersListPage />
                    </ProtectedRoute>
                  }
                />

                {/* <Route
                path="users/:id"
                element={
                  <ProtectedRoute requiredPermission="users.read">
                    <UserDetailPage />
                  </ProtectedRoute>
                }
              /> */}

                <Route
                  path="moderators"
                  element={
                    <ProtectedRoute requiredPermission="admin:all">
                      <ModeratorManagementPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="flagged-content"
                  element={
                    <ProtectedRoute requiredPermission="articles:read">
                      <FlaggedContentPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="settings"
                  element={
                    <ProtectedRoute requiredPermission="settings:write">
                      <SystemSettingsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="moderation/freelance/posts"
                  element={
                    <ProtectedRoute requiredPermission="freelance_post:read">
                      <FreelanceArticlesListPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="moderation/freelance/posts/:id"
                  element={
                    <ProtectedRoute requiredPermission="freelance_post:write">
                      <FreelanceArticleDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* <Route
                  path="moderation/freelance/posts/:id/edit"
                  element={
                    <ProtectedRoute requiredPermission="articles.read">
                      <FreelanceArticleDetailPage />
                    </ProtectedRoute>
                  }
                /> */}
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster />
    </>
  );
};

export default App;
