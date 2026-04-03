import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  LogOut,
  Menu,
  ClipboardList,
  DollarSign,
  X,
  PanelLeftClose,
  PanelLeft,
  Calculator,
  Plug,
  BarChart3,
  FileSignature,
} from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "@/lib/trpc";
import type { PermissionMap } from "@shared/permissions";

type PermissionKey = keyof PermissionMap;

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  permission?: PermissionKey; // If set, only show when user has this permission
  alwaysShow?: boolean; // Dashboard always shows
}

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { data: user } = trpc.auth.me.useQuery();
  const { data: adminAccess } = trpc.admin.checkAdminAccess.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  // Detect mobile/desktop
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Auto-open sidebar on desktop, auto-close on mobile
      setSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar on navigation on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  const allNavItems: NavItem[] = [
    { path: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, alwaysShow: true },
    { path: "/admin/calculator", label: "Pricing Calculator", icon: <Calculator className="h-5 w-5" />, permission: "pricing" },
    { path: "/admin/pipeline", label: "Sales Pipeline", icon: <ClipboardList className="h-5 w-5" />, permission: "pipeline" },
    { path: "/admin/capacity", label: "Capacity Tracking", icon: <BarChart3 className="h-5 w-5" />, permission: "capacity" },
    { path: "/admin/proposals", label: "Locked Proposals", icon: <FileText className="h-5 w-5" />, permission: "proposals" },
    { path: "/admin/proposals/generate-contract", label: "Generate Contract", icon: <FileSignature className="h-5 w-5" />, permission: "proposals" },
    { path: "/admin/users", label: "User Management", icon: <Users className="h-5 w-5" />, permission: "userManagement" },
    { path: "/admin/integrations", label: "Integrations", icon: <Plug className="h-5 w-5" />, permission: "integrations" },
  ];

  const visibleNavItems = useMemo(() => {
    if (!adminAccess?.permissions) return allNavItems.filter(item => item.alwaysShow);
    
    return allNavItems.filter(item => {
      if (item.alwaysShow) return true;
      if (!item.permission) return true;
      return (adminAccess.permissions as Record<string, boolean>)[item.permission];
    });
  }, [adminAccess?.permissions]);

  const roleBadge = useMemo(() => {
    if (!adminAccess) return null;
    if (adminAccess.isOwner) return <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">Owner</span>;
    if (adminAccess.isSuperAdmin) return <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">Super Admin</span>;
    if (adminAccess.role === "admin") return <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">Admin</span>;
    return null;
  }, [adminAccess]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Prevent admin pages from being indexed */}
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ${
          sidebarOpen ? "w-64" : isMobile ? "-translate-x-full w-64" : "w-16"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center gap-2 min-w-0">
              <DollarSign className="h-6 w-6 text-blue-600 shrink-0" />
              <span className="font-bold text-sm text-gray-900 truncate">CSO Pricing</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              isMobile ? <X className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Nav Items */}
        <nav className="p-2 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
          {visibleNavItems.map((item) => {
            const isActive = location === item.path || 
              (item.path !== "/admin" && location.startsWith(item.path));
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  } ${!sidebarOpen && !isMobile ? "justify-center" : ""}`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {sidebarOpen && <span className="text-sm truncate">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-3">
          {sidebarOpen ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs shrink-0">
                  {user?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                  <div className="flex items-center gap-1">
                    {roleBadge}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-500 hover:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="w-full text-gray-500 hover:text-red-600"
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 min-h-screen ${
          sidebarOpen && !isMobile ? "ml-64" : isMobile ? "ml-0" : "ml-16"
        }`}
      >
        {/* Mobile Header */}
        {isMobile && (
          <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <DollarSign className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-sm">CSO Pricing Dashboard</span>
          </header>
        )}

        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
