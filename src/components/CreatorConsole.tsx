import React, { useState } from "react";
import { 
  Wrench, 
  Lock, 
  Unlock, 
  Sparkles, 
  RefreshCw, 
  Play, 
  Check, 
  X, 
  Flame, 
  Terminal, 
  Layers 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserData } from "../types";

interface CreatorConsoleProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  setCurrentStep: (step: number) => void;
  triggerFullPlan: (data: UserData) => void;
  onReset: () => void;
}

const PRESETS = [
  {
    name: "💇‍♂️ Barber Scheduler SaaS",
    idea: "A cloud-based real-time calendar and appointment scheduler with automatic SMS reminders and tipping optimization for busy barbers and salons.",
    industry: "B2B SaaS / Booking",
    budget: "$300 starting capital",
    customer: "Local barbershop owners and solo hair stylists",
    problem: "High no-show rates and hours lost coordinating bookings over text/phone.",
    validation: "Validated: Stylists lose up to 15% of daily revenue to last-minute cancellations. Automatic deposit booking reduces no-shows by 82%.",
    market: "Target Market Report:\n- Industry size: $8.5B salon management market.\n- Growth trajectory: 12.4% CAGR.\n- Channels: Direct walk-ins, Instagram portfolio ads, local maps indexing.\n- Competitive Edge: Built-in tipping mechanics and zero-setup booking URLs."
  },
  {
    name: "☕ Local Coffee Subscription",
    idea: "A local morning coffee delivery service sending premium hot coffee to home office workers within a 3-mile radius via e-bike dispatch.",
    industry: "Hyperlocal Delivery",
    budget: "$150 starting capital",
    customer: "Work-from-home remote professionals who want barista coffee without interrupting meetings",
    problem: "Getting premium coffee during busy mornings requires pausing work and waiting in long shop lines.",
    validation: "Validated: Hyperlocal subscriptions show a 73% retention rate. Active remote workers order coffee average of 4.2 times per week.",
    market: "Target Market Report:\n- Industry size: $46B coffee retail market.\n- Growth trajectory: 8.5% CAGR.\n- Channels: Local SEO, door-hangers, hyper-targeted Facebook geo-ads.\n- Competitive Edge: Hot-pot delivery bag technology and scheduled deliveries."
  },
  {
    name: "✍️ B2B AI Copywriting Agency",
    idea: "An automated agency writing SEO-optimized local service pages and blog posts for plumbers, electricians, and contractors using highly custom LLM pipelines.",
    industry: "Agency / Marketing Tech",
    budget: "$100 starting capital",
    customer: "Residential contractors and home service business owners",
    problem: "Contractors want local Google Search ranking but have no time or writing skills to craft optimized SEO pages.",
    validation: "Validated: Plumbing and HVAC keywords command over $40 CPC. Generating customized service pages increases organic phone call leads by 120%.",
    market: "Target Market Report:\n- Industry size: $15B local contractor marketing market.\n- Growth trajectory: 15.2% CAGR.\n- Channels: Cold outreach emails, Google Maps scrapers, direct LinkedIn network messages.\n- Competitive Edge: Automated niche keyword analysis and hyper-localized text templates."
  }
];

export default function CreatorConsole({
  userData,
  setUserData,
  setCurrentStep,
  triggerFullPlan,
  onReset
}: CreatorConsoleProps) {
  // Check URL parameters or sessionStorage to see if the seller panel should be visible
  const [isVisible, setIsVisible] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const hasParam = params.get("admin") === "true" || params.get("seller") === "true" || params.get("creator") === "true";
    const wasUnlocked = sessionStorage.getItem("launchmind_seller_unlocked") === "true";
    const wasVisible = sessionStorage.getItem("launchmind_seller_visible") === "true";
    
    if (hasParam) {
      sessionStorage.setItem("launchmind_seller_visible", "true");
      return true;
    }
    return wasUnlocked || wasVisible;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem("launchmind_seller_unlocked") === "true";
  });
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [isInjecting, setIsInjecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Strict secure passcode check
    const secretPasscode = "LaunchMind2026!";
    if (passcode.trim() === secretPasscode) {
      setIsUnlocked(true);
      setErrorMsg("");
      sessionStorage.setItem("launchmind_seller_unlocked", "true");
    } else {
      setErrorMsg("Invalid secret passcode. Please try again.");
    }
  };

  const handleApplyPreset = async (idx: number) => {
    setIsInjecting(true);
    const preset = PRESETS[idx];
    setSelectedPreset(idx);

    // Formulate completed state
    const upgradedData: UserData = {
      ...userData,
      idea: preset.idea,
      industry: preset.industry,
      budget: preset.budget,
      customer: preset.customer,
      problem: preset.problem,
      validation: preset.validation,
      market: preset.market,
      isPaid: true
    };

    setUserData(upgradedData);
    sessionStorage.setItem("launchmind_data", JSON.stringify(upgradedData));
    setCurrentStep(4);

    // Call plan generation backend
    try {
      await triggerFullPlan(upgradedData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsInjecting(false);
      setIsOpen(false);
    }
  };

  const handleInstantBypass = () => {
    // Force set as paid and jump directly
    const upgradedData = { ...userData, isPaid: true };
    if (!upgradedData.idea) {
      // Inject some mock inputs if user hasn't filled anything
      upgradedData.idea = "Automated local business scheduler with automated reminders.";
      upgradedData.industry = "B2B SaaS / Booking";
      upgradedData.budget = "$500";
      upgradedData.customer = "Local business owners";
      upgradedData.problem = "Managing bookings over text.";
      upgradedData.validation = "Fully Validated";
      upgradedData.market = "Complete market outline";
    }

    setUserData(upgradedData);
    sessionStorage.setItem("launchmind_data", JSON.stringify(upgradedData));
    setCurrentStep(4);
    triggerFullPlan(upgradedData);
    setIsOpen(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-3 rounded-full shadow-2xl transition border border-purple-500/30 cursor-pointer animate-pulse hover:animate-none"
        >
          <Wrench className="w-4 h-4" />
          Seller Command Panel
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-[#070a12]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0e1322] border border-[#2d3a5a] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-[#131928] px-6 py-4 border-b border-[#1e2840] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-syne text-sm font-bold text-white uppercase tracking-wider">
                      Seller Command Panel
                    </h3>
                    <p className="text-[10px] text-[#7b82a0]">
                      Generate premium commercial strategy packages instantly
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#1e2840] text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {!isUnlocked ? (
                  /* Passcode Screen */
                  <form onSubmit={handleUnlock} className="space-y-4 py-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-2">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">Enter Seller Access Pin</h4>
                      <p className="text-xs text-[#7b82a0]">
                        Unlock seller presets and instant bypass tools
                      </p>
                    </div>
                    
                    {errorMsg && (
                      <p className="text-xs text-red-400 font-semibold bg-red-500/10 py-1.5 px-3 rounded-lg max-w-xs mx-auto animate-shake">
                        {errorMsg}
                      </p>
                    )}

                    <div className="max-w-xs mx-auto flex gap-2">
                      <input
                        type="password"
                        placeholder="Enter secret seller passcode"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="bg-[#080b12] border border-[#2d3a5a] rounded-xl px-4 py-3 text-sm text-white w-full text-center font-mono focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 rounded-xl cursor-pointer"
                      >
                        Enter
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Unlocked Console Content */
                  <div className="space-y-6">
                    
                    {/* Instant Force Bypass */}
                    <div className="bg-[#131928] border border-[#1e2840] rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                          <Layers className="w-4 h-4 text-emerald-400" />
                          1. Premium State Force Unlock
                        </div>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                          ONLINE
                        </span>
                      </div>
                      <p className="text-xs text-[#7b82a0] leading-relaxed">
                        Skip all verification inputs and payment screens. Click to instantly force-unlock Step 4 (The Premium Suite) with whatever ideas are in your active session.
                      </p>
                      <button
                        onClick={handleInstantBypass}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:text-white text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        Instantly Bypass to Step 4 Premium →
                      </button>
                    </div>

                    {/* Presets - Instant Sales Demonstrations */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                        <Sparkles className="w-4.5 h-4.5 text-[#a78bfa] animate-pulse" />
                        2. Launch Premium Sales Presets
                      </div>
                      <p className="text-xs text-[#7b82a0] leading-relaxed">
                        Select one of our commercially tailored starter templates. The console will instantly inject the idea, complete both validation steps, bypass the paywall, and trigger the AI content pipeline. Perfect for quick presentations!
                      </p>

                      <div className="space-y-2.5">
                        {PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleApplyPreset(idx)}
                            disabled={isInjecting}
                            className="w-full text-left bg-[#131928] hover:bg-[#182033] border border-[#1e2840] hover:border-indigo-500/50 p-3.5 rounded-xl transition flex items-center justify-between group disabled:opacity-50 cursor-pointer"
                          >
                            <div className="space-y-1 max-w-[85%]">
                              <span className="font-bold text-xs text-white group-hover:text-indigo-300 transition">
                                {preset.name}
                              </span>
                              <p className="text-[10px] text-[#7b82a0] truncate">
                                {preset.idea}
                              </p>
                            </div>
                            {isInjecting && selectedPreset === idx ? (
                              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reset Button */}
                    <div className="pt-2 border-t border-[#1e2840]/60 flex justify-between items-center text-[11px] text-[#525a75]">
                      <span>Active Session Reset Tools:</span>
                      <button
                        onClick={() => {
                          onReset();
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center gap-1 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 py-1.5 px-3 rounded-lg transition cursor-pointer text-red-400"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        Wipe & Reset Session
                      </button>
                    </div>

                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
