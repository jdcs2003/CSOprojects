import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
// Permission keys for type safety
type PermissionKey = "pricing" | "pipeline" | "capacity" | "proposals" | "userManagement" | "integrations";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: PermissionKey;
}

/**
 * Wraps protected admin content.
 * Checks: 1) Logged in 2) Has admin access 3) Tutorial completed 4) Has required permission
 * Redirects to tutorial if not completed, to login if not authenticated.
 */
export default function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  const { data: adminAccess, isLoading: adminLoading } = trpc.admin.checkAdminAccess.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    // Not logged in → redirect to login
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    // Has admin access but tutorial not completed → redirect to tutorial
    if (adminAccess && adminAccess.hasAccess && !adminAccess.tutorialCompleted) {
      navigate("/tutorial");
    }
  }, [adminAccess, navigate]);

  // Loading states
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Not admin → show access pending
  if (adminAccess && !adminAccess.hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Loader2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold">Access Pending</h2>
          <p className="text-muted-foreground">
            Your account is registered but you don't have admin access yet. 
            Please contact your administrator or email <a href="mailto:j.stenson@summitskiesinc.com" className="text-primary hover:underline font-medium">j.stenson@summitskiesinc.com</a> to request access.
          </p>
          <p className="text-sm text-muted-foreground">
            Logged in as: {user?.email || user?.name}
          </p>
        </div>
      </div>
    );
  }

  // Tutorial not completed → handled by useEffect redirect above
  if (adminAccess && !adminAccess.tutorialCompleted) {
    return null;
  }

  // Check specific permission if required
  if (requiredPermission && adminAccess?.permissions) {
    const perms = adminAccess.permissions as Record<string, boolean>;
    if (!perms[requiredPermission]) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md text-center space-y-4">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this section. Contact your administrator to request access.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
