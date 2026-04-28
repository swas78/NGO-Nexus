"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, AlertTriangle, TrendingUp, Package, Users } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { Need, Volunteer } from "@/types";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium";
  confidence: number;
  category: string;
}

const PC = {
  critical: { label: "Critical", bg: "bg-red-500/15",   border: "border-red-500/30",   text: "text-red-400",   bar: "bg-red-400" },
  high:     { label: "High",     bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-400", bar: "bg-amber-400" },
  medium:   { label: "Medium",   bg: "bg-blue-500/15",  border: "border-blue-500/30",  text: "text-blue-400",  bar: "bg-blue-400" },
};

const CAT_ICONS: Record<string, React.ReactNode> = {
  volunteer: <Users className="w-4 h-4" />,
  resource:  <Package className="w-4 h-4" />,
  logistics: <TrendingUp className="w-4 h-4" />,
  alert:     <AlertTriangle className="w-4 h-4" />,
};

export function AIRecommendationsPanel({ needs, volunteers }: { needs: Need[]; volunteers: Volunteer[] }) {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [ts, setTs] = useState<Date | null>(null);

  const fetch_ = async () => {
    setLoading(true);
    try {
      const ctx = {
        totalNeeds: needs.filter(n => n.status === "open" || n.status === "in-progress").length,
        criticalNeeds: needs.filter(n => n.urgency === "critical").length,
        categories: Array.from(needs.reduce((m, n) => { m.set(n.category, (m.get(n.category)||0)+1); return m; }, new Map<string,number>())).map(([name,count])=>({name,count})),
        locations: Array.from(new Set(needs.map(n => n.location.address))),
        availableVolunteers: volunteers.filter(v => v.availability === "available").length,
        unresolvedUrgent: needs.filter(n => (n.urgency==="critical"||n.urgency==="high") && n.status!=="fulfilled").length,
      };
      const res = await fetch("/api/ai/recommendations", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(ctx) });
      if (!res.ok) throw new Error();
      setRecs(await res.json());
      setTs(new Date());
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  };

  useEffect(() => { if (needs.length > 0) fetch_(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <GlassCard className="p-6" hover={false}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <motion.div animate={{scale:[1,1.5,1],opacity:[0.4,0,0.4]}} transition={{duration:2.5,repeat:Infinity}} className="absolute inset-0 rounded-xl bg-indigo-400 blur-md" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white/90">AI Recommendations</h2>
            <p className="text-[10px] text-white/35 mt-0.5">{ts ? `Generated ${ts.toLocaleTimeString()}` : "Powered by Gemini"}</p>
          </div>
        </div>
        <button onClick={fetch_} disabled={loading} className="p-2 rounded-lg bg-white/5 border border-white/8 text-white/40 hover:text-white/70 transition-all disabled:opacity-40">
          <RefreshCw className={`w-3.5 h-3.5 ${loading?"animate-spin":""}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i=>(
            <div key={i} className="p-4 rounded-xl border border-white/5 space-y-2">
              <div className="h-4 w-48 rounded skeleton" />
              <div className="h-3 w-full rounded skeleton" />
              <div className="h-3 w-3/4 rounded skeleton" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {recs.map((rec, i) => {
              const pc = PC[rec.priority];
              return (
                <motion.div key={rec.id} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} exit={{opacity:0}} transition={{delay:i*0.1,duration:0.4}}
                  className={`p-4 rounded-xl border ${pc.bg} ${pc.border}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`flex-shrink-0 ${pc.text}`}>{CAT_ICONS[rec.category]||<TrendingUp className="w-4 h-4"/>}</span>
                      <p className="text-sm font-semibold text-white/85 leading-tight">{rec.title}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex-shrink-0 ${pc.bg} ${pc.border} ${pc.text}`}>{pc.label}</span>
                  </div>
                  <p className="text-xs text-white/55 leading-relaxed mb-3">{rec.description}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div className={`h-1 rounded-full ${pc.bar}`} initial={{width:0}} animate={{width:`${rec.confidence}%`}} transition={{duration:0.8,delay:i*0.1+0.3}} style={{opacity:0.7}} />
                    </div>
                    <span className="text-[10px] text-white/30 font-mono">{rec.confidence}% confidence</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {recs.length === 0 && !loading && (
            <p className="py-8 text-center text-sm text-white/30">Click refresh to generate AI recommendations</p>
          )}
        </div>
      )}
    </GlassCard>
  );
}
