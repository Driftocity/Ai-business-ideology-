import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Target, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { UserData } from "../types";

interface StepMarketProps {
  userData: UserData;
  onBack: () => void;
  onSubmit: (customer: string, problem: string) => void;
  isLoading: boolean;
}

const CUSTOMER_TYPES = [
  "Regular consumers (B2C)",
  "Small businesses (B2B)",
  "Both consumers and businesses",
  "Teens / Young adults",
  "Parents / Families",
  "Seniors",
  "Not sure"
];

export default function StepMarket({ userData, onBack, onSubmit, isLoading }: StepMarketProps) {
  const [customer, setCustomer] = useState(userData.customer);
  const [problem, setProblem] = useState(userData.problem);
  const [error, setError] = useState("");
  const [typedText, setTypedText] = useState("");
  const rawText = userData.validation || "";

  // Perform a clean typewriter effect on the validation report
  useEffect(() => {
    if (!rawText) return;
    
    // If returning back to Step 2, render instantly; only animate if freshly analyzed
    const isFirstTime = !userData.market;
    if (!isFirstTime) {
      setTypedText(rawText);
      return;
    }

    setTypedText("");
    let currentIdx = 0;
    const intervalTime = rawText.length > 500 ? 3 : 5; // Adjust speed for longer text
    
    const timer = setInterval(() => {
      setTypedText((prev) => prev + rawText.charAt(currentIdx));
      currentIdx++;
      if (currentIdx >= rawText.length) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [rawText, userData.market]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) {
      setError("Please pick your target customer type.");
      return;
    }
    if (!problem.trim()) {
      setError("Please describe the specific problem your venture solves.");
      return;
    }
    setError("");
    onSubmit(customer, problem.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Step 1 Validation Result Box */}
      <div className="bg-[#131928] border border-[#1e2840] rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#22d3a0] mb-3">
          <ShieldCheck className="w-4 h-4 text-[#22d3a0]" />
          Step 1 Complete ✓ Idea Validation Report
        </div>
        
        {/* Output Text Block */}
        <div className="bg-[#0e1322] border border-[#1e2840] rounded-xl p-5 text-sm leading-relaxed text-[#c8cfe8] whitespace-pre-wrap min-h-[80px]">
          {typedText}
          {typedText.length < rawText.length && (
            <span className="inline-block w-2 h-4 bg-[#6c63ff] ml-0.5 animate-pulse" />
          )}
        </div>
      </div>

      {/* Screen 2 Prompt Card */}
      <div className="bg-[#131928] border border-[#1e2840] rounded-2xl p-6 sm:p-7 mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#a78bfa] mb-2.5">
          <Target className="w-4 h-4 text-[#6c63ff]" />
          Step 2 of 3 — Free Market Profiling
        </div>
        <h2 className="font-syne text-xl sm:text-2xl font-bold text-white mb-2">
          Who is your primary customer?
        </h2>
        <p className="text-[#7b82a0] text-sm leading-relaxed">
          Provide some high-level details on who you are serving and the specific headache you alleviate, so we can craft your customer profiles and channel strategies.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Customer Select dropdown */}
        <div>
          <label className="block text-xs font-semibold text-[#7b82a0] uppercase tracking-wider mb-2">
            Who are you selling to?
          </label>
          <select
            id="customer-select"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            disabled={isLoading}
            className="w-full bg-[#0e1322] border border-[#1e2840] rounded-xl text-[#e8eaf6] text-sm p-3.5 focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]/40 transition disabled:opacity-50"
          >
            <option value="">— Pick one —</option>
            {CUSTOMER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Problem textarea */}
        <div>
          <label className="block text-xs font-semibold text-[#7b82a0] uppercase tracking-wider mb-2">
            What pain point or problem do you solve?
          </label>
          <textarea
            id="problem-input"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            disabled={isLoading}
            placeholder="Example: Pet owners find standard kennel services highly stressful for dogs and struggle to schedule trustable, last-minute caretakers..."
            className="w-full min-h-[100px] bg-[#0e1322] border border-[#1e2840] rounded-xl text-[#e8eaf6] text-sm p-3.5 focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]/40 transition disabled:opacity-50 resize-y placeholder:text-[#525a75]"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="text-[#f87171] text-xs font-medium bg-[#f87171]/10 border border-[#f87171]/20 rounded-lg p-3">
            ⚠️ {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 border border-[#1e2840] hover:bg-[#131928] text-[#7b82a0] hover:text-[#e8eaf6] text-sm font-semibold px-5 py-4 rounded-xl transition duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-[#6c63ff] hover:bg-[#574fd6] active:translate-y-[1px] disabled:opacity-60 disabled:pointer-events-none text-white text-sm font-semibold p-4 rounded-xl shadow-lg transition duration-200 cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing Market...
              </div>
            ) : (
              <>
                Analyze My Market
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
