import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Anchor, ArrowRight, Beer, Check, ChevronRight, Download, FileText, MapPin, ShieldCheck, Thermometer, Truck } from "lucide-react";
import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "sonner";

export default function Home() {
  const [selectedOption, setSelectedOption] = useState<"conservative" | "standard">("standard");
  const [isSigning, setIsSigning] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [clientName, setClientName] = useState("Gabe K.");
  const [clientEmail, setClientEmail] = useState("gabe@thirddeckbrewing.com");
  const sigCanvas = useRef<SignatureCanvas>(null);
  const proposalRef = useRef<HTMLDivElement>(null);

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const saveSignature = () => {
    if (sigCanvas.current?.isEmpty()) {
      toast.error("Please provide a signature before saving.");
      return;
    }
    const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
    setSignatureData(dataUrl || null);
    setIsSigning(false);
    toast.success("Signature saved successfully!");
  };

  const downloadPDF = async () => {
    if (!proposalRef.current) return;
    
    toast.info("Generating PDF...");
    
    try {
      // Wait for images to load
      const images = proposalRef.current.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      }));

      // Ensure signature image is loaded if present
      const signatureImg = proposalRef.current.querySelector('img[alt="Client Signature"]') as HTMLImageElement;
      if (signatureImg && !signatureImg.complete) {
        await new Promise((resolve) => {
          signatureImg.onload = resolve;
          signatureImg.onerror = resolve; // Proceed even if error to avoid hanging
        });
      }

      const canvas = await html2canvas(proposalRef.current, {
        scale: 2,
        useCORS: true, // Important for loading images
        allowTaint: true, // Changed to true to allow local data URLs (signature)
        logging: false,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
        ignoreElements: (element) => element.tagName === 'BUTTON' || element.classList.contains('no-print'),
        onclone: (clonedDoc) => {
           // Ensure cloned signature image has correct source
           const clonedSig = clonedDoc.querySelector('img[alt="Client Signature"]') as HTMLImageElement;
           if (clonedSig && signatureData) {
             clonedSig.src = signatureData;
           }
        }
      });
      
      // Calculate PDF dimensions to fit A4 or maintain aspect ratio
      const imgWidth = 595.28; // A4 width in pt
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: [imgWidth, imgHeight],
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      pdf.save("Third_Deck_Brewing_Proposal.pdf");
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("PDF generation failed. Opening print dialog instead...");
      // Fallback to native browser print
      setTimeout(() => window.print(), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20" ref={proposalRef}>
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/lm-logo.jpg" alt="L&M Distribution and Logistics" className="h-12 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm text-muted-foreground">
              Prepared for <span className="font-semibold text-foreground">Third Deck Brewing</span>
            </div>
            <Button size="sm" variant="outline" onClick={downloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-slate-50 dark:bg-slate-950">
          <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none"></div>
          <div className="container relative py-12 md:py-24 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm font-medium text-secondary shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-secondary mr-2 animate-pulse"></span>
                  Launch Target: March 2025
                </div>
                <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl">
                  Warehousing Proposal for <span className="text-primary">Third Deck Brewing</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-[600px]">
                  A comprehensive logistics solution designed to support your mission-driven launch. Climate-controlled storage, professional handling, and scalable infrastructure for your growth.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="font-semibold" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                    View Pricing Options
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => document.getElementById('scope')?.scrollIntoView({ behavior: 'smooth' })}>
                    Review Scope
                  </Button>
                </div>
              </div>
              <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
                <div className="aspect-video overflow-hidden rounded-xl border bg-background shadow-2xl">
                  <img 
                    src="/images/hero-warehouse.jpg" 
                    alt="Climate Controlled Warehouse" 
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 hidden lg:block">
                  <Card className="w-64 shadow-lg border-l-4 border-l-secondary">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Client</CardTitle>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border">
                          <img src="/images/logo-placeholder.png" alt="Third Deck Logo" className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Third Deck Brewing</p>
                          <p className="text-xs text-muted-foreground">Gabe K. & Matt G.</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits / Scope */}
        <section id="scope" className="py-16 md:py-24 bg-background">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl mb-4">Tailored for Your Launch</h2>
              <p className="text-muted-foreground text-lg">
                We understand the unique challenges of a first-time market launch. Our solution provides the flexibility, compliance, and technology you need to succeed.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                    <Thermometer className="h-6 w-6" />
                  </div>
                  <CardTitle>Climate Control</CardTitle>
                  <CardDescription>68-76°F Temperature Range</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your product is brewed cold and stays cold. Our Bensalem Metro facility maintains strict temperature controls to preserve the quality of your craft beverages.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <CardTitle>Full Compliance</CardTitle>
                  <CardDescription>Multi-State Licensing</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We hold alcohol transporter licenses for PA, NJ, NY, and MD. As you expand into new markets, our regulatory infrastructure scales with you.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-4">
                    <Truck className="h-6 w-6" />
                  </div>
                  <CardTitle>Logistics & Tech</CardTitle>
                  <CardDescription>WMS & Freight Integration</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Real-time inventory tracking via our Connect WMS (API compatible with VIP), plus competitive freight rates for local and long-haul distribution.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 relative">
          <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none"></div>
          <div className="container relative">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl mb-4">Investment Options</h2>
              <p className="text-muted-foreground text-lg">
                Choose the package that best aligns with your launch strategy and risk tolerance.
              </p>
            </div>

            <Tabs defaultValue="standard" className="w-full max-w-5xl mx-auto" onValueChange={(v) => setSelectedOption(v as any)}>
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="conservative">Conservative Launch</TabsTrigger>
                  <TabsTrigger value="standard">Standard Growth</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="conservative" className="mt-0">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <Card className="border-2 border-muted shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl">Conservative Launch</CardTitle>
                      <CardDescription>Ideal for testing the market with minimal commitment.</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">$700</span>
                        <span className="text-muted-foreground"> / month</span>
                        <p className="text-sm text-muted-foreground mt-1">Fixed storage fee</p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">20</div>
                        <span className="font-medium">Pallet Positions Included</span>
                      </div>
                      <Separator />
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Climate-controlled storage ($35/pallet)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>WMS Access & API Integration</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Alcohol Licensing Coverage</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Handling: $15 In / $15 Out (billed on activity)</span>
                        </li>
                      </ul>
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg mt-4">
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Estimated Monthly Total</p>
                        <div className="flex justify-between items-end">
                          <span className="text-2xl font-bold text-primary">$1,300</span>
                          <span className="text-xs text-muted-foreground text-right">Includes est. handling<br/>(2 turns/month)</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" variant="outline" disabled>Currently Viewing</Button>
                    </CardFooter>
                  </Card>

                  <div className="space-y-6 pt-4">
                    <h3 className="font-heading text-xl font-semibold">Why choose this option?</h3>
                    <p className="text-muted-foreground">
                      This package provides the flexibility you need for a first-time market launch while ensuring dedicated space availability. If your product sells through faster than expected, you're not over-committed.
                    </p>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Strategic Location</h4>
                          <p className="text-sm text-muted-foreground">Bensalem Metro facility is ideally positioned for Yards Brewing receiving and distributor pickups.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                          <Beer className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Beverage Expertise</h4>
                          <p className="text-sm text-muted-foreground">Leverage our experience handling 25,000+ pallets of beverage products.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="standard" className="mt-0">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <Card className="border-2 border-primary shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
                    <CardHeader>
                      <CardTitle className="text-2xl">Standard Growth</CardTitle>
                      <CardDescription>Designed for multi-SKU management and seasonal surges.</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">$1,225</span>
                        <span className="text-muted-foreground"> / month</span>
                        <p className="text-sm text-muted-foreground mt-1">Fixed storage fee</p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">35</div>
                        <span className="font-medium">Pallet Positions Included</span>
                      </div>
                      <Separator />
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Climate-controlled storage ($35/pallet)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Buffer stock for all 6 SKUs</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>MLB Season Surge Capacity</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Handling: $15 In / $15 Out (billed on activity)</span>
                        </li>
                      </ul>
                      <div className="bg-primary/5 p-4 rounded-lg mt-4 border border-primary/10">
                        <p className="text-xs font-semibold uppercase text-primary mb-2">Estimated Monthly Total</p>
                        <div className="flex justify-between items-end">
                          <span className="text-2xl font-bold text-primary">$2,275</span>
                          <span className="text-xs text-muted-foreground text-right">Includes est. handling<br/>(2 turns/month)</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => document.getElementById('sign')?.scrollIntoView({ behavior: 'smooth' })}>Select This Plan</Button>
                    </CardFooter>
                  </Card>

                  <div className="space-y-6 pt-4">
                    <h3 className="font-heading text-xl font-semibold">Why we recommend this:</h3>
                    <p className="text-muted-foreground">
                      With 6 SKUs (12oz & 19.2oz) and the MLB season approaching, this option ensures you have adequate buffer stock to prevent stockouts. It supports your multi-state launch strategy without the risk of space constraints.
                    </p>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <Anchor className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Multi-State Hub</h4>
                          <p className="text-sm text-muted-foreground">Centralized inventory for PA, NY, MI, FL, and TX distribution.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Cost Efficiency</h4>
                          <p className="text-sm text-muted-foreground">At ~$0.62 per case total cost, this ensures professional logistics without eroding margins.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Terms & Signature */}
        <section id="sign" className="py-16 md:py-24 bg-background">
          <div className="container max-w-4xl">
            <div className="border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-900 p-6 border-b">
                <h2 className="font-heading text-2xl font-bold">Acceptance & Authorization</h2>
                <p className="text-muted-foreground">Please review the terms and sign below to proceed with the selected proposal.</p>
              </div>
              <div className="p-6 md:p-8 space-y-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Terms & Conditions Summary</h3>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 rounded-lg border bg-slate-50/50">
                      <span className="font-semibold block mb-1">Agreement Term</span>
                      12 months from March 2025 launch. Automatic annual renewal unless terminated with 60 days notice.
                    </div>
                    <div className="p-4 rounded-lg border bg-slate-50/50">
                      <span className="font-semibold block mb-1">Payment Terms</span>
                      Storage billed monthly in advance (Net 30). Handling billed monthly in arrears based on actual activity.
                    </div>
                    <div className="p-4 rounded-lg border bg-slate-50/50">
                      <span className="font-semibold block mb-1">Insurance</span>
                      Cargo insurance included during transport. Client responsible for product insurance while in storage.
                    </div>
                    <div className="p-4 rounded-lg border bg-slate-50/50">
                      <span className="font-semibold block mb-1">Selected Plan</span>
                      {selectedOption === "conservative" ? "Conservative Launch (20 Pallets)" : "Standard Growth (35 Pallets)"}
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 rounded-lg border bg-slate-50/50 text-sm">
                    <span className="font-semibold block mb-2">Additional Services & Fees (As Needed)</span>
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-muted-foreground">
                      <div className="flex justify-between border-b border-dashed pb-1">
                        <span>Administration Fee</span>
                        <span className="font-medium text-foreground">$35.00 / hr</span>
                      </div>
                      <div className="text-xs col-span-2 sm:col-span-1 mb-2 italic">Applies to manual entry, photo requests, out of scope work</div>
                      
                      <div className="flex justify-between border-b border-dashed pb-1">
                        <span>Bottle Mixing</span>
                        <span className="font-medium text-foreground">$14.00 / case</span>
                      </div>
                      <div className="hidden sm:block"></div>

                      <div className="flex justify-between border-b border-dashed pb-1">
                        <span>Open & Inspect</span>
                        <span className="font-medium text-foreground">$2.00 / case</span>
                      </div>
                      <div className="text-xs col-span-2 sm:col-span-1 mb-2 italic">$20.00 minimum charge applies</div>

                      <div className="flex justify-between border-b border-dashed pb-1">
                        <span>Labeling Fee</span>
                        <span className="font-medium text-foreground">$0.80 / case</span>
                      </div>
                      <div className="hidden sm:block"></div>

                      <div className="flex justify-between border-b border-dashed pb-1">
                        <span>Order Processing</span>
                        <span className="font-medium text-foreground">$2.00 / order</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Signature</Label>
                    {signatureData ? (
                      <div className="border rounded-lg p-4 bg-slate-50 relative group">
                        <img src={signatureData} alt="Client Signature" className="h-24" />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => setSignatureData(null)}>Clear</Button>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground border-t pt-2 flex justify-between">
                          <span>Signed by {clientName}</span>
                          <span>{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    ) : (
                      <Dialog open={isSigning} onOpenChange={setIsSigning}>
                        <DialogTrigger asChild>
                          <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors h-40">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <FileText className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-primary">Click to Sign via Rocket Sign</span>
                            <span className="text-xs text-muted-foreground">Secure e-signature integration</span>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Sign Proposal</DialogTitle>
                            <DialogDescription>
                              Please sign below to authorize this agreement.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="border rounded-md bg-white">
                            <SignatureCanvas 
                              ref={sigCanvas}
                              penColor="black"
                              canvasProps={{width: 400, height: 200, className: 'sigCanvas'}} 
                            />
                          </div>
                          <DialogFooter className="sm:justify-between">
                            <Button variant="ghost" onClick={clearSignature}>Clear</Button>
                            <Button onClick={saveSignature}>Apply Signature</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the terms and conditions outlined in this proposal.
                    </label>
                  </div>

                  <Button size="lg" className="w-full sm:w-auto" disabled={!signatureData} onClick={downloadPDF}>
                    Complete & Submit Proposal
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/images/lm-logo.jpg" alt="L&M Distribution and Logistics" className="h-12 w-auto bg-white rounded-md p-1" />
              </div>
              <p className="text-sm text-slate-400 max-w-xs">
                Premier warehousing and logistics solutions for the beverage industry. Serving the Northeast corridor with pride.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>Jim Stenson</li>
                <li>Chief Strategy Officer</li>
                <li>jim@lmwarehousing.com</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Locations</h4>
              <ul className="space-y-2 text-sm">
                <li>Bensalem Metro (PA)</li>
                <li>South Carolina Division</li>
                <li>New Jersey Hub</li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-slate-800" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>&copy; 2025 L&M Warehousing. All rights reserved.</p>
            <div className="flex gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
