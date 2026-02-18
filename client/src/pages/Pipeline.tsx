import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Plus,
  DollarSign,
  TrendingUp,
  Package,
  Truck,
  Building2,
  GripVertical,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  ChevronRight,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  Target,
} from "lucide-react";

const STAGES = [
  { id: "lead", label: "Lead", color: "bg-slate-100 text-slate-700 border-slate-300" },
  { id: "proposal_sent", label: "Proposal Sent", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { id: "under_review", label: "Under Review", color: "bg-amber-100 text-amber-700 border-amber-300" },
  { id: "negotiating", label: "Negotiating", color: "bg-purple-100 text-purple-700 border-purple-300" },
  { id: "signed", label: "Signed", color: "bg-green-100 text-green-700 border-green-300" },
  { id: "active", label: "Active", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  { id: "lost", label: "Lost", color: "bg-red-100 text-red-700 border-red-300" },
] as const;

const SERVICE_TYPES = [
  { id: "warehousing", label: "Warehousing", icon: Building2 },
  { id: "transportation", label: "Transportation", icon: Truck },
  { id: "ecommerce", label: "E-Commerce", icon: Package },
  { id: "crossdock", label: "Cross-Dock", icon: Package },
  { id: "rework", label: "Rework", icon: Package },
  { id: "mixed", label: "Mixed Services", icon: Package },
] as const;

type StageId = typeof STAGES[number]["id"];
type ServiceTypeId = typeof SERVICE_TYPES[number]["id"];

function formatCurrency(cents: number | null | undefined) {
  if (!cents) return "$0";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(cents / 100);
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getStageInfo(stageId: string) {
  return STAGES.find(s => s.id === stageId) || STAGES[0];
}

function getServiceInfo(serviceId: string) {
  return SERVICE_TYPES.find(s => s.id === serviceId) || SERVICE_TYPES[0];
}

// Deal form for create/edit
function DealForm({ deal, onSave, onClose }: { deal?: any; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    clientName: deal?.clientName || "",
    clientContact: deal?.clientContact || "",
    clientEmail: deal?.clientEmail || "",
    clientPhone: deal?.clientPhone || "",
    dealName: deal?.dealName || "",
    serviceType: deal?.serviceType || "warehousing",
    facility: deal?.facility || "",
    company: deal?.company || "L&M",
    stage: deal?.stage || "lead",
    estimatedMonthlyRevenue: deal?.estimatedMonthlyRevenue ? String(deal.estimatedMonthlyRevenue / 100) : "",
    estimatedAnnualRevenue: deal?.estimatedAnnualRevenue ? String(deal.estimatedAnnualRevenue / 100) : "",
    estimatedPallets: deal?.estimatedPallets ? String(deal.estimatedPallets) : "",
    estimatedLoads: deal?.estimatedLoads ? String(deal.estimatedLoads) : "",
    keyServices: deal?.keyServices || "",
    notes: deal?.notes || "",
    probability: deal?.probability ? String(deal.probability) : "",
  });

  const handleSubmit = () => {
    if (!form.clientName || !form.dealName) {
      toast.error("Client name and deal name are required");
      return;
    }
    onSave({
      ...form,
      estimatedMonthlyRevenue: form.estimatedMonthlyRevenue ? Math.round(Number(form.estimatedMonthlyRevenue) * 100) : undefined,
      estimatedAnnualRevenue: form.estimatedAnnualRevenue ? Math.round(Number(form.estimatedAnnualRevenue) * 100) : undefined,
      estimatedPallets: form.estimatedPallets ? Number(form.estimatedPallets) : undefined,
      estimatedLoads: form.estimatedLoads ? Number(form.estimatedLoads) : undefined,
      probability: form.probability ? Number(form.probability) : undefined,
      proposalDate: new Date(),
    });
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Client Name *</Label>
          <Input value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} placeholder="Company name" />
        </div>
        <div className="space-y-2">
          <Label>Deal Name *</Label>
          <Input value={form.dealName} onChange={e => setForm({ ...form, dealName: e.target.value })} placeholder="Warehousing Proposal" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Contact Name</Label>
          <Input value={form.clientContact} onChange={e => setForm({ ...form, clientContact: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} type="email" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Service Type</Label>
          <Select value={form.serviceType} onValueChange={v => setForm({ ...form, serviceType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SERVICE_TYPES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Company</Label>
          <Select value={form.company} onValueChange={v => setForm({ ...form, company: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="L&M">L&M</SelectItem>
              <SelectItem value="Peach">Peach</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Stage</Label>
          <Select value={form.stage} onValueChange={v => setForm({ ...form, stage: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Facility</Label>
          <Input value={form.facility} onChange={e => setForm({ ...form, facility: e.target.value })} placeholder="PA-1151" />
        </div>
        <div className="space-y-2">
          <Label>Probability (%)</Label>
          <Input value={form.probability} onChange={e => setForm({ ...form, probability: e.target.value })} type="number" min="0" max="100" />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Est. Monthly Revenue ($)</Label>
          <Input value={form.estimatedMonthlyRevenue} onChange={e => setForm({ ...form, estimatedMonthlyRevenue: e.target.value })} type="number" placeholder="0" />
        </div>
        <div className="space-y-2">
          <Label>Est. Annual Revenue ($)</Label>
          <Input value={form.estimatedAnnualRevenue} onChange={e => setForm({ ...form, estimatedAnnualRevenue: e.target.value })} type="number" placeholder="0" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Est. Pallets</Label>
          <Input value={form.estimatedPallets} onChange={e => setForm({ ...form, estimatedPallets: e.target.value })} type="number" />
        </div>
        <div className="space-y-2">
          <Label>Est. Loads/Year</Label>
          <Input value={form.estimatedLoads} onChange={e => setForm({ ...form, estimatedLoads: e.target.value })} type="number" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Key Services</Label>
        <Textarea value={form.keyServices} onChange={e => setForm({ ...form, keyServices: e.target.value })} placeholder="Climate-controlled storage, PLCB rework, cross-dock..." rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Internal notes about this deal..." rows={3} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>{deal ? "Update Deal" : "Create Deal"}</Button>
      </div>
    </div>
  );
}

// Kanban card
function DealCard({ deal, onEdit, onStageChange }: { deal: any; onEdit: (deal: any) => void; onStageChange: (id: number, stage: StageId) => void }) {
  const stageInfo = getStageInfo(deal.stage);
  const serviceInfo = getServiceInfo(deal.serviceType);
  const ServiceIcon = serviceInfo.icon;

  const currentStageIndex = STAGES.findIndex(s => s.id === deal.stage);
  const nextStage = currentStageIndex < STAGES.length - 2 ? STAGES[currentStageIndex + 1] : null; // Skip "lost"

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => onEdit(deal)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{deal.clientName}</p>
            <p className="text-xs text-muted-foreground truncate">{deal.dealName}</p>
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0 ml-2">
            {deal.company}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ServiceIcon className="h-3 w-3" />
          <span>{serviceInfo.label}</span>
          {deal.facility && (
            <>
              <span className="text-muted-foreground/40">|</span>
              <span>{deal.facility}</span>
            </>
          )}
        </div>

        {(deal.estimatedMonthlyRevenue || deal.estimatedAnnualRevenue) && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-3 w-3 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {deal.estimatedMonthlyRevenue ? `${formatCurrency(deal.estimatedMonthlyRevenue)}/mo` : formatCurrency(deal.estimatedAnnualRevenue) + "/yr"}
            </span>
          </div>
        )}

        {deal.estimatedLoads && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Truck className="h-3 w-3" />
            <span>{deal.estimatedLoads} loads/yr</span>
          </div>
        )}

        {deal.probability != null && deal.probability > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <Target className="h-3 w-3 text-blue-500" />
            <span className="text-blue-600 font-medium">{deal.probability}% probability</span>
          </div>
        )}

        {nextStage && deal.stage !== "active" && deal.stage !== "lost" && (
          <Button
            size="sm"
            variant="ghost"
            className="w-full text-xs h-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onStageChange(deal.id, nextStage.id as StageId);
            }}
          >
            Move to {nextStage.label} <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Kanban column
function KanbanColumn({ stage, deals, onEdit, onStageChange }: { stage: typeof STAGES[number]; deals: any[]; onEdit: (deal: any) => void; onStageChange: (id: number, stage: StageId) => void }) {
  const totalRevenue = deals.reduce((sum, d) => sum + (d.estimatedAnnualRevenue || d.estimatedMonthlyRevenue * 12 || 0), 0);

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${stage.color} text-xs font-medium`}>
            {stage.label}
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">{deals.length}</span>
        </div>
        {totalRevenue > 0 && (
          <span className="text-xs text-green-600 font-medium">{formatCurrency(totalRevenue)}/yr</span>
        )}
      </div>
      <div className="flex flex-col gap-2 flex-1 min-h-[200px] bg-slate-50/50 dark:bg-slate-900/30 rounded-lg p-2">
        {deals.map(deal => (
          <DealCard key={deal.id} deal={deal} onEdit={onEdit} onStageChange={onStageChange} />
        ))}
        {deals.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground/50 italic">
            No deals
          </div>
        )}
      </div>
    </div>
  );
}

// Table row
function DealTableRow({ deal, onEdit, onStageChange }: { deal: any; onEdit: (deal: any) => void; onStageChange: (id: number, stage: StageId) => void }) {
  const stageInfo = getStageInfo(deal.stage);
  const serviceInfo = getServiceInfo(deal.serviceType);

  return (
    <tr className="border-b hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer" onClick={() => onEdit(deal)}>
      <td className="py-3 px-4">
        <div>
          <p className="font-medium text-sm">{deal.clientName}</p>
          <p className="text-xs text-muted-foreground">{deal.dealName}</p>
        </div>
      </td>
      <td className="py-3 px-4">
        <Badge variant="outline" className={`${stageInfo.color} text-xs`}>{stageInfo.label}</Badge>
      </td>
      <td className="py-3 px-4 text-sm">{serviceInfo.label}</td>
      <td className="py-3 px-4 text-sm">{deal.facility || "—"}</td>
      <td className="py-3 px-4 text-sm font-medium text-green-700">
        {deal.estimatedMonthlyRevenue ? formatCurrency(deal.estimatedMonthlyRevenue) + "/mo" : "—"}
      </td>
      <td className="py-3 px-4 text-sm font-medium text-green-700">
        {deal.estimatedAnnualRevenue ? formatCurrency(deal.estimatedAnnualRevenue) : "—"}
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{deal.probability != null ? `${deal.probability}%` : "—"}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(deal.proposalDate)}</td>
    </tr>
  );
}

export default function Pipeline() {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: deals = [], isLoading } = trpc.pipeline.getAll.useQuery();

  const createMutation = trpc.pipeline.create.useMutation({
    onSuccess: () => {
      utils.pipeline.getAll.invalidate();
      setDialogOpen(false);
      setEditingDeal(null);
      toast.success("Deal created");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.pipeline.update.useMutation({
    onSuccess: () => {
      utils.pipeline.getAll.invalidate();
      setDialogOpen(false);
      setEditingDeal(null);
      toast.success("Deal updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStageMutation = trpc.pipeline.updateStage.useMutation({
    onSuccess: () => {
      utils.pipeline.getAll.invalidate();
      toast.success("Stage updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.pipeline.delete.useMutation({
    onSuccess: () => {
      utils.pipeline.getAll.invalidate();
      setDialogOpen(false);
      setEditingDeal(null);
      toast.success("Deal deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = (data: any) => {
    if (editingDeal) {
      updateMutation.mutate({ id: editingDeal.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleStageChange = (id: number, stage: StageId) => {
    updateStageMutation.mutate({ id, stage });
  };

  const handleEdit = (deal: any) => {
    setEditingDeal(deal);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (editingDeal && confirm("Delete this deal? This cannot be undone.")) {
      deleteMutation.mutate({ id: editingDeal.id });
    }
  };

  // Group deals by stage for kanban
  const dealsByStage = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    STAGES.forEach(s => { grouped[s.id] = []; });
    deals.forEach(d => {
      if (grouped[d.stage]) grouped[d.stage].push(d);
    });
    return grouped;
  }, [deals]);

  // Summary stats
  const stats = useMemo(() => {
    const activeDeals = deals.filter(d => d.stage !== "lost");
    const totalPipelineValue = activeDeals.reduce((sum, d) => sum + (d.estimatedAnnualRevenue || (d.estimatedMonthlyRevenue || 0) * 12 || 0), 0);
    const weightedValue = activeDeals.reduce((sum, d) => {
      const annual = d.estimatedAnnualRevenue || (d.estimatedMonthlyRevenue || 0) * 12 || 0;
      const prob = d.probability || 50;
      return sum + (annual * prob / 100);
    }, 0);
    const signedActive = deals.filter(d => d.stage === "signed" || d.stage === "active");
    const signedRevenue = signedActive.reduce((sum, d) => sum + (d.estimatedAnnualRevenue || (d.estimatedMonthlyRevenue || 0) * 12 || 0), 0);

    return {
      totalDeals: activeDeals.length,
      totalPipelineValue,
      weightedValue,
      signedRevenue,
      signedCount: signedActive.length,
    };
  }, [deals]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/internal")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Sales Pipeline</h1>
              <p className="text-xs text-muted-foreground">Deal tracking & revenue forecasting</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-md">
              <Button
                variant={view === "kanban" ? "default" : "ghost"}
                size="sm"
                className="rounded-r-none"
                onClick={() => setView("kanban")}
              >
                <LayoutGrid className="h-4 w-4 mr-1" /> Board
              </Button>
              <Button
                variant={view === "table" ? "default" : "ghost"}
                size="sm"
                className="rounded-l-none"
                onClick={() => setView("table")}
              >
                <List className="h-4 w-4 mr-1" /> Table
              </Button>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingDeal(null); }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Deal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingDeal ? "Edit Deal" : "New Deal"}</DialogTitle>
                  <DialogDescription>
                    {editingDeal ? "Update deal information" : "Add a new deal to the pipeline"}
                  </DialogDescription>
                </DialogHeader>
                <DealForm
                  deal={editingDeal}
                  onSave={handleSave}
                  onClose={() => { setDialogOpen(false); setEditingDeal(null); }}
                />
                {editingDeal && (
                  <DialogFooter className="sm:justify-start">
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete Deal
                    </Button>
                  </DialogFooter>
                )}
              </DialogContent>
            </Dialog>
            <img src="/images/lm-logo.jpg" alt="L&M" className="h-10 w-auto" />
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalDeals}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.totalPipelineValue)}</p>
              <p className="text-xs text-muted-foreground">Annual value</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Weighted Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.weightedValue)}</p>
              <p className="text-xs text-muted-foreground">Probability-adjusted</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Signed / Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.signedRevenue)}</p>
              <p className="text-xs text-muted-foreground">{stats.signedCount} deal{stats.signedCount !== 1 ? "s" : ""}</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : view === "kanban" ? (
          /* Kanban Board */
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {STAGES.filter(s => s.id !== "lost").map(stage => (
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  deals={dealsByStage[stage.id] || []}
                  onEdit={handleEdit}
                  onStageChange={handleStageChange}
                />
              ))}
              {/* Lost column - collapsed */}
              {(dealsByStage["lost"]?.length || 0) > 0 && (
                <KanbanColumn
                  stage={STAGES.find(s => s.id === "lost")!}
                  deals={dealsByStage["lost"] || []}
                  onEdit={handleEdit}
                  onStageChange={handleStageChange}
                />
              )}
            </div>
          </div>
        ) : (
          /* Table View */
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50 dark:bg-slate-900/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Client / Deal</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Stage</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Service</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Facility</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Monthly</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Annual</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Prob.</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Proposal Date</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map(deal => (
                    <DealTableRow key={deal.id} deal={deal} onEdit={handleEdit} onStageChange={handleStageChange} />
                  ))}
                  {deals.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        No deals in pipeline. Click "Add Deal" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
