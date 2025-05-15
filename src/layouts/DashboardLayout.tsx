import React from "react";
import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import {
  LayoutGrid,
  Users,
  FileText,
  Flag,
  UserCog,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  User,
  Bell,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const DashboardLayout = () => {
  const { user, logout, hasPermission } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    {
      name: "Dashboard",
      icon: LayoutGrid,
      href: "/",
      permission: null,
    },
    {
      name: "Articles",
      icon: FileText,
      href: "/articles",
      permission: "posts:read",
    },
    {
      name: "Users",
      icon: Users,
      href: "/users",
      permission: "users:read",
    },
    {
      name: "Moderators",
      icon: UserCog,
      href: "/moderators",
      permission: "admin:all",
    },
    {
      name: "Flagged Content",
      icon: Flag,
      href: "/flagged-content",
      permission: "admin:all",
      // badge: "0", // This would be dynamic in production
    },
    {
      name: "Global Settings",
      icon: Settings,
      href: "/settings",
      permission: "admin:all",
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-2">
      <div>
        <div className="flex h-16 items-center px-4 gap-2">
          {/* <img src="/api/placeholder/32/32" alt="Logo" className="h-8 w-8" /> */}
          {!isSidebarCollapsed && (
            <span className="text-xl font-bold">Admin Panel</span>
          )}
        </div>
        <Separator />
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 py-2">
          {navigation.map((item) => {
            if (item.permission && !hasPermission(item.permission)) return null;

            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full gap-2 ${
                    isSidebarCollapsed
                      ? "px-2 justify-center"
                      : "px-4 justify-start"
                  }`}
                >
                  <Icon size={20} />
                  {!isSidebarCollapsed && (
                    <span className="flex-1 text-left">{item.name}</span>
                  )}
                  {!isSidebarCollapsed && item.badge && (
                    <Badge variant="secondary">{item.badge}</Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>
      <Separator />
      <div className="p-2">
        <Button
          variant="ghost"
          className="w-full justify-center"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>
    </div>
  );

  // Generate breadcrumbs from current location
  const breadcrumbs = location.pathname
    .split("/")
    .filter(Boolean)
    .map((path, index, array) => ({
      name: path.charAt(0).toUpperCase() + path.slice(1),
      href: "/" + array.slice(0, index + 1).join("/"),
      current: index === array.length - 1,
    }));

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r bg-background ${
          isSidebarCollapsed ? "w-16" : "w-min"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden absolute left-3 top-3">
            <LayoutGrid />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className={`w-min p-0 ${isSidebarCollapsed ? "w-min" : "w-fit"}`}
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-background flex items-center justify-between px-4">
          {/* <div className="flex items-center gap-2"> */}
          {/* Breadcrumbs */}
          <nav className="flex items-center max-[768px]:ml-12">
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.href}>
                {index > 0 && (
                  // escape >
                  <span className="mx-1 text-muted-foreground"> &gt;</span>
                )}
                <Link
                  to={breadcrumb.href}
                  className={`text-sm ${
                    breadcrumb.current
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {breadcrumb.name}
                </Link>
              </React.Fragment>
            ))}
          </nav>
          {/* </div> */}

          <div className="flex items-center gap-4">
            {/* Notifications */}
            {/* <Button variant="ghost" size="icon">
              <Bell size={20} />
            </Button> */}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User size={20} />
                  <span className="hidden md:inline">{user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem> */}
                {/* <DropdownMenuSeparator /> */}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-accent/10 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
