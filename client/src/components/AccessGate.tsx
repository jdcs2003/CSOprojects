import { useEmailAccess } from "@/contexts/EmailAccessContext";
import { useLocation } from "wouter";
import { useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";

/**
 * Wraps protected content and redirects to login if not approved.
 * Also checks for Manus OAuth auth as a fallback (for the owner).
 */
export default function AccessGate({ children }: { children: ReactNode }) {
  const { status } = useEmailAccess();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (status === "none" || status === "pending") {
      navigate("/");
    }
  }, [status, navigate]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status !== "approved") {
    return null;
  }

  return <>{children}</>;
}
