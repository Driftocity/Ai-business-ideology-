import { useState, useEffect } from "react";
import { Sparkles, HelpCircle, Check, ShieldAlert, Award, TrendingUp, Compass } from "lucide-react";
import Header from "./components/Header";
import StepIdea from "./components/StepIdea";
import StepMarket from "./components/StepMarket";
import StepPaywall from "./components/StepPaywall";
import StepFullPlan from "./components/StepFullPlan";
import { UserData, StepNumber } from "./types";

export default function App() {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [userData, setUserData] = useState<UserData>({
    idea: "",
    industry: "",
    budget: "",
    customer: "",
    problem: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Loading messages to cycle through during plan generation
  const [loadingMessage, setLoadingMessage] = useState("Constructing your customized revenue models...");
  const loadingMessages = [
    "Consulting local market databases...",
    "Drafting detailed pricing frameworks...",
    "Formulating competitive advantages...",
    "Structuring the 90-day launch sequence...",
    "Organizing first actionable milestones..."
  ];

  useEffect(() => {
    let index = 0;
    if (isUnlocking) {
      const interval = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[index]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isUnlocking]);

  // Handle URL restoration and initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "true") {
      const saved = sessionStorage.getItem("launchmind_data");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as UserData;
          setUserData({ ...parsed, isPaid: true });
          setCurrentStep(4);
          triggerFullPlanGeneration(parsed);
        } catch (e) {
          console.error("Failed to restore saved checkout session", e);
        }
      }
    } else {
      const saved = sessionStorage.getItem("launchmind_data");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as UserData;
          setUserData(parsed);
          if (parsed.fullPlan) {
            setCurrentStep(4);
          } else if (parsed.market) {
            setCurrentStep(3);
          } else if (parsed.validation) {
            setCurrentStep(2);
          }
        } catch (e) {
          console.error("Failed to recover draft session", e);
        }
      }
    }
  }, []);

  const saveToSession = (newData: UserData) => {
    sessionStorage.setItem("launchmind_data", JSON.stringify(newData));
  };

  // STEP 1 Action: Validate Idea
  const handleValidateIdeaSubmit = async (idea: string, industry: string, budget: string) => {
    setIsLoading(true);
    setErrorMessage("");
    
    const updatedUserData = { ...userData, idea, industry, budget };
    setUserData(updatedUserData);
    saveToSession(updatedUserData);
    
    setCurrentStep(2);

    try {
      const res = await fetch("/api/validate-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, industry, budget }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const finalUserData = { ...updatedUserData, validation: data.result };
      setUserData(finalUserData);
      saveToSession(finalUserData);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An error occurred during idea validation. Please try again.");
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2 Action: Analyze Market
  const handleAnalyzeMarketSubmit = async (customer: string, problem: string) => {
    setIsLoading(true);
    setErrorMessage("");

    const updatedUserData = { ...userData, customer, problem };
    setUserData(updatedUserData);
    saveToSession(updatedUserData);

    setCurrentStep(3);

    try {
      const res = await fetch("/api/analyze-market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: userData.idea,
          industry: userData.industry,
          customer,
          problem,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      const finalUserData = { ...updatedUserData, market: data.result };
      setUserData(finalUserData);
      saveToSession(finalUserData);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to complete market analysis. Please try again.");
      setCurrentStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3 Action: Real Purchase
  const handlePurchaseRedirect = () => {
    saveToSession(userData);
    window.location.href = "https://buy.stripe.com/3cIcN5ghSglUf7R7cP00007";
  };

  // STEP 3 Action: Sandbox skip/unlock
  const handleSimulatedUnlock = () => {
    const updatedUserData = { ...userData, isPaid: true };
    setUserData(updatedUserData);
    saveToSession(updatedUserData);
    setCurrentStep(4);
    triggerFullPlanGeneration(updatedUserData);
  };

  // STEP 4 Generation
  const triggerFullPlanGeneration = async (dataToUse: UserData) => {
    setIsUnlocking(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: dataToUse.idea,
          industry: dataToUse.industry,
          budget: dataToUse.budget,
          customer: dataToUse.customer,
          problem: dataToUse.problem,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to build plan: server returned code ${res.status}`);
      }

      const data = await res.json();
      const finalUserData = { ...dataToUse, fullPlan: data.result };
      setUserData(finalUserData);
      saveToSession(finalUserData);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An error occurred while generating your business plan.");
      setCurrentStep(3);
    } finally {
      setIsUnlocking(false);
    }
  };

  // --- Dynamic Bento Data Calculators ---

  // 1. Viability Score (stable value calculated based on inputs)
  const getViabilityScore = () => {
    if (!userData.idea) return 0;
    // Calculate deterministic hash score based on idea + industry strings
    const seed = userData.idea.length * 3 + (userData.industry?.length || 5) * 7;
    return (seed % 18) + 78; // Always between 78% and 95%
  };

  const viabilityScore = getViabilityScore();

  // 2. Industry statistics matching chosen category
  const getIndustryStats = () => {
    const ind = userData.industry || "";
    if (ind.includes("Tech") || ind.includes("Software")) {
      return { size: "$4.2B", growth: "18% YoY", title: "Global Pet Tech", color: "text-[#6c63ff]" };
    } else if (ind.includes("Retail") || ind.includes("E-commerce")) {
      return { size: "$5.1B", growth: "12% YoY", title: "Direct-to-Consumer", color: "text-[#a78bfa]" };
    } else if (ind.includes("Food")) {
      return { size: "$1.8B", growth: "8% YoY", title: "Food & Wellness Care", color: "text-[#22d3a0]" };
    } else if (ind.includes("Health")) {
      return { size: "$2.9B", growth: "15% YoY", title: "Specialized Well-tech", color: "text-emerald-400" };
    } else if (ind.includes("Services")) {
      return { size: "$950M", growth: "11% YoY", title: "On-demand Services", color: "text-blue-400" };
    }
    return { size: "$1.2B", growth: "10% YoY", title: "Niche Services Market", color: "text-indigo-400" };
  };

  const indStats = getIndustryStats();

  // 3. Dynamic competitor profiles
  const getCompetitors = () => {
    const ind = userData.industry || "";
    if (ind.includes("Tech") || ind.includes("Software")) {
      return [
        { name: "WagAware AI", status: "Established", statusColor: "text-indigo-400" },
        { name: "PetPulse Pro", status: "New Entry", statusColor: "text-[#22d3a0]" },
        { name: "FidoFlow", status: "Dormant", statusColor: "text-slate-600" }
      ];
    } else if (ind.includes("Retail") || ind.includes("E-commerce")) {
      return [
        { name: "CartPulse", status: "Established", statusColor: "text-indigo-400" },
        { name: "Sovereign Brand", status: "New Entry", statusColor: "text-[#22d3a0]" },
        { name: "LegacyShop", status: "Dormant", statusColor: "text-slate-600" }
      ];
    } else {
      return [
        { name: "Alpha Service Co", status: "Established", statusColor: "text-indigo-400" },
        { name: "DirectReach Inc", status: "New Entry", statusColor: "text-[#22d3a0]" },
        { name: "Static Retailers", status: "Dormant", statusColor: "text-slate-600" }
      ];
    }
  };

  const competitors = getCompetitors();

  // 4. Milestone title and current progress
  const getMilestoneDetails = () => {
    switch (currentStep) {
      case 1:
        return { title: "Drafting the Business Vision", progress: 25 };
      case 2:
        return { title: "Establishing Customer Profiles", progress: 50 };
      case 3:
        return { title: "Preparing Revenue Formula", progress: 75 };
      case 4:
        return { title: "Executing 90-Day Roadmap", progress: 100 };
    }
  };

  const milestone = getMilestoneDetails();

  return (
    <div className="min-h-screen bg-[#0b0f1a] font-sans text-[#e8eaf6] flex flex-col p-4 sm:p-6 md:p-8">
      {/* Bento Header */}
      <Header userEmail="RAYMONDHOCKERSMITH@gmail.com" />

      {/* Main Bento Grid Container */}
      <main className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-6 gap-5 flex-grow max-w-7xl w-full mx-auto mt-2">
        
        {/* Row 1-4, Col 1-8: Interactive Step Panel */}
        <section className="col-span-1 md:col-span-8 md:row-span-4 bg-[#131928] border border-[#1e2840] rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-xl min-h-[500px]">
          {/* Card Context Decor */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#6c63ff]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex-grow flex flex-col">
            {/* Error Message banner */}
            {errorMessage && (
              <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-[#f87171] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#f87171] shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button 
                  onClick={() => setErrorMessage("")}
                  className="text-[#a78bfa] underline ml-2 font-semibold hover:text-white cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Dynamic Step Loader Wrapper */}
            {currentStep === 1 && (
              <StepIdea
                userData={userData}
                onSubmit={handleValidateIdeaSubmit}
                isLoading={isLoading}
              />
            )}

            {currentStep === 2 && (
              <StepMarket
                userData={userData}
                onBack={() => setCurrentStep(1)}
                onSubmit={handleAnalyzeMarketSubmit}
                isLoading={isLoading}
              />
            )}

            {currentStep === 3 && (
              <StepPaywall
                userData={userData}
                onBack={() => setCurrentStep(2)}
                onPurchase={handlePurchaseRedirect}
                onSimulateUnlock={handleSimulatedUnlock}
                isUnlocking={isUnlocking}
              />
            )}

            {currentStep === 4 && (
              <>
                {isUnlocking ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-12 h-12 border-4 border-[#6c63ff]/20 border-t-[#6c63ff] rounded-full animate-spin" />
                      <Sparkles className="w-5 h-5 text-[#a78bfa] animate-pulse" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h3 className="font-syne text-lg font-bold text-white uppercase tracking-wider">
                        Assembling Strategy
                      </h3>
                      <p className="text-[#7b82a0] text-sm leading-relaxed animate-pulse">
                        {loadingMessage}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#525a75]">
                      This takes about 10-15 seconds. Thank you for your patience.
                    </span>
                  </div>
                ) : (
                  <StepFullPlan userData={userData} />
                )}
              </>
            )}
          </div>

          {/* Subtly animated decorative status line inside form card footer */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#1e2840]/30 text-[11px] text-[#525a75] relative z-10">
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isLoading || isUnlocking ? "bg-amber-400 animate-ping" : "bg-emerald-500"}`} />
                AI Consultant Core: Ready
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Venture Sandbox Enabled
              </span>
            </div>
            <span>LaunchMind © 2026</span>
          </div>
        </section>

        {/* Row 1-3, Col 9-12: Viability Score Card */}
        <section className="col-span-1 md:col-span-4 md:row-span-3 bg-[#131928] border border-[#1e2840] rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-xl text-center">
          <div className="absolute top-4 left-4 flex items-center gap-1 bg-[#1e2840]/40 border border-[#1e2840] px-2.5 py-1 rounded-full text-[10px] uppercase font-bold text-[#a78bfa] tracking-wider">
            <Compass className="w-3.5 h-3.5 text-[#6c63ff]" />
            Viability index
          </div>

          <div className="relative w-36 h-36 mt-4">
            {/* Background circle track */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#1e2840"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#6c63ff"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * (viabilityScore || 10)) / 100}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white tracking-tighter font-syne">
                {viabilityScore ? `${viabilityScore}%` : "—"}
              </span>
              <span className="text-[10px] text-[#22d3a0] font-bold uppercase tracking-tight">
                {viabilityScore ? "High Potential" : "Awaiting Input"}
              </span>
            </div>
          </div>

          <p className="text-[#7b82a0] text-xs leading-relaxed mt-6 px-2">
            {userData.idea ? (
              <>
                The <strong className="text-white font-semibold">{userData.industry}</strong> sector is currently growing at{" "}
                <strong className="text-white font-semibold">{indStats.growth}</strong> with robust demand.
              </>
            ) : (
              "Complete Step 1 to dynamically calculate model market viability, sector growth triggers, and launch potential."
            )}
          </p>
        </section>

        {/* Row 4, Col 9-12: Small Info: Industry Peak */}
        <section className="col-span-1 md:col-span-4 md:row-span-1 bg-[#131928] border border-[#1e2840] rounded-3xl p-5 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-[10px] text-[#7b82a0] font-bold uppercase tracking-widest block mb-0.5">
              Sector Market Size
            </span>
            <p className="text-2xl font-black font-syne text-white tracking-tight">
              {userData.idea ? indStats.size : "—"}
            </p>
          </div>
          
          {/* Sparkline decoration graph */}
          <div className="h-9 w-20 bg-indigo-900/10 border border-indigo-500/10 rounded-lg flex items-end gap-1 p-1.5">
            <div className={`w-full ${userData.idea ? "h-2/5" : "h-1/5"} bg-[#6c63ff]/40 rounded-sm transition-all duration-500`} />
            <div className={`w-full ${userData.idea ? "h-3/5" : "h-1/5"} bg-[#6c63ff]/60 rounded-sm transition-all duration-500`} />
            <div className={`w-full ${userData.idea ? "h-4/5" : "h-1/5"} bg-[#6c63ff]/80 rounded-sm transition-all duration-500`} />
            <div className={`w-full ${userData.idea ? "h-full" : "h-1/5"} bg-[#6c63ff] rounded-sm transition-all duration-500`} />
          </div>
        </section>

        {/* Row 5-6, Col 1-4: Competitor Landscape */}
        <section className="col-span-1 md:col-span-4 md:row-span-2 bg-[#131928] border border-[#1e2840] rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#7b82a0] uppercase tracking-widest mb-4">
              Competitor Landscape
            </h3>
            <ul className="space-y-3">
              {competitors.map((comp, index) => (
                <li key={index} className="flex items-center justify-between text-xs py-1.5 border-b border-[#1e2840]/30 last:border-0 last:pb-0">
                  <span className="text-[#c8cfe8] font-medium">{comp.name}</span>
                  <span className={`font-mono text-[10px] px-2 py-0.5 bg-[#0e1322] border border-[#1e2840] rounded ${comp.statusColor}`}>
                    {comp.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <span className="text-[9px] text-[#525a75] tracking-tight uppercase font-medium block mt-4">
            * Calibrated based on selected industry
          </span>
        </section>

        {/* Row 5-6, Col 5-8: Next Major Milestone */}
        <section className="col-span-1 md:col-span-4 md:row-span-2 bg-[#131928] border border-[#1e2840] rounded-3xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="absolute top-4 right-4 text-[#22d3a0]/80">
            <Award className="w-5 h-5 animate-bounce" />
          </div>

          <div>
            <h3 className="text-xs font-bold text-[#7b82a0] uppercase tracking-widest mb-2.5">
              Current Milestone Progress
            </h3>
            <p className="text-sm font-semibold text-white leading-snug">
              {milestone?.title}
            </p>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center text-[10px] text-[#7b82a0] mb-2 font-mono">
              <span>Overall Build Sequence</span>
              <span className="text-white font-bold">{milestone?.progress}%</span>
            </div>
            <div className="w-full bg-[#1e2840] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#22d3a0] to-[#6c63ff] h-full rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${milestone?.progress}%` }}
              />
            </div>
          </div>
        </section>

        {/* Row 5-6, Col 9-12: Premium / CTA Upgrade Promo Block */}
        <section className={`col-span-1 md:col-span-4 md:row-span-2 rounded-3xl p-6 flex flex-col justify-between shadow-xl transition duration-300 ${
          userData.isPaid 
            ? "bg-gradient-to-br from-[#102a24] to-[#131928] border border-[#22d3a0]/40" 
            : "bg-gradient-to-br from-[#6c63ff] to-[#4c45cf] text-white"
        }`}>
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base sm:text-lg">
                {userData.isPaid ? "Premium Package Active" : "Unlock Premium Plan"}
              </h3>
              <Sparkles className="w-4.5 h-4.5 text-white/90 animate-pulse" />
            </div>
            <p className="text-xs leading-relaxed opacity-85">
              {userData.isPaid 
                ? "Your full strategy, launch metrics, competitive angles, and downloadables are fully operational."
                : "Get 25+ pages of deep-dive startup strategy, exact pricing models, and direct action checklists."
              }
            </p>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            {userData.isPaid ? (
              <div className="flex items-center gap-1.5 text-[#22d3a0] font-bold text-xs">
                <Check className="w-4 h-4 shrink-0" /> Unlocked
              </div>
            ) : (
              <div className="font-black text-xl">
                $17<span className="text-[10px] font-normal opacity-70">/once</span>
              </div>
            )}

            {!userData.isPaid ? (
              <button 
                onClick={() => {
                  if (currentStep < 3) {
                    setCurrentStep(3);
                  } else {
                    handleSimulatedUnlock();
                  }
                }}
                className="bg-white text-[#6c63ff] hover:bg-slate-50 active:scale-[0.98] px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer transition"
              >
                Upgrade Now
              </button>
            ) : (
              <span className="text-[10px] font-semibold opacity-70 font-mono text-white">
                Member Tier
              </span>
            )}
          </div>
        </section>
      </main>

      {/* Bento Footer Bar */}
      <footer className="w-full max-w-7xl mx-auto mt-10 py-6 border-t border-[#1e2840]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[#525a75] font-medium px-2">
        <div className="flex gap-4">
          <a href="#" className="hover:text-[#a78bfa] transition">PRIVACY POLICY</a>
          <a href="#" className="hover:text-[#a78bfa] transition">TERMS OF SERVICE</a>
          <a href="#" className="hover:text-[#a78bfa] transition">AI COMPLIANCE</a>
        </div>
        <div className="text-center sm:text-right">
          © 2026 LAUNCHMIND INTELLIGENCE SYSTEM. ALL RIGHTS RESERVED. · SUPPORT@LAUNCHMIND.AI
        </div>
      </footer>
    </div>
  );
}
