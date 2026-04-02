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
} from "lucide-react";

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
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<string>("admin");

  const { data: adminAccess } = trpc.admin.checkAdminAccess.useQuery();
  const { data: users, refetch: refetchUsers } = trpc.admin.getAllUsers.useQuery();
  const { data: authorizedEmails, refetch: refetchAuthorized } = trpc.admin.getAllAuthorizedEmails.useQuery(
    undefined,
    { enabled: adminAccess?.isSuperAdmin || adminAccess?.isOwner || false }
  );

  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { toast.success("Role updated"); refetchUsers(); },
    onError: (e) => toast.error(e.message),
  });

  const updatePermissions = trpc.admin.updateUserPermissions.useMutation({
    onSuccess: () => { toast.success("Permissions updated"); refetchUsers(); },
    onError: (e) => toast.error(e.message),
  });

  const addAuthorized = trpc.admin.addAuthorizedEmail.useMutation({
    onSuccess: () => { toast.success("Email added"); setNewEmail(""); refetchAuthorized(); },
    onError: (e) => toast.error(e.message),
  });

  const removeAuthorized = trpc.admin.removeAuthorizedEmail.useMutation({
    onSuccess: () => { toast.success("Email removed"); refetchAuthorized(); },
    onError: (e) => toast.error(e.message),
  });

  const isSuperAdmin = adminAccess?.isSuperAdmin || adminAccess?.isOwner || false;
  const isOwner = adminAccess?.isOwner || false;

  const canEditUser = (user: any) => {
    if (user.email === OWNER_EMAIL) return false;
    if (isOwner) return true;
    if (isSuperAdmin && user.role !== 'super_admin') return true;
    return false;
  };

  const canEditPermissions = (user: any) => {
    if (user.email === OWNER_EMAIL || user.role === 'super_admin') return false;
    if (isOwner || isSuperAdmin) return true;
    // Admins with userManagement can edit other admins' permissions
    const myPerms = adminAccess?.permissions as Record<string, boolean> | null;
    return myPerms?.userManagement || false;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage user roles and permissions for the CSO Pricing Dashboard</p>
      </div>

      {/* Pre-Authorized Emails (Super Admin only) */}
      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Pre-Authorized Emails
            </CardTitle>
            <CardDescription>
              Add emails before users log in to automatically assign them a role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="email@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  {isOwner && <SelectItem value="super_admin">Super Admin</SelectItem>}
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  if (!newEmail.trim()) return;
                  addAuthorized.mutate({ email: newEmail.trim(), role: newRole as any });
                }}
                disabled={addAuthorized.isPending}
              >
                {addAuthorized.isPending ? "Adding..." : "Add Email"}
              </Button>
            </div>

            {authorizedEmails && authorizedEmails.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Added By</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authorizedEmails.map((auth: any) => (
                      <TableRow key={auth.id}>
                        <TableCell className="font-medium">{auth.email}</TableCell>
                        <TableCell>{getRoleBadge(auth.role, null)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{auth.createdBy}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAuthorized.mutate({ id: auth.id })}
                            disabled={removeAuthorized.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
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
            {isSuperAdmin 
              ? "Manage roles and configure granular permissions for each admin user"
              : "View registered users and their access levels"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <div className="space-y-2">
              {users.map((user: any) => {
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
                              {user.role === "user" && isNeedsReview && !isAutoApprovedDomain
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
  );
}
