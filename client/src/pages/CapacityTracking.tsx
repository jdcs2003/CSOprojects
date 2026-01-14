import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Calendar, Save, TrendingUp, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const facilities = [
  { code: "PA-510", name: "Bristol (Climate + Bonded)", totalSqFt: 233000 },
  { code: "PA-1151", name: "Metro", totalSqFt: 85718 },
  { code: "SC-577", name: "South Carolina", totalSqFt: 60000 },
  { code: "NJ-2279", name: "New Jersey", totalSqFt: 45000 },
];

export default function CapacityTracking() {
  const [selectedFacility, setSelectedFacility] = useState(facilities[0]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [availableSqFt, setAvailableSqFt] = useState("");
  const [notes, setNotes] = useState("");
  const [updatedBy, setUpdatedBy] = useState("");

  // Get next 6 months for forecasting
  const getNextMonths = (count: number) => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        value: monthStr,
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      });
    }
    return months;
  };

  const months = getNextMonths(12);

  // Query capacity data
  const { data: capacityData, refetch } = trpc.capacity.getByMonth.useQuery({
    month: selectedMonth
  });

  // Mutation to save capacity
  const saveCapacity = trpc.capacity.upsert.useMutation({
    onSuccess: () => {
      toast.success("Capacity data saved successfully!");
      refetch();
      setAvailableSqFt("");
      setNotes("");
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    }
  });

  const handleSave = () => {
    if (!availableSqFt || isNaN(Number(availableSqFt))) {
      toast.error("Please enter a valid available square footage");
      return;
    }

    if (!updatedBy.trim()) {
      toast.error("Please enter your name");
      return;
    }

    saveCapacity.mutate({
      facilityCode: selectedFacility.code,
      facilityName: selectedFacility.name,
      month: selectedMonth,
      totalSquareFeet: selectedFacility.totalSqFt,
      availableSquareFeet: Number(availableSqFt),
      notes: notes.trim() || undefined,
      updatedBy: updatedBy.trim(),
    });
  };

  const calculateUtilization = (total: number, available: number) => {
    const occupied = total - available;
    return ((occupied / total) * 100).toFixed(1);
  };

  const exportToGoogleSheets = () => {
    if (!capacityData || capacityData.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Create CSV content
    const headers = ["Facility Code", "Facility Name", "Month", "Total Sq Ft", "Available Sq Ft", "Occupied Sq Ft", "Utilization %", "Updated By", "Notes", "Last Updated"];
    
    const rows = facilities.map(facility => {
      const data = capacityData.find((d: any) => d.facilityCode === facility.code);
      const available = data?.availableSquareFeet ?? 0;
      const occupied = facility.totalSqFt - available;
      const utilization = data ? calculateUtilization(facility.totalSqFt, available) : "0";
      
      return [
        facility.code,
        facility.name,
        months.find(m => m.value === selectedMonth)?.label || selectedMonth,
        facility.totalSqFt.toString(),
        available.toString(),
        occupied.toString(),
        utilization,
        data?.updatedBy || "",
        data?.notes || "",
        data?.updatedAt ? new Date(data.updatedAt).toLocaleString() : ""
      ];
    });

    // Convert to CSV
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `lm-capacity-${selectedMonth}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Exported to CSV! You can import this into Google Sheets.");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-bold">L&M Capacity Tracking</h1>
              <p className="text-xs text-muted-foreground">Manage facility availability</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <img src="/images/lm-logo.jpg" alt="L&M Distribution" className="h-10 w-auto" />
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue="input" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="input">Input Availability</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          {/* Input Tab */}
          <TabsContent value="input" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Update Facility Capacity
                </CardTitle>
                <CardDescription>
                  Enter available square footage for a specific facility and month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="facility">Facility</Label>
                    <Select
                      value={selectedFacility.code}
                      onValueChange={(code) => {
                        const facility = facilities.find(f => f.code === code);
                        if (facility) setSelectedFacility(facility);
                      }}
                    >
                      <SelectTrigger id="facility">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {facilities.map((facility) => (
                          <SelectItem key={facility.code} value={facility.code}>
                            {facility.code} - {facility.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger id="month">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-900">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Square Feet</p>
                      <p className="text-2xl font-bold">{selectedFacility.totalSqFt.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Facility Code</p>
                      <p className="text-2xl font-bold">{selectedFacility.code}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="available">Available Square Feet</Label>
                  <Input
                    id="available"
                    type="number"
                    placeholder="Enter available square footage"
                    value={availableSqFt}
                    onChange={(e) => setAvailableSqFt(e.target.value)}
                    min="0"
                    max={selectedFacility.totalSqFt}
                  />
                  {availableSqFt && !isNaN(Number(availableSqFt)) && (
                    <p className="text-sm text-muted-foreground">
                      Utilization: {calculateUtilization(selectedFacility.totalSqFt, Number(availableSqFt))}% occupied
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="updatedBy">Your Name</Label>
                  <Input
                    id="updatedBy"
                    placeholder="Enter your name"
                    value={updatedBy}
                    onChange={(e) => setUpdatedBy(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about upcoming changes, reservations, or special considerations..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleSave} 
                  disabled={saveCapacity.isPending}
                  className="w-full sm:w-auto"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saveCapacity.isPending ? "Saving..." : "Save Capacity Data"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Capacity Overview - {months.find(m => m.value === selectedMonth)?.label}
                </CardTitle>
                <CardDescription>
                  View available capacity across all facilities for the selected month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div className="flex-1">
                    <Label htmlFor="overview-month">Select Month</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger id="overview-month" className="max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => exportToGoogleSheets()}
                    disabled={!capacityData || capacityData.length === 0}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export to Google Sheets
                  </Button>
                </div>

                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Facility</TableHead>
                        <TableHead className="text-right">Total Sq Ft</TableHead>
                        <TableHead className="text-right">Available Sq Ft</TableHead>
                        <TableHead className="text-right">Utilization</TableHead>
                        <TableHead>Updated By</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {facilities.map((facility) => {
                        const data = capacityData?.find((d: any) => d.facilityCode === facility.code);
                        const available = data?.availableSquareFeet ?? null;
                        const utilization = available !== null 
                          ? calculateUtilization(facility.totalSqFt, available)
                          : null;

                        return (
                          <TableRow key={facility.code}>
                            <TableCell className="font-medium">
                              <div>
                                <p className="font-semibold">{facility.code}</p>
                                <p className="text-xs text-muted-foreground">{facility.name}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {facility.totalSqFt.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {available !== null ? available.toLocaleString() : (
                                <span className="text-muted-foreground">Not set</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {utilization !== null ? (
                                <span className={`font-semibold ${
                                  Number(utilization) > 90 ? 'text-red-600' :
                                  Number(utilization) > 75 ? 'text-amber-600' :
                                  'text-green-600'
                                }`}>
                                  {utilization}%
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {data?.updatedBy ? (
                                <span className="text-sm">{data.updatedBy}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {data?.notes ? (
                                <span className="text-sm">{data.notes}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {capacityData && capacityData.length > 0 && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total Capacity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {facilities.reduce((sum, f) => sum + f.totalSqFt, 0).toLocaleString()} sq ft
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total Available
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {capacityData.reduce((sum: number, d: any) => sum + d.availableSquareFeet, 0).toLocaleString()} sq ft
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Overall Utilization
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {calculateUtilization(
                            facilities.reduce((sum, f) => sum + f.totalSqFt, 0),
                            capacityData.reduce((sum: number, d: any) => sum + d.availableSquareFeet, 0)
                          )}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
