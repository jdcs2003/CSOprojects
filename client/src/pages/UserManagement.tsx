import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Users, 
  Shield, 
  UserPlus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Lock,
  Crown,
  Mail,
  Copy,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";
import AdminLayout from "@/components/AdminLayout";

const OWNER_EMAIL = "j.stenson@summitskiesinc.com";

const PERMISSION_KEYS = [
  "pricing",
  "pipeline",
  "capacity",
  "proposals",
  "userManagement",
  "integrations",
] as const;

const PERMISSION_LABELS: Record<string, string> = {
  pricing: "Pricing Calculator & Quotes",
  pipeline: "Sales Pipeline Management",
  capacity: "Capacity Tracking",
  proposals: "Locked Proposals",
  userManagement: "User Management",
  integrations: "Integrations",
};

const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  pricing: "Create and manage pricing calculator quotes",
  pipeline: "View and manage the sales pipeline and deal tracking",
  capacity: "View and manage facility capacity tracking",
  proposals: "View locked proposals and generated PDFs",
  userManagement: "Manage user roles and permissions",
  integrations: "Manage integrations (HubSpot, QuickBooks)",
};

const PROFILE_OPTIONS = [
  { value: "full_admin", label: "Full Admin", description: "Full access to all sections" },
  { value: "finance_admin", label: "Finance Admin", description: "Proposals (read-only), pipeline, QuickBooks" },
  { value: "onboarding_manager", label: "Onboarding Manager", description: "Proposals (read-only), pipeline, capacity" },
  { value: "sales_rep", label: "Sales Rep", description: "Pricing, pipeline, proposals" },
  { value: "none", label: "Custom", description: "Select individual permissions" },
];

const PROFILE_PERMISSIONS: Record<string, Record<string, boolean>> = {
  full_admin: { pricing: true, pipeline: true, capacity: true, proposals: true, userManagement: true, integrations: true },
  finance_admin: { pricing: false, pipeline: true, capacity: false, proposals: true, userManagement: false, integrations: true },
  onboarding_manager: { pricing: false, pipeline: true, capacity: true, proposals: true, userManagement: false, integrations: false },
  sales_rep: { pricing: true, pipeline: true, capacity: false, proposals: true, userManagement: false, integrations: false },
};

function getUserPermissions(user: any) {
  const perms: Record<string, boolean> = {};
  if (!user.permissions) {
    PERMISSION_KEYS.forEach(k => { perms[k] = false; });
    return perms;
  }
  PERMISSION_KEYS.forEach(k => {
    perms[k] = user.permissions[k] === 1 || user.permissions[k] === true;
  });
  return perms;
}

export default function UserManagement() {
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  
  // Invite flow state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("admin");
  const [inviteProfile, setInviteProfile] = useState<string>("full_admin");
  const [inviteCustomPerms, setInviteCustomPerms] = useState<Record<string, boolean>>({
    pricing: false, pipeline: false, capacity: false, proposals: false, userManagement: false, integrations: false,
  });
  const [showWelcomeEmail, setShowWelcomeEmail] = useState(false);
  const [welcomeEmailData, setWelcomeEmailData] = useState<{ subject: string; content: string; to: string } | null>(null);

  const { data: adminAccess } = trpc.admin.checkAdminAccess.useQuery();
  const { data: allUsers, refetch: refetchUsers } = trpc.admin.getAllUsers.useQuery();
  const { data: authorizedEmails, refetch: refetchAuthorized } = trpc.admin.getAllAuthorizedEmails.useQuery(
    undefined,
    { enabled: adminAccess?.isSuperAdmin || adminAccess?.isOwner || !!(adminAccess?.permissions as any)?.userManagement }
  );

  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { toast.success("Role updated"); refetchUsers(); },
    onError: (e: any) => toast.error(e.message),
  });

  const updatePermissions = trpc.admin.updateUserPermissions.useMutation({
    onSuccess: () => { toast.success("Permissions updated"); refetchUsers(); },
    onError: (e: any) => toast.error(e.message),
  });

  const addAuthorized = trpc.admin.addAuthorizedEmail.useMutation({
    onSuccess: (data: any) => { 
      toast.success("User invited successfully!"); 
      refetchAuthorized();
      // Generate welcome email
      generateWelcomeEmail();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removeAuthorized = trpc.admin.removeAuthorizedEmail.useMutation({
    onSuccess: () => { toast.success("Email removed"); refetchAuthorized(); },
    onError: (e: any) => toast.error(e.message),
  });

  const isSuperAdmin = adminAccess?.isSuperAdmin || adminAccess?.isOwner || false;
  const isOwner = adminAccess?.isOwner || false;
  const hasUserMgmt = (adminAccess?.permissions as any)?.userManagement || isSuperAdmin;

  const canEditUser = (user: any) => {
    if (user.email === OWNER_EMAIL) return false;
    if (isOwner) return true;
    if (isSuperAdmin && user.role !== 'super_admin') return true;
    return false;
  };

  const canEditPermissions = (user: any) => {
    if (user.email === OWNER_EMAIL || user.role === 'super_admin') return false;
    if (isOwner || isSuperAdmin) return true;
    return hasUserMgmt;
  };

  const getRoleOptions = () => {
    const options = [
      { value: "user", label: "User (No Access)" },
      { value: "admin", label: "Admin" },
      { value: "client", label: "Client" },
    ];
    if (isOwner) {
      options.push({ value: "super_admin", label: "Super Admin" });
    }
    return options;
  };

  const getRoleBadge = (role: string, email: string | null) => {
    if (email === OWNER_EMAIL) return <Badge className="bg-amber-500 hover:bg-amber-600 text-white"><Crown className="h-3 w-3 mr-1" />Owner</Badge>;
    switch (role) {
      case "super_admin": return <Badge className="bg-purple-500 hover:bg-purple-600 text-white">Super Admin</Badge>;
      case "admin": return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Admin</Badge>;
      case "client": return <Badge className="bg-green-500 hover:bg-green-600 text-white">Client</Badge>;
      default: return <Badge variant="secondary">User</Badge>;
    }
  };

  const handlePermissionToggle = (userId: number, key: string, currentValue: boolean) => {
    updatePermissions.mutate({
      userId,
      permissions: { [key]: !currentValue },
    });
  };

  const handleToggleAllPermissions = (userId: number, grantAll: boolean) => {
    const perms: Record<string, boolean> = {};
    PERMISSION_KEYS.forEach(k => { perms[k] = grantAll; });
    updatePermissions.mutate({ userId, permissions: perms });
  };

  const handleInviteSubmit = () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    const customPerms = inviteProfile === "none" ? inviteCustomPerms : undefined;

    addAuthorized.mutate({
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole as any,
      permissionProfile: inviteProfile as any,
      customPermissions: customPerms,
    });
  };

  const generateWelcomeEmail = () => {
    const firstName = inviteName || inviteEmail.split("@")[0];
    const profileLabels: Record<string, string> = {
      full_admin: "Admin (full access to proposals, pricing, pipeline, and more)",
      finance_admin: "Finance Admin - you can view proposals (read-only), view the pipeline, export data, and install QuickBooks integration",
      onboarding_manager: "Onboarding Manager - you can view proposals (read-only), manage the onboarding pipeline, edit capacity tracking, and export data",
      sales_rep: "Sales Rep - you can create pricing quotes, manage the pipeline, and view proposals",
      none: inviteRole === "admin" ? "Admin" : inviteRole === "client" ? "Client" : "User",
    };

    const accessLevel = profileLabels[inviteProfile || "none"];

    const subject = "Welcome to the CSO Pricing Dashboard - Quick Start Guide";
    const content = `Hey ${firstName},

You have been set up with access to the CSO Pricing Dashboard. This is the tool we are using for pricing proposals, contract generation, and pipeline management.

When you first log in, there is a short tutorial you will need to go through before you can access everything. It is quick and covers the basics so you know where things are.

Log in here with your L&M Google account:
https://pricingdashboard.manus.space

Your access level: ${accessLevel}

Let me know if you have any questions.

- Jim`;

    setWelcomeEmailData({ subject, content, to: inviteEmail.trim() });
    setShowWelcomeEmail(true);
  };

  const copyWelcomeEmail = () => {
    if (welcomeEmailData) {
      navigator.clipboard.writeText(`Subject: ${welcomeEmailData.subject}\nTo: ${welcomeEmailData.to}\n\n${welcomeEmailData.content}`);
      toast.success("Welcome email copied to clipboard!");
    }
  };

  const resetInviteForm = () => {
    setInviteEmail("");
    setInviteName("");
    setInviteRole("admin");
    setInviteProfile("full_admin");
    setInviteCustomPerms({
      pricing: false, pipeline: false, capacity: false, proposals: false, userManagement: false, integrations: false,
    });
    setShowWelcomeEmail(false);
    setWelcomeEmailData(null);
    setInviteOpen(false);
  };

  // Get pending invites (authorized emails that haven't logged in yet)
  const registeredEmails = new Set((allUsers || []).map((u: any) => u.email?.toLowerCase()));
  const pendingInvites = (authorizedEmails || []).filter((a: any) => !registeredEmails.has(a.email?.toLowerCase()));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/internal">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage user roles and permissions for the CSO Pricing Dashboard</p>
            </div>
          </div>
          
          {hasUserMgmt && (
            <Dialog open={inviteOpen} onOpenChange={(open) => { if (!open) resetInviteForm(); setInviteOpen(open); }}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                {!showWelcomeEmail ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>Invite New User</DialogTitle>
                      <DialogDescription>
                        Pre-authorize a user with a role and permissions. They'll receive these when they first log in.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Email Address *</Label>
                          <Input
                            placeholder="user@lmwarehousing.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>First Name (for email)</Label>
                          <Input
                            placeholder="e.g. Matt"
                            value={inviteName}
                            onChange={(e) => setInviteName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            {isOwner && <SelectItem value="super_admin">Super Admin</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Permission Profile</Label>
                        <Select value={inviteProfile} onValueChange={(v) => {
                          setInviteProfile(v);
                          if (v !== "none" && PROFILE_PERMISSIONS[v]) {
                            setInviteCustomPerms({ ...PROFILE_PERMISSIONS[v] });
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROFILE_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <div>
                                  <span className="font-medium">{opt.label}</span>
                                  <span className="text-xs text-muted-foreground ml-2">— {opt.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Show permissions preview or custom selector */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Permissions</Label>
                          {inviteProfile === "none" && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => {
                                const all: Record<string, boolean> = {};
                                PERMISSION_KEYS.forEach(k => { all[k] = true; });
                                setInviteCustomPerms(all);
                              }}>Select All</Button>
                              <Button variant="outline" size="sm" onClick={() => {
                                const none: Record<string, boolean> = {};
                                PERMISSION_KEYS.forEach(k => { none[k] = false; });
                                setInviteCustomPerms(none);
                              }}>Clear All</Button>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {PERMISSION_KEYS.map((key) => {
                            const isChecked = inviteProfile === "none" 
                              ? inviteCustomPerms[key] 
                              : (PROFILE_PERMISSIONS[inviteProfile]?.[key] || false);
                            const isDisabled = inviteProfile !== "none";
                            return (
                              <div
                                key={key}
                                className={`flex items-center gap-2 p-2 rounded border text-sm ${
                                  isChecked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  disabled={isDisabled}
                                  onCheckedChange={(checked) => {
                                    if (inviteProfile === "none") {
                                      setInviteCustomPerms(prev => ({ ...prev, [key]: !!checked }));
                                    }
                                  }}
                                />
                                <span className={isDisabled ? 'text-muted-foreground' : ''}>
                                  {PERMISSION_LABELS[key]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={resetInviteForm}>Cancel</Button>
                      <Button onClick={handleInviteSubmit} disabled={addAuthorized.isPending}>
                        {addAuthorized.isPending ? "Inviting..." : "Invite & Generate Email"}
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        User Invited Successfully
                      </DialogTitle>
                      <DialogDescription>
                        Send this welcome email to {welcomeEmailData?.to}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Subject</Label>
                        <div className="p-2 bg-muted rounded text-sm">{welcomeEmailData?.subject}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Email Content</Label>
                        <div className="p-3 bg-muted rounded text-sm whitespace-pre-wrap font-mono text-xs leading-relaxed max-h-64 overflow-y-auto">
                          {welcomeEmailData?.content}
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="flex gap-2">
                      <Button variant="outline" onClick={copyWelcomeEmail}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Email
                      </Button>
                      <Button variant="outline" onClick={() => {
                        if (welcomeEmailData) {
                          const mailtoLink = `mailto:${welcomeEmailData.to}?subject=${encodeURIComponent(welcomeEmailData.subject)}&body=${encodeURIComponent(welcomeEmailData.content)}`;
                          window.open(mailtoLink, '_blank');
                        }
                      }}>
                        <Mail className="h-4 w-4 mr-2" />
                        Open in Email Client
                      </Button>
                      <Button onClick={resetInviteForm}>Done</Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Pending Invites */}
        {hasUserMgmt && pendingInvites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5" />
                Pending Invites
                <Badge variant="secondary">{pendingInvites.length}</Badge>
              </CardTitle>
              <CardDescription>
                Users who have been invited but haven't logged in yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvites.map((invite: any) => {
                      let permCount = 0;
                      if (invite.preAssignedPermissions) {
                        try {
                          const perms = JSON.parse(invite.preAssignedPermissions);
                          permCount = Object.values(perms).filter(Boolean).length;
                        } catch {}
                      }
                      return (
                        <TableRow key={invite.id}>
                          <TableCell className="font-medium">{invite.email}</TableCell>
                          <TableCell>{getRoleBadge(invite.role, null)}</TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {permCount > 0 ? `${permCount} permissions` : "No pre-assigned"}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{invite.createdBy}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAuthorized.mutate({ id: invite.id })}
                              disabled={removeAuthorized.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registered Users with Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Registered Users & Permissions
            </CardTitle>
            <CardDescription>
              {hasUserMgmt 
                ? "Manage roles and configure granular permissions for each admin user"
                : "View registered users and their access levels"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allUsers && allUsers.length > 0 ? (
              <div className="space-y-2">
                {allUsers.map((user: any) => {
                  const isExpanded = expandedUserId === user.id;
                  const perms = getUserPermissions(user);
                  const permCount = PERMISSION_KEYS.filter(k => perms[k]).length;
                  const isUserOwner = user.email === OWNER_EMAIL;
                  const isUserSuperAdmin = user.role === "super_admin";
                  const editable = canEditUser(user);
                  const permsEditable = canEditPermissions(user);
                  const isNeedsReview = user.role === "user" && permCount === 0 && !isUserOwner;
                  const isAutoApprovedDomain = user.email && (user.email.endsWith("@summitskiesinc.com") || user.email.endsWith("@lmwarehousing.com"));

                  return (
                    <div key={user.id} className="border rounded-lg overflow-hidden">
                      <div 
                        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors ${isExpanded ? 'bg-muted/30' : ''}`}
                        onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{user.name || "—"}</span>
                              {getRoleBadge(user.role, user.email)}
                              {isNeedsReview && !isAutoApprovedDomain && (
                                <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs animate-pulse">
                                  Needs Review
                                </Badge>
                              )}
                              {isNeedsReview && isAutoApprovedDomain && (
                                <Badge variant="outline" className="text-xs">
                                  Holding — Needs Provisioning
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {user.role === "admin" && (
                            <span className="text-xs text-muted-foreground hidden sm:block">
                              {permCount}/{PERMISSION_KEYS.length} permissions
                            </span>
                          )}
                          {(isUserOwner || isUserSuperAdmin) && (
                            <span className="text-xs text-muted-foreground hidden sm:block">
                              Full access
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground hidden md:block">
                            Last login: {new Date(user.lastSignedIn).toLocaleDateString()}
                          </span>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t bg-muted/10 p-4 space-y-4">
                          {/* Role Selector */}
                          <div className="flex items-center gap-4">
                            <Label className="font-medium min-w-[80px]">Role:</Label>
                            {editable ? (
                              <Select
                                value={user.role}
                                onValueChange={(value: any) => {
                                  updateRole.mutate({ userId: user.id, role: value });
                                }}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getRoleOptions().map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="flex items-center gap-2">
                                {getRoleBadge(user.role, user.email)}
                                {isUserOwner && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Lock className="h-3 w-3" /> Cannot be changed
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Permission Checkboxes */}
                          {user.role === "admin" && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="font-medium">Section Permissions:</Label>
                                {permsEditable && (
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={(e) => { e.stopPropagation(); handleToggleAllPermissions(user.id, true); }}
                                    >
                                      Grant All
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={(e) => { e.stopPropagation(); handleToggleAllPermissions(user.id, false); }}
                                    >
                                      Revoke All
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {PERMISSION_KEYS.map((key) => (
                                  <div
                                    key={key}
                                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                                      perms[key] ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    <Checkbox
                                      id={`perm-${user.id}-${key}`}
                                      checked={perms[key]}
                                      disabled={!permsEditable}
                                      onCheckedChange={() => {
                                        if (permsEditable) {
                                          handlePermissionToggle(user.id, key, perms[key]);
                                        }
                                      }}
                                      className="mt-0.5"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <label
                                        htmlFor={`perm-${user.id}-${key}`}
                                        className="text-sm font-medium cursor-pointer"
                                      >
                                        {PERMISSION_LABELS[key]}
                                      </label>
                                      <p className="text-xs text-muted-foreground">
                                        {PERMISSION_DESCRIPTIONS[key]}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {(isUserOwner || isUserSuperAdmin) && (
                            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                              <p className="text-sm text-purple-700">
                                {isUserOwner 
                                  ? "Owner has unrestricted access to all sections. This cannot be changed."
                                  : "Super Admins have unrestricted access to all sections. Change role to Admin to configure individual permissions."
                                }
                              </p>
                            </div>
                          )}

                          {(user.role === "user" || user.role === "client") && (
                            <div className={`p-3 border rounded-lg ${isNeedsReview && !isAutoApprovedDomain ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                              <p className={`text-sm ${isNeedsReview && !isAutoApprovedDomain ? 'text-amber-700' : 'text-muted-foreground'}`}>
                                {user.role === "user" && isNeedsReview && isAutoApprovedDomain
                                  ? "This L&M team member logged in and is in the holding area. Promote to Admin and assign permissions to grant access."
                                  : user.role === "user" && isNeedsReview
                                    ? "This user registered and needs review. Promote to Admin or Client to grant access, or leave as User for no access."
                                    : user.role === "user" 
                                      ? "Regular users have no admin access. Change role to Admin to configure permissions."
                                      : "Client users have limited access. Change role to Admin to configure admin permissions."
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No users have logged in yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
