import { useState } from "react";
import PricingCalculator from "@/components/PricingCalculator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function PeachCalculator() {
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>("");
  const [showDialog, setShowDialog] = useState<boolean>(true);

  const verifyPasscode = () => {
    if (passcodeInput === "Peach2026!") {
      setUnlocked(true);
      setShowDialog(false);
      setPasscodeInput("");
    } else {
      alert("Incorrect passcode. Please try again.");
      setPasscodeInput("");
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                🍑 Peach Warehouse Access
              </DialogTitle>
              <DialogDescription>
                Enter the passcode to access Peach warehousing calculator.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2">
                <Label htmlFor="passcode">Passcode</Label>
                <Input
                  id="passcode"
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && verifyPasscode()}
                  placeholder="Enter passcode..."
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={verifyPasscode}>
                Unlock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <PricingCalculator
      companyFilter="Peach"
      title="🍑 Peach Warehousing Calculator"
      logoPath="/images/peach-logo.jpg"
      companyName="Peach Warehouse"
    />
  );
}
