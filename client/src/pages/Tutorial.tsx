import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { 
  Calculator, 
  TrendingUp, 
  Building2, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  GraduationCap,
  Loader2,
  Shield,
} from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

const quizQuestions: QuizQuestion[] = [
  {
    question: "What is the primary purpose of the Pricing Calculator?",
    options: [
      "To track employee attendance",
      "To calculate true costs, FTE requirements, and recommended billing rates for client deals",
      "To manage customer invoices",
      "To generate marketing materials",
    ],
    correctIndex: 1,
  },
  {
    question: "What does the Sales Pipeline track?",
    options: [
      "Employee performance reviews",
      "Warehouse inventory levels",
      "Proposals and deals through sales stages with revenue forecasting",
      "Customer support tickets",
    ],
    correctIndex: 2,
  },
  {
    question: "What information does Capacity Tracking monitor?",
    options: [
      "Employee headcount per facility",
      "Available square footage across L&M facilities with monthly forecasting",
      "Customer satisfaction scores",
      "Delivery truck availability",
    ],
    correctIndex: 1,
  },
  {
    question: "How many L&M facilities are tracked in the system?",
    options: [
      "3 facilities",
      "4 facilities",
      "5 facilities",
      "7 facilities",
    ],
    correctIndex: 2,
  },
  {
    question: "What should you do if you need access to a section you can't see?",
    options: [
      "Create a new account",
      "Contact your administrator to request the specific permission",
      "Try refreshing the page multiple times",
      "Use a different browser",
    ],
    correctIndex: 1,
  },
];

export default function Tutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  const completeTutorial = trpc.admin.completeTutorial.useMutation({
    onSuccess: () => {
      toast.success("Tutorial completed! Welcome to the CSO Pricing Dashboard.");
      navigate("/internal");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const steps: TutorialStep[] = [
    {
      title: "Welcome to the CSO Pricing Dashboard",
      description: "Let's walk through the key features available to you.",
      icon: <GraduationCap className="h-8 w-8" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Welcome, <span className="font-semibold text-foreground">{user?.name || user?.email}</span>! 
            This quick tutorial will introduce you to the main tools available in the CSO Pricing Dashboard.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              This tutorial takes about 2 minutes. You'll need to pass a short quiz (80% or higher) to access the dashboard.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Pricing Calculator",
      description: "Calculate costs, FTE requirements, and billing rates for client deals.",
      icon: <Calculator className="h-8 w-8" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            The Pricing Calculator is the core tool for building client proposals. It helps you:
          </p>
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Facility Cost Comparison</p>
                <p className="text-xs text-muted-foreground">Compare costs across all 5 L&M facilities (Bensalem, Bristol, Warminster, Hammonton, Greenville)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Labor & Occupancy Analysis</p>
                <p className="text-xs text-muted-foreground">Calculate fully loaded labor rates, FTE requirements, and occupancy costs</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Value-Added Services</p>
                <p className="text-xs text-muted-foreground">Toggle case pick, layer pick, pallet pick, labeling, shrink wrap, and more</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">PDF Proposal Generation</p>
                <p className="text-xs text-muted-foreground">Generate professional locked proposals with contract terms and pricing tiers</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Sales Pipeline",
      description: "Track deals from lead to close with revenue forecasting.",
      icon: <TrendingUp className="h-8 w-8" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            The Sales Pipeline gives you visibility into all active and potential deals:
          </p>
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Kanban Board View</p>
                <p className="text-xs text-muted-foreground">Drag deals between stages: Lead → Proposal Sent → Under Review → Negotiating → Signed → Active</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Revenue Forecasting</p>
                <p className="text-xs text-muted-foreground">Track estimated monthly and annual revenue with probability weighting</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Quote Linking</p>
                <p className="text-xs text-muted-foreground">Link saved calculator quotes directly to pipeline deals for seamless tracking</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Capacity Tracking & Permissions",
      description: "Monitor facility utilization and understand your access level.",
      icon: <Building2 className="h-8 w-8" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Capacity Tracking helps manage facility space across all locations:
          </p>
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Monthly Capacity Input</p>
                <p className="text-xs text-muted-foreground">Update available square footage for each facility by month</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Utilization Dashboard</p>
                <p className="text-xs text-muted-foreground">Visual dashboard with alerts when facilities approach capacity limits</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm text-purple-700">About Permissions</p>
                <p className="text-xs text-purple-600">
                  Your access to specific sections is controlled by your administrator. If you need access to a section you can't see, contact your admin to request the specific permission.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Quick Quiz",
      description: "Answer these questions to complete the tutorial (80% required to pass).",
      icon: <FileText className="h-8 w-8" />,
      content: (
        <div className="space-y-6">
          {quizQuestions.map((q, qIndex) => (
            <div key={qIndex} className="space-y-3">
              <p className="font-medium text-sm">
                {qIndex + 1}. {q.question}
              </p>
              <RadioGroup
                value={quizAnswers[qIndex]?.toString()}
                onValueChange={(value) => {
                  setQuizAnswers(prev => ({ ...prev, [qIndex]: parseInt(value) }));
                }}
              >
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center space-x-2">
                    <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                    <Label htmlFor={`q${qIndex}-o${oIndex}`} className="text-sm cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;
  const isQuizStep = currentStep === totalSteps - 1;

  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach((q, i) => {
      if (quizAnswers[i] === q.correctIndex) correct++;
    });
    return Math.round((correct / quizQuestions.length) * 100);
  };

  const handleNext = () => {
    if (isLastStep) {
      // Submit quiz
      const allAnswered = quizQuestions.every((_, i) => quizAnswers[i] !== undefined);
      if (!allAnswered) {
        toast.error("Please answer all questions before submitting.");
        return;
      }

      const score = calculateScore();
      setShowResults(true);

      if (score >= 80) {
        completeTutorial.mutate({ score });
      } else {
        toast.error(`You scored ${score}%. You need at least 80% to pass. Please review and try again.`);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    setQuizAnswers({});
    setShowResults(false);
    setCurrentStep(0);
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content Card */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {currentStepData.icon}
              </div>
              <div>
                <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
                <CardDescription className="text-sm">{currentStepData.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showResults && isQuizStep ? (
              <div className="space-y-4 text-center">
                {calculateScore() >= 80 ? (
                  <>
                    <div className="mx-auto h-16 w-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-green-700">Congratulations!</h3>
                    <p className="text-muted-foreground">
                      You scored {calculateScore()}%. Redirecting to the dashboard...
                    </p>
                    {completeTutorial.isPending && (
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    )}
                  </>
                ) : (
                  <>
                    <div className="mx-auto h-16 w-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                      <FileText className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-red-700">Not Quite</h3>
                    <p className="text-muted-foreground">
                      You scored {calculateScore()}%. You need at least 80% to pass.
                    </p>
                    <Button onClick={handleRetry} className="mt-4">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Review & Try Again
                    </Button>
                  </>
                )}
              </div>
            ) : (
              currentStepData.content
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {!showResults && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleNext}>
              {isLastStep ? "Submit Quiz" : "Next"}
              {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
