import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function Header() {
  return (
    <header className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 px-2">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="font-syne font-black text-xl text-white">L</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-[#a78bfa] bg-clip-text text-transparent font-syne">
            LaunchMind
          </h1>
          <span className="text-[10px] text-[#7b82a0] tracking-widest uppercase font-semibold">
            AI Business Architect
          </span>
        </div>
      </div>

      {/* Stats Pile & User Status */}
      <div className="flex items-center gap-6 flex-wrap justify-center sm:justify-end">
        {/* Avatars & Count */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full border-2 border-[#0b0f1a] bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">JD</div>
            <div className="w-7 h-7 rounded-full border-2 border-[#0b0f1a] bg-[#6c63ff] flex items-center justify-center text-[10px] font-bold text-white">F</div>
            <div className="w-7 h-7 rounded-full border-2 border-[#0b0f1a] bg-[#22d3a0] flex items-center justify-center text-[10px] font-bold text-[#0b1a14]">AI</div>
          </div>
          <span className="text-xs text-[#7b82a0] font-medium">
            <strong className="text-white font-semibold">1,248</strong> founders building today
          </span>
        </div>

        {/* User Session Token / Anonymous Secure Status Tag */}
        <div className="flex items-center gap-2 bg-[#131928] border border-[#1e2840] rounded-lg px-3 py-1.5 text-xs text-slate-300 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22d3a0] animate-pulse" />
          <span className="font-mono text-slate-300 tracking-wide font-medium">
            Secure Session Active
          </span>
        </div>
      </div>
    </header>
  );
}

