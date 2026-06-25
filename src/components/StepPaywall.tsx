import { useState, useEffect } from "react";
import { ArrowLeft, Check, Lock, ShieldCheck, CreditCard, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { UserData } from "../types";

interface StepPaywallProps {
  userData: UserData;
  onBack: () => void;
  onPurchase: () => void;
  onSimulateUnlock: () => void;
  isUnlocking: boolean;
}

export default function StepPaywall({
  userData,
  onBack,
  onPurchase,
  onSimulateUnlock,
  isUnlocking
}: StepPaywallProps) {
  const [typedText, setTypedText] = useState("");
  const rawText = userData.market || "";

  // Perform a clean typewriter effect on the market report
  useEffect(() => {
    if (!rawText) return;
    
    const isFirstTime = !userData.fullPlan;
    if (!isFirstTime) {
      setTypedText(rawText);
      return;
    }

    setTypedText("");
    let currentIdx = 0;
    const intervalTime = rawText.length > 500 ? 3 : 5;

    const timer = setInterval(() => {
      setTypedText((prev) => prev + rawText.charAt(currentIdx));
      currentIdx++;
      if (currentIdx >= rawText.length) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [rawText, userData.fullPlan]);

  const features = [
    "Complete revenue model & pricing strategy",
    "Step-by-step 90-day launch roadmap",
    "Competitor analysis & your unique angle",
    "Marketing channels that fit your budget",
    "Downloadable PDF/text plan you can keep forever"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="w-full text-[#e8eaf6]"
    >
      {/* Target Market Output Report */}
      <div className="bg-[#131928] border border-[#1e2840] rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#22d3a0] mb-3">
          <ShieldCheck className="w-4 h-4 text-[#22d3a0]" />
          Step 2 Complete ✓ Target Market Profiling
        </div>
        
        {/* Output Text Block */}
        <div className="bg-[#0e1322] border border-[#1e2840] rounded-xl p-5 text-sm leading-relaxed text-[#c8cfe8] whitespace-pre-wrap min-h-[80px]">
          {typedText}
          {typedText.length < rawText.length && (
            <span className="inline-block w-2 h-4 bg-[#6c63ff] ml-0.5 animate-pulse" />
          )}
        </div>
      </div>

      {/* Paywall Card */}
      <div className="bg-gradient-to-br from-[#1a1040] to-[#131928] border border-[#6c63ff]/50 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl flex flex-col items-center">
        {/* Soft radial glow background element */}
        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[240px] h-[240px] bg-radial from-[#6c63ff]/20 to-transparent pointer-events-none" />

        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-full bg-[#1e154a] border border-[#6c63ff]/30 flex items-center justify-center text-[#a78bfa] mb-4 relative shadow-inner">
          <Lock className="w-6 h-6 animate-pulse" />
        </div>

        {/* Paywall Title */}
        <h2 className="font-syne text-2xl sm:text-3xl font-extrabold text-center text-white mb-2 tracking-tight">
          Unlock Your Full Business Plan
        </h2>
        <p className="text-[#7b82a0] text-sm text-center max-w-sm mb-6 leading-relaxed">
          You have validated your idea and analyzed your market. Now, unlock the ultimate, actionable strategy to bring your venture to life.
        </p>

        {/* Price Tag */}
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-xl font-bold text-[#a78bfa] font-sans">$</span>
          <span className="font-syne text-5xl sm:text-6xl font-extrabold text-white leading-none">
            17
          </span>
          <span className="text-xs text-[#7b82a0] ml-1 font-sans">one-time access</span>
        </div>

        {/* Features Checklist */}
        <ul className="w-full max-w-md bg-[#0b0f1a]/60 border border-[#1e2840] rounded-xl p-4 sm:p-5 mb-6 space-y-3.5 text-left text-sm text-[#b0b8d8]">
          {features.map((feature, idx) => (
            <li key={idx} className="flex gap-3 items-start pb-3 border-b border-[#1e2840]/60 last:border-b-0 last:pb-0">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#22d3a0]/10 border border-[#22d3a0]/30 flex items-center justify-center text-[#22d3a0]">
                <Check className="w-3 h-3" />
              </span>
              <span className="leading-snug">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Purchase Action Button */}
        <button
          onClick={onPurchase}
          disabled={isUnlocking}
          className="w-full max-w-md flex items-center justify-center gap-2 bg-[#22d3a0] hover:bg-[#1fb88d] active:translate-y-[1px] disabled:opacity-50 text-[#0b1a14] text-base font-bold py-4 px-6 rounded-xl shadow-xl transition cursor-pointer"
        >
          <CreditCard className="w-5 h-5" />
          Get My Full Plan — $17 →
        </button>

        {/* Simulated/Demo bypass button for sandbox testing */}
        <div className="mt-4 flex flex-col items-center">
          <button
            onClick={onSimulateUnlock}
            disabled={isUnlocking}
            className="inline-flex items-center gap-1.5 border border-dashed border-[#6c63ff] bg-[#6c63ff]/10 hover:bg-[#6c63ff]/20 text-[#a78bfa] hover:text-white text-xs font-semibold py-2 px-4 rounded-lg transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            🧪 Skip & Generate Free (Sandbox Demo)
          </button>
          <span className="text-[10px] text-[#525a75] mt-1.5">
            Perfect for reviewing inside the AI Studio preview window.
          </span>
        </div>

        {/* Guarantee details */}
        <p className="text-[11px] text-[#7b82a0] mt-6 flex items-center gap-1.5">
          🛡️ 30-day money-back guarantee · No questions asked
        </p>
      </div>

      {/* Back Button */}
      <div className="mt-6 flex justify-start">
        <button
          type="button"
          onClick={onBack}
          disabled={isUnlocking}
          className="flex items-center gap-1.5 border border-[#1e2840] hover:bg-[#131928] text-[#7b82a0] hover:text-[#e8eaf6] text-sm font-semibold px-5 py-3 rounded-xl transition duration-150 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Edit Market Profile
        </button>
      </div>
    </motion.div>
  );
}
