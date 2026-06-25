import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Download, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  MessageSquare, 
  Volume2, 
  Mail, 
  RefreshCw, 
  Send, 
  Printer, 
  Zap, 
  ShieldAlert, 
  TrendingUp, 
  Flame 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserData } from "../types";
import { parsePlan } from "../utils/planParser";

interface StepFullPlanProps {
  userData: UserData;
}

type ActiveTab = "plan" | "swot" | "pitch" | "chat";

export default function StepFullPlan({ userData }: StepFullPlanProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("plan");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  // State for SWOT Analysis
  const [swot, setSwot] = useState<UserData["swot"]>(userData.swot);
  const [isGeneratingSwot, setIsGeneratingSwot] = useState(false);
  
  // State for Pitch & Outreach
  const [pitch, setPitch] = useState<UserData["pitch"]>(userData.pitch);
  const [pitchTone, setPitchTone] = useState<string>("Visionary & Inspiring");
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);

  // State for Co-Pilot Chat
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; text: string }>>([
    { 
      role: "model", 
      text: `Hello! I'm your LaunchMind AI business consultant. I have studied your idea for a **${userData.industry || "startup"}** solving the pain point: *"${userData.problem || "target problem"}"*.\n\nAsk me anything! For example, I can help you formulate marketing slogans, brainstorm custom domains, optimize your starting budget, or map out your launch timeline.` 
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // States for copy feedback
  const [copiedTextType, setCopiedTextType] = useState<string | null>(null);

  const rawPlanText = userData.fullPlan || "";
  const parsedSections = parsePlan(rawPlanText);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  // Load persisted SWOT/Pitch if available in sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("launchmind_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserData;
        if (parsed.swot) setSwot(parsed.swot);
        if (parsed.pitch) setPitch(parsed.pitch);
      } catch (e) {
        console.error("Failed to restore premium data from session", e);
      }
    }
  }, []);

  const saveToSession = (key: "swot" | "pitch", data: any) => {
    const saved = sessionStorage.getItem("launchmind_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserData;
        parsed[key] = data;
        sessionStorage.setItem("launchmind_data", JSON.stringify(parsed));
      } catch (e) {
        console.error("Failed to update session store", e);
      }
    }
  };

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // 1. Download Plan (.txt)
  const handleDownload = () => {
    const textHeader = `LAUNCHMIND — CUSTOM BUSINESS STRATEGY & PLAN\n` + 
      `==================================================\n` + 
      `Venture Idea: ${userData.idea || "Not provided"}\n` + 
      `Industry Segment: ${userData.industry || "Not provided"}\n` + 
      `Startup Capital: ${userData.budget || "Not provided"}\n` + 
      `Target Customer: ${userData.customer || "Not provided"}\n` + 
      `Pain Point Solved: ${userData.problem || "Not provided"}\n` + 
      `==================================================\n\n`;

    let content = textHeader + rawPlanText;

    if (swot) {
      content += `\n\n==================================================\n` +
                 `SWOT ANALYSIS\n` +
                 `==================================================\n` +
                 `STRENGTHS:\n` + swot.strengths.map(s => ` - ${s}`).join("\n") + `\n\n` +
                 `WEAKNESSES:\n` + swot.weaknesses.map(w => ` - ${w}`).join("\n") + `\n\n` +
                 `OPPORTUNITIES:\n` + swot.opportunities.map(o => ` - ${o}`).join("\n") + `\n\n` +
                 `THREATS:\n` + swot.threats.map(t => ` - ${t}`).join("\n") + `\n`;
    }

    if (pitch) {
      content += `\n\n==================================================\n` +
                 `PITCH & OUTREACH MATERIALS (${pitchTone})\n` +
                 `==================================================\n` +
                 `ELEVATOR PITCH:\n${pitch.elevatorPitch}\n\n` +
                 `COLD OUTREACH EMAIL:\n${pitch.coldEmail}\n`;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `LaunchMind-${(userData.industry || "Business-Plan").replace(/[^a-z0-9]/gi, "-")}-Strategy.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 2. Trigger print view
  const handlePrint = () => {
    window.print();
  };

  // 3. Generate SWOT Analysis
  const handleGenerateSwot = async () => {
    setIsGeneratingSwot(true);
    try {
      const res = await fetch("/api/generate-swot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: userData.idea,
          industry: userData.industry,
          customer: userData.customer,
          problem: userData.problem,
        })
      });

      if (!res.ok) throw new Error("Failed to generate SWOT analysis.");
      const data = await res.json();
      setSwot(data);
      saveToSession("swot", data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSwot(false);
    }
  };

  // 4. Generate Pitch & Outreach
  const handleGeneratePitch = async (selectedTone?: string) => {
    const toneToUse = selectedTone || pitchTone;
    setIsGeneratingPitch(true);
    try {
      const res = await fetch("/api/generate-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: userData.idea,
          industry: userData.industry,
          customer: userData.customer,
          problem: userData.problem,
          tone: toneToUse,
        })
      });

      if (!res.ok) throw new Error("Failed to generate pitch.");
      const data = await res.json();
      setPitch(data);
      saveToSession("pitch", data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  // 5. Chat with advisor
  const handleSendChatMessage = async (msgText?: string) => {
    const textToSend = msgText || chatInput;
    if (!textToSend.trim() || isSendingChat) return;

    if (!msgText) setChatInput("");

    const newMessages = [...chatMessages, { role: "user" as const, text: textToSend }];
    setChatMessages(newMessages);
    setIsSendingChat(true);

    try {
      const res = await fetch("/api/chat-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          planContext: `Idea: ${userData.idea}\nIndustry: ${userData.industry}\nBudget: ${userData.budget}\nCustomer: ${userData.customer}\nProblem: ${userData.problem}\n\nPlan:\n${rawPlanText}`,
          chatHistory: newMessages.slice(-5) // Send last few messages for quick local context
        })
      });

      if (!res.ok) throw new Error("Consultation service busy. Please try again.");
      const data = await res.json();
      
      setChatMessages(prev => [...prev, { role: "model", text: data.reply }]);
    } catch (e: any) {
      setChatMessages(prev => [...prev, { role: "model", text: `I encountered an issue connecting. Let me try again if you resend.` }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextType(type);
    setTimeout(() => setCopiedTextType(null), 2000);
  };

  // Pre-seed some click-to-ask suggestions for chat
  const quickPrompts = [
    "💡 Give me 3 brand slogan ideas",
    "🌐 What domain names would suit this?",
    "💸 Best way to spend first $500",
    "🎯 How to get first 10 customers"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-6 text-[#e8eaf6]"
    >
      {/* 1. Confirmed Status Banner */}
      <div className="bg-[#131928] border border-[#22d3a0]/40 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-[#22d3a0]/10 border border-[#22d3a0]/30 flex items-center justify-center text-[#22d3a0] shrink-0">
            <CheckCircle className="w-5.5 h-5.5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#22d3a0] block">
              ✓ Access Confirmed — Full Suite Unlocked
            </span>
            <h2 className="font-syne text-lg sm:text-xl font-bold text-white leading-tight">
              LaunchMind Strategy Suite
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#1e2840]/60 hover:bg-[#1e2840] border border-[#2d3a5a] text-xs font-semibold py-2 px-3.5 rounded-xl transition cursor-pointer"
            title="Print strategy report or save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            Print / PDF
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#1a2540] hover:bg-[#202e52] border border-[#314370] text-xs font-semibold py-2 px-3.5 rounded-xl text-[#a78bfa] hover:text-white transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export All (.txt)
          </button>
        </div>
      </div>

      {/* 2. Premium Feature Tabs Selector */}
      <div className="flex border-b border-[#1e2840] gap-1 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setActiveTab("plan")}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
            activeTab === "plan" 
              ? "bg-[#131928] text-white border-t-2 border-[#6c63ff] px-5" 
              : "text-[#7b82a0] hover:text-slate-300 hover:bg-[#131928]/30"
          }`}
        >
          📋 Business Plan
        </button>
        <button
          onClick={() => {
            setActiveTab("swot");
            if (!swot) handleGenerateSwot();
          }}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
            activeTab === "swot" 
              ? "bg-[#131928] text-white border-t-2 border-[#6c63ff] px-5" 
              : "text-[#7b82a0] hover:text-slate-300 hover:bg-[#131928]/30"
          }`}
        >
          ⚡ Dynamic SWOT
        </button>
        <button
          onClick={() => {
            setActiveTab("pitch");
            if (!pitch) handleGeneratePitch();
          }}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
            activeTab === "pitch" 
              ? "bg-[#131928] text-white border-t-2 border-[#6c63ff] px-5" 
              : "text-[#7b82a0] hover:text-slate-300 hover:bg-[#131928]/30"
          }`}
        >
          📢 Pitch & Outreach
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
            activeTab === "chat" 
              ? "bg-[#131928] text-white border-t-2 border-[#6c63ff] px-5" 
              : "text-[#7b82a0] hover:text-slate-300 hover:bg-[#131928]/30"
          }`}
        >
          💬 AI Co-Pilot Chat
        </button>
      </div>

      {/* 3. Tab Contents Container */}
      <div className="bg-[#131928]/40 border border-[#1e2840]/60 rounded-2xl p-1.5 sm:p-2 min-h-[420px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: Core Business Plan (Collapsible Modules) */}
          {activeTab === "plan" && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 p-1 sm:p-3"
            >
              {parsedSections.map((section, idx) => {
                const isCollapsed = expandedSections[section.title] === false;
                return (
                  <div
                    key={idx}
                    className="bg-[#131928] border border-[#1e2840] rounded-xl overflow-hidden hover:border-[#202b47] transition"
                  >
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-[#172033] transition cursor-pointer focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-[#6c63ff] font-mono select-none">
                          0{idx + 1}
                        </span>
                        <h3 className="font-syne text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                          {section.title}
                        </h3>
                      </div>
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-[#7b82a0]" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-[#7b82a0]" />
                      )}
                    </button>

                    {!isCollapsed && (
                      <div className="p-4 sm:p-5 border-t border-[#1e2840]/40 bg-[#0e1322]/40 text-xs sm:text-sm leading-relaxed text-[#c8cfe8] whitespace-pre-line">
                        {section.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* TAB 2: Dynamic SWOT Grid */}
          {activeTab === "swot" && (
            <motion.div
              key="swot"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 sm:p-4 space-y-5"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#172033]/40 border border-[#1e2840]/30 rounded-xl p-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-syne flex items-center gap-1.5">
                    <Sparkles className="w-4.5 h-4.5 text-[#a78bfa] animate-pulse" />
                    Bento SWOT Analysis
                  </h3>
                  <p className="text-[#7b82a0] text-xs">
                    Dynamic strategic overview balancing internal assets against external vectors.
                  </p>
                </div>
                <button
                  onClick={handleGenerateSwot}
                  disabled={isGeneratingSwot}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#1a2540] hover:bg-[#202e52] border border-[#2d3a5a] text-xs font-bold text-[#a78bfa] hover:text-white py-2 px-4 rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingSwot ? "animate-spin" : ""}`} />
                  {swot ? "Regenerate" : "Generate Now"}
                </button>
              </div>

              {isGeneratingSwot ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-10 h-10 border-4 border-[#6c63ff]/20 border-t-[#6c63ff] rounded-full animate-spin" />
                  <p className="text-xs text-[#7b82a0] animate-pulse font-mono">Running cross-industry threat matrix equations...</p>
                </div>
              ) : swot ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="bg-[#112420]/30 border border-emerald-500/20 rounded-xl p-5 hover:border-emerald-500/40 transition">
                    <div className="flex items-center gap-2 mb-3.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <h4 className="font-syne text-xs font-bold uppercase tracking-wider text-emerald-300">Strengths</h4>
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-300 list-disc list-inside">
                      {swot.strengths.map((pt, i) => (
                        <li key={i} className="leading-relaxed"><span className="text-[#e8eaf6]">{pt}</span></li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-[#2a1b1b]/30 border border-red-500/20 rounded-xl p-5 hover:border-red-500/40 transition">
                    <div className="flex items-center gap-2 mb-3.5">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                        <Flame className="w-4 h-4" />
                      </div>
                      <h4 className="font-syne text-xs font-bold uppercase tracking-wider text-red-300">Weaknesses</h4>
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-300 list-disc list-inside">
                      {swot.weaknesses.map((pt, i) => (
                        <li key={i} className="leading-relaxed"><span className="text-[#e8eaf6]">{pt}</span></li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="bg-[#1b223c]/30 border border-indigo-500/20 rounded-xl p-5 hover:border-indigo-500/40 transition">
                    <div className="flex items-center gap-2 mb-3.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <h4 className="font-syne text-xs font-bold uppercase tracking-wider text-indigo-300">Opportunities</h4>
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-300 list-disc list-inside">
                      {swot.opportunities.map((pt, i) => (
                        <li key={i} className="leading-relaxed"><span className="text-[#e8eaf6]">{pt}</span></li>
                      ))}
                    </ul>
                  </div>

                  {/* Threats */}
                  <div className="bg-[#241f12]/30 border border-amber-500/20 rounded-xl p-5 hover:border-amber-500/40 transition">
                    <div className="flex items-center gap-2 mb-3.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <h4 className="font-syne text-xs font-bold uppercase tracking-wider text-amber-300">Threats</h4>
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-300 list-disc list-inside">
                      {swot.threats.map((pt, i) => (
                        <li key={i} className="leading-relaxed"><span className="text-[#e8eaf6]">{pt}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 text-xs">
                  Click the button above to generate a customized SWOT Analysis for your concept.
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: Elevator Pitch & Outreach */}
          {activeTab === "pitch" && (
            <motion.div
              key="pitch"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 sm:p-4 space-y-5"
            >
              {/* Configuration Panel */}
              <div className="bg-[#172033]/40 border border-[#1e2840]/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-syne flex items-center gap-1.5">
                    📢 Startup Communication Suite
                  </h3>
                  <p className="text-[#7b82a0] text-xs">
                    Instantly craft investor-grade elevator pitches and conversion-optimized emails.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Tone selector */}
                  <select
                    value={pitchTone}
                    onChange={(e) => {
                      setPitchTone(e.target.value);
                      handleGeneratePitch(e.target.value);
                    }}
                    className="bg-[#0b0f1a] border border-[#1e2840] text-xs rounded-xl py-2 px-3 focus:outline-none focus:border-[#6c63ff] font-semibold text-slate-300"
                  >
                    <option value="Visionary & Inspiring">🌌 Visionary & Inspiring</option>
                    <option value="Direct, Bold & Punchy">💥 Direct & Bold</option>
                    <option value="Data-Driven & Analytics Focused">📊 Data-Driven</option>
                    <option value="Friendly, Empathetic & Warm">🤝 Empathetic & Warm</option>
                  </select>

                  <button
                    onClick={() => handleGeneratePitch()}
                    disabled={isGeneratingPitch}
                    className="inline-flex items-center justify-center gap-1.5 bg-[#1a2540] hover:bg-[#202e52] border border-[#2d3a5a] text-xs font-bold text-[#a78bfa] hover:text-white py-2 px-4 rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingPitch ? "animate-spin" : ""}`} />
                    Regenerate
                  </button>
                </div>
              </div>

              {isGeneratingPitch ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-10 h-10 border-4 border-[#6c63ff]/20 border-t-[#6c63ff] rounded-full animate-spin" />
                  <p className="text-xs text-[#7b82a0] animate-pulse font-mono">Synthesizing communication metrics in {pitchTone} mode...</p>
                </div>
              ) : pitch ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Pitch 1: 30-Second Elevator spoken pitch */}
                  <div className="bg-[#131928] border border-[#1e2840] rounded-xl p-5 relative group">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1e2840]/50">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-[#a78bfa]" />
                        <h4 className="font-syne text-xs font-bold uppercase tracking-wider text-white">Elevator Pitch (Spoken)</h4>
                      </div>
                      <button
                        onClick={() => copyToClipboard(pitch.elevatorPitch, "pitch")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                        title="Copy elevator pitch to clipboard"
                      >
                        {copiedTextType === "pitch" ? <Check className="w-4.5 h-4.5 text-[#22d3a0]" /> : <Copy className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-[#c8cfe8] whitespace-pre-line italic">
                      "{pitch.elevatorPitch}"
                    </p>
                    {copiedTextType === "pitch" && (
                      <span className="absolute bottom-4 right-4 text-[10px] text-[#22d3a0] font-bold bg-[#112420] border border-emerald-500/20 px-2 py-0.5 rounded">
                        Copied Pitch!
                      </span>
                    )}
                  </div>

                  {/* Pitch 2: Cold Email Outreach template */}
                  <div className="bg-[#131928] border border-[#1e2840] rounded-xl p-5 relative group">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1e2840]/50">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#a78bfa]" />
                        <h4 className="font-syne text-xs font-bold uppercase tracking-wider text-white">Cold Outreach Email</h4>
                      </div>
                      <button
                        onClick={() => copyToClipboard(pitch.coldEmail, "email")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                        title="Copy email template"
                      >
                        {copiedTextType === "email" ? <Check className="w-4.5 h-4.5 text-[#22d3a0]" /> : <Copy className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                    <pre className="text-xs leading-relaxed text-[#c8cfe8] whitespace-pre-wrap font-sans">
                      {pitch.coldEmail}
                    </pre>
                    {copiedTextType === "email" && (
                      <span className="absolute bottom-4 right-4 text-[10px] text-[#22d3a0] font-bold bg-[#112420] border border-emerald-500/20 px-2 py-0.5 rounded">
                        Copied Email!
                      </span>
                    )}
                  </div>

                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 text-xs">
                  Generate the communication suite by clicking the button or regenerating.
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: Co-Pilot AI Chat */}
          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-1 sm:p-3 flex flex-col h-[440px]"
            >
              {/* Messages viewport */}
              <div className="flex-grow overflow-y-auto p-3 space-y-4 max-h-[300px] bg-[#0c101c]/60 rounded-xl border border-[#1e2840]/40 scrollbar-none mb-3">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#6c63ff] text-white rounded-tr-none"
                          : "bg-[#182033] border border-[#253252]/40 text-[#c8cfe8] rounded-tl-none whitespace-pre-line"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isSendingChat && (
                  <div className="flex justify-start">
                    <div className="bg-[#182033] border border-[#253252]/40 text-slate-400 text-xs rounded-2xl p-3.5 rounded-tl-none flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Instant click seed buttons (only show when input is empty and no user messages yet or just started) */}
              {chatMessages.length === 1 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {quickPrompts.map((qp, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendChatMessage(qp.replace(/^[^a-zA-Z]*/, ""))}
                      className="text-left bg-[#131928] hover:bg-[#182033] border border-[#1e2840] text-[10px] sm:text-xs text-[#a78bfa] hover:text-white p-2 rounded-xl transition cursor-pointer truncate"
                    >
                      {qp}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage();
                }}
                className="flex items-center gap-2 bg-[#0c101c] border border-[#1e2840] rounded-xl p-1.5"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question about your business plan..."
                  className="flex-grow bg-transparent text-xs py-2 px-3 border-0 focus:outline-none focus:ring-0 text-[#e8eaf6]"
                  disabled={isSendingChat}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isSendingChat}
                  className="w-9 h-9 bg-[#6c63ff] hover:bg-[#574feb] disabled:bg-[#1a2030] disabled:text-[#424c69] rounded-lg flex items-center justify-center text-white transition cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Invisible Printable Layout wrapper for corporative-styled PDF export */}
      <div className="hidden print:block fixed inset-0 bg-white text-[#111111] p-12 z-50 overflow-y-auto font-serif">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="border-b-4 border-[#111111] pb-6 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight font-serif uppercase">LaunchMind Custom Business Strategy</h1>
            <p className="text-xs uppercase tracking-widest mt-2 text-gray-500 font-sans">Corporate Intelligence Plan &copy; 2026</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-sans bg-gray-100 p-4 rounded border border-gray-300">
            <div>
              <strong>VENTURE CONCEPT:</strong> {userData.idea || "N/A"}<br />
              <strong>SECTOR SEGMENT:</strong> {userData.industry || "N/A"}<br />
              <strong>TARGET AUDIENCE:</strong> {userData.customer || "N/A"}
            </div>
            <div>
              <strong>STARTING CAPITAL:</strong> {userData.budget || "N/A"}<br />
              <strong>CORE PROBLEM:</strong> {userData.problem || "N/A"}<br />
              <strong>DOCKET STATUS:</strong> UNLOCKED / CONFIRMED
            </div>
          </div>

          <div className="space-y-6">
            {parsedSections.map((sect, i) => (
              <div key={i} className="space-y-2">
                <h2 className="text-lg font-bold uppercase tracking-wide border-b border-gray-400 pb-1 font-serif">
                  0{i + 1}. {sect.title}
                </h2>
                <p className="text-sm leading-relaxed whitespace-pre-line text-justify font-serif">
                  {sect.content}
                </p>
              </div>
            ))}
          </div>

          {swot && (
            <div className="pt-8 space-y-4 break-before-page">
              <h2 className="text-xl font-bold uppercase tracking-wide border-b-2 border-gray-800 pb-1 font-serif">
                Appendix A: SWOT Analysis Matrix
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold uppercase font-sans">Strengths</h3>
                  <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                    {swot.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase font-sans">Weaknesses</h3>
                  <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                    {swot.weaknesses.map((w, idx) => <li key={idx}>{w}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase font-sans">Opportunities</h3>
                  <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                    {swot.opportunities.map((o, idx) => <li key={idx}>{o}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase font-sans">Threats</h3>
                  <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                    {swot.threats.map((t, idx) => <li key={idx}>{t}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {pitch && (
            <div className="pt-8 space-y-4 break-before-page">
              <h2 className="text-xl font-bold uppercase tracking-wide border-b-2 border-gray-800 pb-1 font-serif">
                Appendix B: Sales & Pitch Communications
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase font-sans">Elevator Pitch</h3>
                  <p className="text-xs italic mt-1 leading-relaxed bg-gray-50 p-3 rounded border border-gray-200">
                    "{pitch.elevatorPitch}"
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase font-sans">Cold Outreach Email Campaign</h3>
                  <pre className="text-xs mt-1 bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-wrap font-mono leading-relaxed">
                    {pitch.coldEmail}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-300 pt-6 text-center text-[10px] text-gray-400 font-sans">
            LAUNCHMIND CONFIDENTIAL DOCUMENTATION &copy; 2026. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>

    </motion.div>
  );
}
