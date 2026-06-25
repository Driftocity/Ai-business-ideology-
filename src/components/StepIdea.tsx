import React, { useState } from "react";
import { ArrowRight, Lightbulb, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { UserData } from "../types";

interface StepIdeaProps {
  userData: UserData;
  onSubmit: (idea: string, industry: string, budget: string) => void;
  isLoading: boolean;
}

const INDUSTRIES = [
  "E-commerce / Retail",
  "Food & Beverage",
  "Health & Wellness",
  "Tech / Software / App",
  "Services / Freelance",
  "Education / Coaching",
  "Real Estate",
  "Finance / Investing",
  "Beauty / Fashion",
  "Other"
];

const BUDGETS = [
  "$0 – $500 (bootstrapping)",
  "$500 – $2,000",
  "$2,000 – $10,000",
  "$10,000+",
  "Not sure yet"
];

export default function StepIdea({ userData, onSubmit, isLoading }: StepIdeaProps) {
  const [idea, setIdea] = useState(userData.idea);
  const [industry, setIndustry] = useState(userData.industry);
  const [budget, setBudget] = useState(userData.budget);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      setError("Please describe your business idea first.");
      return;
    }
    if (!industry) {
      setError("Please select an industry sector.");
      return;
    }
    if (!budget) {
      setError("Please specify a startup budget tier.");
      return;
    }
    setError("");
    onSubmit(idea.trim(), industry, budget);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Description Card */}
      <div className="bg-[#131928] border border-[#1e2840] rounded-2xl p-6 sm:p-7 mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#a78bfa] mb-2.5">
          <Lightbulb className="w-4 h-4 text-[#6c63ff]" />
          Step 1 of 3 — Free Idea Validation
        </div>
        <h2 className="font-syne text-xl sm:text-2xl font-bold text-white mb-2">
          Tell us about your venture concept
        </h2>
        <p className="text-[#7b82a0] text-sm leading-relaxed">
          It doesn't need to be polished or complete. Simply describe what problem you wish to solve and how. We'll help shape and validate the core idea!
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Business Idea Description */}
        <div>
          <label className="block text-xs font-semibold text-[#7b82a0] uppercase tracking-wider mb-2">
            What's your business idea?
          </label>
          <textarea
            id="idea-input"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            disabled={isLoading}
            placeholder="Example: A mobile app that connects local dog owners with certified pet sitters for last-minute bookings..."
            className="w-full min-h-[120px] bg-[#0e1322] border border-[#1e2840] rounded-xl text-[#e8eaf6] text-sm p-3.5 focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]/40 transition disabled:opacity-50 resize-y placeholder:text-[#525a75]"
          />
        </div>

        {/* Industry dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#7b82a0] uppercase tracking-wider mb-2">
              What industry is this in?
            </label>
            <select
              id="industry-select"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              disabled={isLoading}
              className="w-full bg-[#0e1322] border border-[#1e2840] rounded-xl text-[#e8eaf6] text-sm p-3.5 focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]/40 transition disabled:opacity-50"
            >
              <option value="">— Pick one —</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Budget dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#7b82a0] uppercase tracking-wider mb-2">
              Do you have a startup budget?
            </label>
            <select
              id="budget-select"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              disabled={isLoading}
              className="w-full bg-[#0e1322] border border-[#1e2840] rounded-xl text-[#e8eaf6] text-sm p-3.5 focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]/40 transition disabled:opacity-50"
            >
              <option value="">— Pick one —</option>
              {BUDGETS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-[#f87171] text-xs font-medium bg-[#f87171]/10 border border-[#f87171]/20 rounded-lg p-3">
            ⚠️ {error}
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#6c63ff] hover:bg-[#574fd6] active:translate-y-[1px] disabled:opacity-60 disabled:pointer-events-none text-white text-sm font-semibold p-4 rounded-xl shadow-lg transition duration-200 cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Validating My Idea...
            </div>
          ) : (
            <>
              Validate My Idea
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
