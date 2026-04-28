"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, RefreshCw, Target, Clock, Users } from "lucide-react";

interface AISummary {
  oneLiner: string;
  estimatedImpact: string;
  recommendedAction: string;
  urgencyWindow: string;
}

interface AIInsightCardProps {
  needTitle: string;
  needCategory: string;
  needUrgency: string;
  needDescription: string;
  needQuantity: number;
  needLocation: string;
  needCreatedAt: string;
}

export function AIInsightCard({
  needTitle,
  needCategory,
  needUrgency,
  needDescription,
  needQuantity,
  needLocation,
  needCreatedAt,
}: AIInsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/ai/need-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: needTitle,
          description: needDescription,
          category: needCategory,
          urgency: needUrgency,
          quantity: needQuantity,
          location: needLocation,
          createdAt: needCreatedAt,
        }),
      });
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      setSummary(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !summary && !loading) {
      fetchSummary();
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-indigo-500/20 overflow-hidden">
      {/* Header Toggle */}
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/8 to-blue-500/10 hover:from-indigo-500/15 hover:via-purple-500/12 hover:to-blue-500/15 transition-all group"
      >
        <div className="flex items-center gap-2.5">
          {/* Glowing AI Icon */}
          <div className="relative flex-shrink-0">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-lg bg-indigo-400 blur-sm"
            />
          </div>
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">AI Insight</span>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-white/40" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden bg-indigo-950/20"
          >
            <div className="p-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 rounded skeleton" style={{ width: `${70 + i * 7}%` }} />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-2">
                  <p className="text-xs text-red-400/70 mb-2">Failed to generate insight</p>
                  <button onClick={fetchSummary} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mx-auto">
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                </div>
              ) : summary ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-3"
                >
                  {/* One-liner */}
                  <p className="text-sm font-medium text-white/85 leading-relaxed">{summary.oneLiner}</p>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                      <Users className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-0.5">Impact</p>
                        <p className="text-xs text-white/70">{summary.estimatedImpact}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                      <Target className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-0.5">Action</p>
                        <p className="text-xs text-white/70">{summary.recommendedAction}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                      <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-0.5">Window</p>
                        <p className="text-xs text-amber-300 font-medium">{summary.urgencyWindow}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={fetchSummary}
                    className="flex items-center gap-1.5 text-[11px] text-indigo-400/70 hover:text-indigo-300 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerate insight
                  </button>
                </motion.div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
