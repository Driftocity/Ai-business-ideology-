import { Sparkles, Download, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { UserData } from "../types";
import { parsePlan } from "../utils/planParser";

interface StepFullPlanProps {
  userData: UserData;
}

export default function StepFullPlan({ userData }: StepFullPlanProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const rawPlanText = userData.fullPlan || "";
  const parsedSections = parsePlan(rawPlanText);

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleDownload = () => {
    const textHeader = `LAUNCHMIND — CUSTOM BUSINESS PLAN\n` + 
      `========================================\n` + 
      `Venture Idea: ${userData.idea || "Not provided"}\n` + 
      `Industry Segment: ${userData.industry || "Not provided"}\n` + 
      `Startup Capital: ${userData.budget || "Not provided"}\n` + 
      `Target Customer: ${userData.customer || "Not provided"}\n` + 
      `Pain Point Solved: ${userData.problem || "Not provided"}\n` + 
      `========================================\n\n`;

    const fullText = textHeader + rawPlanText;
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `LaunchMind-${(userData.industry || "Business-Plan").replace(/[^a-z0-9]/gi, "-")}-Plan.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-6 text-[#e8eaf6]"
    >
      {/* Confirmed Banner */}
      <div className="bg-[#131928] border border-[#22d3a0]/40 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-[#22d3a0]/10 border border-[#22d3a0]/30 flex items-center justify-center text-[#22d3a0] shrink-0">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#22d3a0]">
            ✓ Access Confirmed — Full Plan Unlocked
          </span>
          <h2 className="font-syne text-xl sm:text-2xl font-bold text-white leading-tight">
            Your Complete Business Plan
          </h2>
          <p className="text-[#7b82a0] text-sm leading-relaxed">
            Tailor-made by our AI for your unique business concept. Browse the strategic modules below, or save it offline.
          </p>
        </div>
      </div>

      {/* Structured Sections list */}
      <div className="space-y-4">
        {parsedSections.map((section, idx) => {
          const isCollapsed = expandedSections[section.title] === false;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[#131928] border border-[#1e2840] rounded-xl overflow-hidden hover:border-[#1e2840]/80 transition duration-150"
            >
              {/* Card Header clickable to collapse/expand */}
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between p-5 text-left bg-[#131928] hover:bg-[#182033] transition duration-150 cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#6c63ff] font-mono select-none">
                    0{idx + 1}
                  </span>
                  <h3 className="font-syne text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
                {isCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-[#7b82a0]" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-[#7b82a0]" />
                )}
              </button>

              {/* Card Content */}
              {!isCollapsed && (
                <div className="p-5 border-t border-[#1e2840]/50 bg-[#0e1322]/50 text-sm leading-relaxed text-[#c8cfe8] whitespace-pre-line font-sans">
                  {section.content}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Download Action Section */}
      <div className="pt-6 text-center flex flex-col items-center justify-center gap-3">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 bg-[#1a2540] hover:bg-[#1e2d50] border border-[#1e2840] text-[#a78bfa] hover:text-white text-sm font-semibold py-3.5 px-6 rounded-xl transition duration-150 cursor-pointer shadow-md"
        >
          <Download className="w-4 h-4" />
          Download Business Plan (.txt)
        </button>
        <span className="text-[11px] text-[#525a75]">
          Includes your original concept information, validation notes, and target customer summaries.
        </span>
      </div>
    </motion.div>
  );
}
