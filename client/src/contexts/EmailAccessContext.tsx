import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

type AccessStatus = "checking" | "none" | "approved" | "pending";

interface EmailAccessState {
  email: string | null;
  status: AccessStatus;
  setAccess: (email: string, approved: boolean) => void;
  clearAccess: () => void;
}

const EmailAccessContext = createContext<EmailAccessState>({
  email: null,
  status: "checking",
  setAccess: () => {},
  clearAccess: () => {},
});

const STORAGE_KEY = "lm_access_email";
const STATUS_KEY = "lm_access_status";

export function EmailAccessProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<AccessStatus>("checking");

  useEffect(() => {
    const storedEmail = localStorage.getItem(STORAGE_KEY);
    const storedStatus = localStorage.getItem(STATUS_KEY);
    
    if (storedEmail && storedStatus === "approved") {
      setEmail(storedEmail);
      setStatus("approved");
    } else if (storedEmail && storedStatus === "pending") {
      setEmail(storedEmail);
      setStatus("pending");
    } else {
      setStatus("none");
    }
  }, []);

  const setAccess = useCallback((newEmail: string, approved: boolean) => {
    const normalizedEmail = newEmail.toLowerCase().trim();
    setEmail(normalizedEmail);
    const newStatus = approved ? "approved" : "pending";
    setStatus(newStatus);
    localStorage.setItem(STORAGE_KEY, normalizedEmail);
    localStorage.setItem(STATUS_KEY, newStatus);
  }, []);

  const clearAccess = useCallback(() => {
    setEmail(null);
    setStatus("none");
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STATUS_KEY);
  }, []);

  return (
    <EmailAccessContext.Provider value={{ email, status, setAccess, clearAccess }}>
      {children}
    </EmailAccessContext.Provider>
  );
}

export function useEmailAccess() {
  return useContext(EmailAccessContext);
}
